import * as vscode from "vscode";
import * as fs from "fs";
import * as net from "net";
import * as os from "os";
import * as path from "path";
import * as crypto from "crypto";

const SOCKET_DIR = path.join(os.homedir(), ".architect");

function getSocketPath(workspacePath: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(workspacePath)
    .digest("hex")
    .slice(0, 16);

  return path.join(SOCKET_DIR, `ide-${hash}.sock`);
}

export function activate(context: vscode.ExtensionContext) {
  startIpcServer(context);
}

async function openFile(filePath: string): Promise<void> {
  try {
    const document = await vscode.workspace.openTextDocument(filePath);

    await vscode.window.showTextDocument(document, {
      preview: false,
      viewColumn: vscode.ViewColumn.Active,
    });
  } catch (error) {
    vscode.window.showErrorMessage(
      `Architect could not open latest response: ${String(error)}`,
    );
  }
}

function startIpcServer(context: vscode.ExtensionContext): void {
  const workspacePath =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null;

  if (!workspacePath) {
    return;
  }

  const socketPath = getSocketPath(workspacePath);

  fs.mkdirSync(SOCKET_DIR, { recursive: true });

  try {
    if (fs.existsSync(socketPath)) {
      fs.unlinkSync(socketPath);
    }
  } catch {
    // Ignore stale socket cleanup errors.
  }

  const server = net.createServer((socket) => {
    let data = "";

    socket.on("data", (chunk) => {
      data += chunk.toString();
    });

    socket.on("end", () => {
      try {
        const request = JSON.parse(data);

        if (request.workspace === workspacePath && request.action === "open") {
          socket.end(
            JSON.stringify({
              ok: true,
              workspace: workspacePath,
            }),
          );

          void openFile(request.path);

          return;
        }

        socket.end(
          JSON.stringify({
            ok: false,
            workspace: workspacePath,
          }),
        );
      } catch (error) {
        socket.end(
          JSON.stringify({
            ok: false,
            error: String(error),
          }),
        );
      }
    });
  });

  server.listen(socketPath);

  context.subscriptions.push({
    dispose: () => {
      server.close();

      try {
        if (fs.existsSync(socketPath)) {
          fs.unlinkSync(socketPath);
        }
      } catch {
        // Ignore cleanup errors.
      }
    },
  });
}