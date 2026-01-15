import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { OAUTH_PORT } from "./config.js";

export function startOAuthServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url || "/", `http://localhost:${OAUTH_PORT}`);

      if (url.pathname === "/oauth/callback") {
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(htmlPage("❌ Authorization Failed", `Error: ${error}`));
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }

        if (code) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            htmlPage(
              "✅ Authorization Successful!",
              "You can close this window and return to your terminal."
            )
          );
          server.close();
          resolve(code);
          return;
        }
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    });

    server.on("error", reject);
    server.listen(OAUTH_PORT, () => {
      console.log(`OAuth server listening on port ${OAUTH_PORT}`);
    });
  });
}

function htmlPage(title: string, message: string): string {
  return `
    <html>
      <body style="font-family: system-ui; padding: 40px; text-align: center;">
        <h1>${title}</h1>
        <p>${message}</p>
      </body>
    </html>
  `;
}
