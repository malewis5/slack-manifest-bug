export interface ManifestError {
  message: string;
  pointer: string;
}

export interface CreateAppResponse {
  ok: boolean;
  app_id?: string;
  credentials?: {
    client_id: string;
    client_secret: string;
    verification_token: string;
    signing_secret: string;
  };
  oauth_authorize_url?: string;
  team_id?: string;
  team_domain?: string;
  error?: string;
  errors?: ManifestError[];
}

export interface OAuthAccessResponse {
  ok: boolean;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
  bot_user_id?: string;
  app_id?: string;
  team?: { id: string; name: string };
  error?: string;
}

export interface TokenRotateResponse {
  ok: boolean;
  token?: string;
  refresh_token?: string;
  exp?: number;
  error?: string;
}

export interface ManifestValidateResponse {
  ok: boolean;
  error?: string;
  errors?: ManifestError[];
}
