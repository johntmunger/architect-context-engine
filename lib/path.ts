import path from "path";

export const TARGET_ROOT = process.cwd();

export const ARCHITECT_ROOT = path.resolve(__dirname, "../..");

export const RAW_CORPUS_PATH = path.join(
  ARCHITECT_ROOT,
  "architect-raw-crawl.txt",
);

export const PROJECT_SUMMARY_PATH = path.join(
  ARCHITECT_ROOT,
  "project-summary.md",
);

export const LATEST_RESPONSE_PATH = path.join(
  ARCHITECT_ROOT,
  "LATEST_RESPONSE.md",
);
