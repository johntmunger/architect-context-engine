import fs from "fs";
import path from "path";
import { IGNORE_DIRS, IGNORE_FILES, TEXT_EXTENSIONS } from "../crawl";
import { TARGET_PATHS } from "../path";

export type RepositoryMatch = {
  path: string;
  lineStart: number;
  lineEnd: number;
  content: string;
};

export type SearchRepositoryResult = {
  query: string;
  matches: RepositoryMatch[];
};

const MAX_FILE_SIZE = 250_000;

function isWithinTargetRoot(
  candidatePath: string,
  targetRoot: string,
): boolean {
  const relativePath = path.relative(targetRoot, candidatePath);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

function searchDirectory(
  directory: string,
  targetRoot: string,
  query: string,
  matches: RepositoryMatch[],
): void {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name) || IGNORE_FILES.has(entry.name)) continue;

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      searchDirectory(fullPath, targetRoot, query, matches);
      continue;
    }

    if (!entry.isFile() || !isWithinTargetRoot(fullPath, targetRoot)) continue;
    if (!TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;

    const stats = fs.statSync(fullPath);
    if (stats.size > MAX_FILE_SIZE) continue;

    const content = fs.readFileSync(fullPath, "utf8");
    const lines = content.split(/\r?\n/);
    const relativePath = path.relative(targetRoot, fullPath);

    lines.forEach((line, index) => {
      if (!line.includes(query)) return;

      matches.push({
        path: relativePath,
        lineStart: index + 1,
        lineEnd: index + 1,
        content: line,
      });
    });
  }
}

export function searchRepository(query: string): SearchRepositoryResult {
  const targetRoot = path.resolve(TARGET_PATHS.root);
  const matches: RepositoryMatch[] = [];

  if (query.length > 0) {
    searchDirectory(targetRoot, targetRoot, query, matches);
  }

  return { query, matches };
}
