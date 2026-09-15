import {
  ARCHITECT_PATHS,
  getTargetRoot,
} from "./path";

export function runPathsCheck(): void {
  console.log("Architect path ownership");
  console.log("-----------------------");

  console.log("Target root:");
  console.log(`  ${getTargetRoot()}`);

  console.log("\nArchitect state root:");
  console.log(`  ${ARCHITECT_PATHS.state.root}`);

  console.log("\nArchitect-owned artifacts:");
  console.log(`  Raw crawl:       ${ARCHITECT_PATHS.state.rawCrawl}`);
  console.log(`  Project summary: ${ARCHITECT_PATHS.state.projectSummary}`);
  console.log(`  Latest response: ${ARCHITECT_PATHS.state.latestResponse}`);
}
