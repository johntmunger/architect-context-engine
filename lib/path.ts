import os from "node:os";
import path from "node:path";

/**
 * The project/workspace Architect was launched against.
 */
export const TARGET_ROOT = process.cwd();

/**
 * Architect's installed/runtime root.
 */
export const ARCHITECT_ROOT = path.resolve(__dirname, "../..");

/**
 * User-owned persistent Architect state.
 */
export const ARCHITECT_STATE_ROOT = path.join(
  os.homedir(),
  ".architect",
);

export const ARCHITECT_PATHS = {
  root: ARCHITECT_ROOT,

  state: {
    root: ARCHITECT_STATE_ROOT,

    rawCrawl: path.join(
      ARCHITECT_STATE_ROOT,
      "architect-raw-crawl.txt",
    ),

    projectSummary: path.join(
      ARCHITECT_STATE_ROOT,
      "project-summary.md",
    ),

    latestResponse: path.join(
      ARCHITECT_STATE_ROOT,
      "LATEST_RESPONSE.md",
    ),
  },
} as const;

export const TARGET_PATHS = {
  root: TARGET_ROOT,
} as const;

export type PathOwner = "architect" | "target";

export function getTargetRoot(): string {
  return TARGET_PATHS.root;
}

export function getArchitectRoot(): string {
  return ARCHITECT_PATHS.root;
}

export function getArchitectStateRoot(): string {
  return ARCHITECT_PATHS.state.root;
}