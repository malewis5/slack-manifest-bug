import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { MANIFEST_FILE } from "./config.js";

export async function loadManifest(): Promise<Record<string, unknown>> {
  if (!existsSync(MANIFEST_FILE)) {
    console.error(`❌ manifest.json not found at ${MANIFEST_FILE}`);
    process.exit(1);
  }

  const content = await readFile(MANIFEST_FILE, "utf-8");
  return JSON.parse(content) as Record<string, unknown>;
}

export function injectNgrokUrl(
  manifest: Record<string, unknown>,
  ngrokUrl: string
): Record<string, unknown> {
  // Deep clone the manifest
  const updated = JSON.parse(JSON.stringify(manifest));

  // 1. Add redirect_urls to oauth_config
  if (!updated.oauth_config) {
    updated.oauth_config = {};
  }
  (updated.oauth_config as Record<string, unknown>).redirect_urls = [
    `${ngrokUrl}/oauth/callback`,
  ];

  // 2. Update slash_commands URLs
  const features = updated.features as Record<string, unknown> | undefined;
  if (features?.slash_commands) {
    const commands = features.slash_commands as Array<Record<string, unknown>>;
    for (const cmd of commands) {
      if (typeof cmd.url === "string") {
        cmd.url = cmd.url.replace(/https?:\/\/[^/]+/, ngrokUrl);
      }
    }
  }

  // 3. Update event_subscriptions.request_url
  const settings = updated.settings as Record<string, unknown> | undefined;
  if (settings?.event_subscriptions) {
    const events = settings.event_subscriptions as Record<string, unknown>;
    if (typeof events.request_url === "string") {
      events.request_url = events.request_url.replace(
        /https?:\/\/[^/]+/,
        ngrokUrl
      );
    }
  }

  // 4. Update interactivity.request_url
  if (settings?.interactivity) {
    const interactivity = settings.interactivity as Record<string, unknown>;
    if (typeof interactivity.request_url === "string") {
      interactivity.request_url = interactivity.request_url.replace(
        /https?:\/\/[^/]+/,
        ngrokUrl
      );
    }
  }

  return updated;
}
