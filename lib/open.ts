import fs from "fs";
import net from "net";
import crypto from "crypto";
import { execFile } from "child_process";
import { LATEST_RESPONSE_PATH } from "./path";

const SOCKET_DIR = `${process.env.HOME}/.architect`;

function getSocketPath(workspacePath: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(workspacePath)
    .digest("hex")
    .slice(0, 16);

  return `${SOCKET_DIR}/ide-${hash}.sock`;
}

export function openLatestResponse(): void {
  if (!fs.existsSync(LATEST_RESPONSE_PATH)) {
    console.error("❌ No latest response found. Run 'architect chat' first.");
    return;
  }

  const workspace = process.cwd();

  const socketPath =
    process.env.ARCHITECT_IDE_SOCKET || getSocketPath(workspace);

  if (!fs.existsSync(socketPath)) {
    console.error(`❌ IDE socket not found: ${socketPath}`);
    return;
  }

  const socket = net.createConnection(socketPath);

  let response = "";

  socket.on("connect", () => {
    socket.write(
      JSON.stringify({
        action: "open",
        workspace,
        path: LATEST_RESPONSE_PATH,
      }),
    );

    socket.end();
  });

  socket.on("data", (chunk) => {
    response += chunk.toString();
  });

  socket.on("end", () => {
    try {
      const result = JSON.parse(response);

      if (result.ok) {
        console.log("📖 Opened latest Architect response in Architect IDE.");
      } else {
        console.error(
          `❌ Architect IDE rejected the request for workspace: ${workspace}`,
        );
      }
    } catch (error) {
      console.error(`❌ Invalid IDE response: ${String(error)}`);
    }
  });

  socket.on("error", (error) => {
    console.error(`❌ IDE socket error: ${error.message}`);
  });
}

function openNative(): void {
  const platform = process.platform;

  if (platform === "darwin") {
    execFile("open", [LATEST_RESPONSE_PATH], (error) => {
      if (error) {
        console.error(`❌ Unable to open latest response: ${error.message}`);
        return;
      }

      console.log("📖 Opened latest Architect response.");
    });

    return;
  }

  if (platform === "linux") {
    execFile("xdg-open", [LATEST_RESPONSE_PATH], (error) => {
      if (error) {
        console.error(`❌ Unable to open latest response: ${error.message}`);
        return;
      }

      console.log("📖 Opened latest Architect response.");
    });

    return;
  }

  if (platform === "win32") {
    execFile("cmd", ["/c", "start", "", LATEST_RESPONSE_PATH], (error) => {
      if (error) {
        console.error(`❌ Unable to open latest response: ${error.message}`);
        return;
      }

      console.log("📖 Opened latest Architect response.");
    });

    return;
  }

  console.error(`❌ Unsupported platform: ${platform}`);
}
