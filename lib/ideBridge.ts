import net from "net";
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

const SOCKET_DIR = path.join(os.homedir(), ".architect");

function getSocketPath(workspacePath: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(workspacePath)
    .digest("hex")
    .slice(0, 16);

  return path.join(SOCKET_DIR, `ide-${hash}.sock`);
}

export function openLatestResponseInIDE(
  latestResponsePath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const workspace = process.cwd();
    const socketPath =
      process.env.ARCHITECT_IDE_SOCKET || getSocketPath(workspace);

    if (!fs.existsSync(socketPath)) {
      reject(
        new Error(`Architect IDE is not running for workspace: ${workspace}`),
      );
      return;
    }

    const socket = net.createConnection(socketPath);

    let response = "";

    socket.on("connect", () => {
      const message = JSON.stringify({
        action: "open",
        workspace,
        path: latestResponsePath,
      });

      socket.write(`${message}\n`);
    });

    socket.on("data", (chunk) => {
      response += chunk.toString();
    });

    socket.on("end", () => {
      try {
        const result = JSON.parse(response);

        if (result.ok) {
          resolve();
        } else {
          reject(
            new Error(
              `Architect IDE rejected the request for workspace: ${workspace}`,
            ),
          );
        }
      } catch (error) {
        reject(error);
      }
    });

    socket.on("error", (error) => {
      reject(error);
    });
  });
}
