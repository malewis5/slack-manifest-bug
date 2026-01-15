import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { ENV_LOCAL_FILE } from "./config.js";
import { refreshConfigToken } from "./slack-api.js";

export async function loadEnvFile(
  path: string
): Promise<Record<string, string>> {
  if (!existsSync(path)) {
    return {};
  }

  const content = await readFile(path, "utf-8");
  const env: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      const key = trimmed.slice(0, eqIndex);
      let value = trimmed.slice(eqIndex + 1);
      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }

  return env;
}

export async function saveEnvFile(
  path: string,
  env: Record<string, string>
): Promise<void> {
  const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  await writeFile(path, lines.join("\n") + "\n");
}

export async function updateEnvFile(
  path: string,
  updates: Record<string, string>
): Promise<void> {
  const existing = await loadEnvFile(path);
  await saveEnvFile(path, { ...existing, ...updates });
}

export async function getValidConfigToken(): Promise<{
  token: string;
  refreshToken: string;
}> {
  // Get tokens from process.env (loaded from .env.local by dotenv)
  let configToken = process.env.SLACK_CONFIG_TOKEN || "";
  let refreshToken = process.env.SLACK_CONFIG_REFRESH_TOKEN || "";

  if (!configToken && !refreshToken) {
    console.error(
      "❌ Missing SLACK_CONFIG_TOKEN and SLACK_CONFIG_REFRESH_TOKEN in .env.local"
    );
    console.error(
      "   Get them from: https://api.slack.com/reference/manifests#config-tokens"
    );
    process.exit(1);
  }

  // If we have a refresh token, try to rotate to get fresh tokens
  if (refreshToken) {
    console.log("Refreshing config token...");
    const rotateResponse = await refreshConfigToken(refreshToken);

    if (
      rotateResponse.ok &&
      rotateResponse.token &&
      rotateResponse.refresh_token
    ) {
      console.log("✓ Config token refreshed");

      // Update .env.local with new tokens
      await updateEnvFile(ENV_LOCAL_FILE, {
        SLACK_CONFIG_TOKEN: rotateResponse.token,
        SLACK_CONFIG_REFRESH_TOKEN: rotateResponse.refresh_token,
      });

      return {
        token: rotateResponse.token,
        refreshToken: rotateResponse.refresh_token,
      };
    } else if (rotateResponse.error === "token_expired") {
      console.error(
        "❌ Refresh token has expired. Please generate new tokens."
      );
      console.error(
        "   Go to: https://api.slack.com/reference/manifests#config-tokens"
      );
      process.exit(1);
    } else if (!rotateResponse.ok) {
      console.warn(`⚠ Token refresh failed: ${rotateResponse.error}`);
      console.log("  Trying existing config token...");
    }
  }

  if (!configToken) {
    console.error("❌ No valid config token available");
    process.exit(1);
  }

  return { token: configToken, refreshToken };
}
