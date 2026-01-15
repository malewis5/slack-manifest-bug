#!/usr/bin/env node
import { config } from "dotenv";
import open from "open";

import { ENV_LOCAL_FILE } from "../lib/config.js";
import { loadManifest, injectNgrokUrl } from "../lib/manifest.js";
import { createSlackApp, validateManifest } from "../lib/slack-api.js";
import { startTunnel, stopTunnel } from "../lib/tunnel.js";
import { updateEnvFile, getValidConfigToken } from "../lib/env.js";
import { waitForEnter } from "../lib/utils.js";

// Load .env.local into process.env
config({ path: ".env.local" });

async function main() {
  // 1. Start ngrok tunnel first
  const tunnelUrl = await startTunnel();

  // 2. Get valid config token (refreshing if needed)
  const { token: configToken } = await getValidConfigToken();

  // 3. Load manifest and inject ngrok URLs
  console.log("Loading manifest...");
  const baseManifest = await loadManifest();
  const manifest = injectNgrokUrl(baseManifest, tunnelUrl);
  console.log(`✓ Manifest updated with ngrok URL: ${tunnelUrl}`);

  // 4. Validate manifest before creating
  console.log("Validating manifest...");
  const validateResponse = await validateManifest(configToken, manifest);

  if (!validateResponse.ok) {
    console.error("❌ Manifest validation failed:", validateResponse.error);
    if (validateResponse.errors?.length) {
      console.error("\nErrors:");
      for (const err of validateResponse.errors) {
        console.error(`  • ${err.pointer}: ${err.message}`);
      }
    }
    process.exit(1);
  }
  console.log("✓ Manifest is valid");

  // 5. Create the app
  console.log("Creating Slack app...");
  const createResponse = await createSlackApp(configToken, manifest);

  if (!createResponse.ok || !createResponse.app_id) {
    console.error("❌ Failed to create app:", createResponse.error);
    if (createResponse.errors?.length) {
      console.error("\nErrors:");
      for (const err of createResponse.errors) {
        console.error(`  • ${err.pointer}: ${err.message}`);
      }
    }
    process.exit(1);
  }

  const { app_id, credentials, oauth_authorize_url } = createResponse;

  if (!credentials || !oauth_authorize_url) {
    console.error("❌ Missing credentials or oauth_authorize_url in response");
    process.exit(1);
  }

  console.log(`✓ App created: ${app_id}`);

  // 6. Save credentials to .env.local
  await updateEnvFile(ENV_LOCAL_FILE, {
    SLACK_APP_ID: app_id,
    SLACK_CLIENT_ID: credentials.client_id,
    SLACK_CLIENT_SECRET: credentials.client_secret,
    SLACK_SIGNING_SECRET: credentials.signing_secret,
  });

  console.log("\n" + "=".repeat(60));
  console.log("Ready to install the app!");
  console.log("=".repeat(60));
  console.log(`\nOAuth URL: ${oauth_authorize_url}\n`);

  await waitForEnter("Press Enter to open browser and install the app...");
  await open(oauth_authorize_url);

  // Keep tunnel running for the URLs to work
  console.log("\n⚠️  Keep this terminal open to maintain the ngrok tunnel!");
  console.log("   Press Ctrl+C when done.\n");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
