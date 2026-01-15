import ngrok from "@ngrok/ngrok";
import { OAUTH_PORT } from "./config.js";

export async function startTunnel(): Promise<string> {
  const authToken = process.env.NGROK_AUTHTOKEN;
  if (!authToken) {
    console.error("❌ NGROK_AUTHTOKEN is required in .env.local");
    console.error(
      "   Get one from: https://dashboard.ngrok.com/get-started/your-authtoken"
    );
    process.exit(1);
  }

  console.log("Starting ngrok tunnel...");
  const listener = await ngrok.forward({
    addr: OAUTH_PORT,
    authtoken: authToken,
  });

  const url = listener.url();
  if (!url) {
    console.error("❌ Failed to get ngrok URL");
    process.exit(1);
  }

  console.log(`✓ Tunnel established: ${url}`);
  return url;
}

export async function stopTunnel(): Promise<void> {
  await ngrok.disconnect();
}
