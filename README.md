# slack-dev-platform

Create and install Slack apps programmatically. Brings Vercel-style DX to Slack development.

## Installation

```bash
npm install slack-dev-platform
```

## CLI Usage

```bash
# Run directly with npx
npx slack-dev-platform

# Or add to your project scripts
npm run create-app
```

## Setup

1. Add to `.env.local`:

```bash
SLACK_CONFIG_TOKEN=xoxe.xoxp-...
SLACK_CONFIG_REFRESH_TOKEN=xoxe-1-...
NGROK_AUTHTOKEN=...
```

2. Create a `manifest.json` with your Slack app configuration.

3. Run:

```bash
pnpm run create-app
```

## What it does

1. Starts ngrok tunnel
2. Updates manifest.json URLs with ngrok URL
3. Creates Slack app via Manifest API
4. Opens browser for OAuth installation
5. Saves credentials to `.env.local`

## Library Usage

```typescript
import {
  loadManifest,
  injectNgrokUrl,
  createSlackApp,
  startTunnel,
} from "slack-dev-platform";

const tunnelUrl = await startTunnel();
const manifest = await loadManifest();
const updated = injectNgrokUrl(manifest, tunnelUrl);
const app = await createSlackApp(configToken, updated);
```

## Credentials

After running, `.env.local` will contain:

```
SLACK_APP_ID=A012ABCD0A0
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...
SLACK_BOT_TOKEN=xoxb-...
SLACK_TEAM_ID=T012ABCD
SLACK_TEAM_NAME=Your Workspace
```
