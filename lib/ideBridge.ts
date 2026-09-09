import net from "net";
import fs from "fs";
import os from "os";
import path from "path";

const SOCKET_PATH = path.join(os.homedir(), ".architect", "ide.sock");

export function openLatestResponseInIDE(
  latestResponsePath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(SOCKET_PATH)) {
      reject(
        new Error(
          "Architect IDE is not running. Open Cursor with the Architect IDE extension enabled.",
        ),
      );
      return;
    }

    const socket = net.createConnection(SOCKET_PATH);

    socket.on("connect", () => {
      const message = JSON.stringify({
        action: "openLatestResponse",
        path: latestResponsePath,
      });

      socket.write(`${message}\n`);
      socket.end();

      resolve();
    });

    socket.on("error", (error) => {
      reject(error);
    });
  });
}
