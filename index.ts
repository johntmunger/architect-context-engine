#!/usr/bin/env node

import { runCrawl } from "./lib/crawl";
import { runChat } from "./lib/chat";
import { openLatestResponse } from "./lib/open";

const action = process.argv[2];

async function main() {
  switch (action) {
    case "crawl":
      console.log("Running crawl...");
      await runCrawl();
      break;

    case "chat":
      console.log("Running chat...");
      await runChat();
      break;

    case "open":
      console.log("Opening latest response...");
      openLatestResponse();
      break;

    default:
      console.log("Usage: architect [crawl | chat | open]");
  }
}

main();
