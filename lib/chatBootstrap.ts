import { runChat } from "./chat";
import { runCrawl } from "./crawl";
import { openLatestResponse } from "./open";

export type BootstrapCommand = "crawl" | "chat" | "open";

export async function runBootstrap(command: BootstrapCommand): Promise<void> {
  switch (command) {
    case "crawl":
      await runCrawl();
      break;

    case "chat":
      await runChat();
      break;

    case "open":
      openLatestResponse();
      break;
  }
}

async function main(): Promise<void> {
  const command = process.argv[2] as BootstrapCommand | undefined;

  if (!command || !["crawl", "chat", "open"].includes(command)) {
    throw new Error("Usage: npm run <crawl|chat|open>");
  }

  await runBootstrap(command);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
