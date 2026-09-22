#!/usr/bin/env node

import { BootstrapCommand, runBootstrap } from "./lib/chatBootstrap";
import { runPathsCheck } from "./lib/pathsCheck";

const action = process.argv[2] as BootstrapCommand | "paths" | undefined;

async function main() {
  switch (action) {
    case "paths":
      runPathsCheck();
      break;

    case "crawl":
    case "chat":
    case "open":
    case "context":
      await runBootstrap(action);
      break;

    default:
      throw new Error(
        "Usage: architect [crawl | chat | open | context | paths]",
      );
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
