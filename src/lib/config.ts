import { join } from "path";

export const OAUTH_PORT = 3000;
export const ENV_LOCAL_FILE = join(process.cwd(), ".env.local");
export const MANIFEST_FILE = join(process.cwd(), "manifest.json");
