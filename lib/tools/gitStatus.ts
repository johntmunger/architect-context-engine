import { execFileSync } from "node:child_process";
import { TARGET_PATHS } from "../path";

export type GitStatusResult = {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  modified: string[];
  untracked: string[];
  deleted: string[];
};

function parseTracking(branchStatus: string): {
  branch: string;
  ahead: number;
  behind: number;
} {
  const [branch, tracking] = branchStatus.split("...");
  const ahead = tracking?.match(/ahead (\d+)/)?.[1];
  const behind = tracking?.match(/behind (\d+)/)?.[1];

  return {
    branch,
    ahead: ahead ? Number(ahead) : 0,
    behind: behind ? Number(behind) : 0,
  };
}

function parsePath(statusLine: string): string {
  const pathText = statusLine.slice(3);
  const renameSeparator = pathText.lastIndexOf(" -> ");

  return renameSeparator >= 0
    ? pathText.slice(renameSeparator + 4)
    : pathText;
}

export function gitStatus(): GitStatusResult {
  const output = execFileSync("git", ["status", "--short", "--branch"], {
    cwd: TARGET_PATHS.root,
    encoding: "utf8",
  });

  const lines = output.split(/\r?\n/).filter(Boolean);
  const branchLine = lines.find((line) => line.startsWith("## ")) ?? "##";
  const tracking = parseTracking(branchLine.slice(3));
  const result: GitStatusResult = {
    ...tracking,
    staged: [],
    modified: [],
    untracked: [],
    deleted: [],
  };

  for (const line of lines) {
    if (line.startsWith("## ")) continue;

    const indexStatus = line[0];
    const worktreeStatus = line[1];
    const filePath = parsePath(line);

    if (indexStatus === "?" && worktreeStatus === "?") {
      result.untracked.push(filePath);
      continue;
    }

    if (indexStatus !== " ") {
      result.staged.push(filePath);
    }

    if (worktreeStatus !== " ") {
      result.modified.push(filePath);
    }

    if (indexStatus === "D" || worktreeStatus === "D") {
      result.deleted.push(filePath);
    }
  }

  return result;
}
