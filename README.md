# Enterprise Grid: `scope_not_allowed_on_enterprise` with `apps.manifest.create`

## Summary

When creating a Slack app via the `apps.manifest.create` API on an Enterprise Grid workspace, the returned `oauth_authorize_url` fails with `scope_not_allowed_on_enterprise` during installation. The **exact same manifest** works perfectly when creating the app via the Slack web UI.

## Environment

- Enterprise Grid workspace
- Manifest has `org_deploy_enabled: false` (workspace-level app, not org-level)
- Using config tokens from `tooling.tokens.rotate`

## Steps to Reproduce

### 1. Create app via API

```bash
POST https://slack.com/api/apps.manifest.create
Authorization: Bearer {config_token}
Content-Type: application/json; charset=utf-8

{
  "manifest": {
    "_metadata": { "major_version": 1, "minor_version": 1 },
    "display_information": { "name": "Test App" },
    "features": {
      "bot_user": { "display_name": "Test App", "always_online": true }
    },
    "oauth_config": {
      "scopes": {
        "bot": ["channels:history", "chat:write", "commands"]
      }
    },
    "settings": {
      "org_deploy_enabled": false,
      "socket_mode_enabled": false,
      "token_rotation_enabled": false
    }
  }
}
```

### 2. Response

```json
{
  "ok": true,
  "app_id": "A0A8QJFPA3F",
  "credentials": {
    "client_id": "9103674572624.10296627792117",
    "client_secret": "...",
    "verification_token": "...",
    "signing_secret": "..."
  },
  "oauth_authorize_url": "https://slack.com/oauth/v2/authorize?client_id=9103674572624.10296627792117&scope=channels:history,chat:write,commands",
  "team_id": "E0931KUGUJC",
  "team_domain": "vercel-slack-agents"
}
```

### 3. Navigate to `oauth_authorize_url`

**Result:** `scope_not_allowed_on_enterprise` error

## Working Case: Web UI

When creating the app via the Slack web UI (api.slack.com) with the **exact same manifest JSON**, installation works fine.

### Key Difference

The web UI generates a different OAuth URL format:

|            | API `oauth_authorize_url` | Web UI Install URL         |
| ---------- | ------------------------- | -------------------------- |
| **Host**   | `slack.com`               | `{workspace-id}.slack.com` |
| **Path**   | `/oauth/v2/authorize`     | `/oauth`                   |
| **Params** | `client_id`, `scope` only | Many additional params     |

**Web UI URL example:**

```
https://e0931kugujc-zg1ddxk7.slack.com/oauth?client_id=...&scope=...&granular_bot_scope=1&single_channel=0&install_redirect=install-on-team&tracked=1&team=1
```

## Expected Behavior

The `oauth_authorize_url` returned by `apps.manifest.create` should work for workspace-level installation on Enterprise Grid when `org_deploy_enabled: false`.

## Files

- `manifest.json` - The manifest being used
- `src/lib/slack-api.ts` - API call implementation
- `src/cli/create-app.ts` - Full flow
