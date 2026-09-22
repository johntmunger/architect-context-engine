import { runChat } from "./chat";
import { runCrawl } from "./crawl";
import { runContext } from "./context";
import { openLatestResponse } from "./open";

export type BootstrapCommand = "crawl" | "chat" | "open" | "context";

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

    case "context":
      await runContext();
      break;
  }
}

async function main(): Promise<void> {
  const command = process.argv[2] as BootstrapCommand | undefined;

  if (!command || !["crawl", "chat", "open", "context"].includes(command)) {
    throw new Error("Usage: npm run <crawl|chat|open|context>");
  }

  await runBootstrap(command);
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
