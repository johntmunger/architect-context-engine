import { execFileSync } from "node:child_process";
import { TARGET_PATHS } from "../path";

export type GitDiffResult = {
  diff: string;
};

export function gitDiff(): GitDiffResult {
  const diff = execFileSync("git", ["diff", "--"], {
    cwd: TARGET_PATHS.root,
    encoding: "utf8",
  });

  return { diff };
}
