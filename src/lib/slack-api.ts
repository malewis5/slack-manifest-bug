import type {
  CreateAppResponse,
  ManifestValidateResponse,
  OAuthAccessResponse,
  TokenRotateResponse,
} from "./types.js";

export async function refreshConfigToken(
  refreshToken: string
): Promise<TokenRotateResponse> {
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://slack.com/api/tooling.tokens.rotate", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  return response.json() as Promise<TokenRotateResponse>;
}

export async function validateManifest(
  configToken: string,
  manifest: Record<string, unknown>
): Promise<ManifestValidateResponse> {
  const response = await fetch("https://slack.com/api/apps.manifest.validate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ manifest }),
  });
  return response.json() as Promise<ManifestValidateResponse>;
}

export async function createSlackApp(
  configToken: string,
  manifest: Record<string, unknown>
): Promise<CreateAppResponse> {
  const response = await fetch("https://slack.com/api/apps.manifest.create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ manifest }),
  });
  return response.json() as Promise<CreateAppResponse>;
}

export async function exchangeCodeForToken(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<OAuthAccessResponse> {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  return response.json() as Promise<OAuthAccessResponse>;
}
