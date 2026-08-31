#!/usr/bin/env node

import { runCrawl } from "./lib/crawl";

const action = process.argv[2];

async function main() {
  switch (action) {
    case "crawl":
      console.log("Running crawl...");
      await runCrawl();
      break;

    default:
      console.log("Usage: architect [crawl]");
  }
}

main();
