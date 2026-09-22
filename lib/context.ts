import fs from "fs";
import { compressProject } from "./compress";
import { runCrawl } from "./crawl";
import { ARCHITECT_PATHS } from "./path";

export async function runContext(): Promise<void> {
  const crawledFiles = await runCrawl();
  const semanticSummary = await compressProject(crawledFiles);

  fs.writeFileSync(ARCHITECT_PATHS.state.projectSummary, semanticSummary);

  console.log(
    `🧠 Semantic summary written: ${ARCHITECT_PATHS.state.projectSummary}`,
  );
}
