import { compressProject } from "./compress";
import fs from "fs";
import path from "path";

export type CrawledFile = {
  path: string;
  content: string;
};

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".cache",
]);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".yaml",
  ".yml",
  ".toml",
  ".css",
  ".html",
]);

const MAX_FILE_SIZE = 250_000;
const MAX_DIRECTORY_CONTENT_SIZE = 100_000;

const IGNORE_FILES = new Set([
  ".DS_Store",
  "architect-raw-crawl.txt",
  "project-summary.md",
]);

function walkDirectory(dir: string, root: string): string[] {
  const results: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    if (IGNORE_FILES.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      const directorySize = getDirectoryContentSize(fullPath);

      if (directorySize > MAX_DIRECTORY_CONTENT_SIZE) {
        continue;
      }

      results.push(...walkDirectory(fullPath, root));
      continue;
    }

    results.push(relativePath);
  }

  return results;
}

function getDirectoryContentSize(dir: string): number {
  let total = 0;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    if (IGNORE_FILES.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      total += getDirectoryContentSize(fullPath);
    } else {
      total += fs.statSync(fullPath).size;
    }

    if (total > MAX_DIRECTORY_CONTENT_SIZE) {
      return total;
    }
  }

  return total;
}

function readCrawledFiles(files: string[], root: string): CrawledFile[] {
  const results: CrawledFile[] = [];

  for (const relativePath of files) {
    const fullPath = path.join(root, relativePath);
    const extension = path.extname(relativePath).toLowerCase();

    if (!TEXT_EXTENSIONS.has(extension)) continue;

    const stats = fs.statSync(fullPath);

    if (stats.size > MAX_FILE_SIZE) {
      console.log(`⚠️ Skipping large file: ${relativePath}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, "utf8");

    results.push({
      path: relativePath,
      content,
    });
  }

  return results;
}

export async function runCrawl() {
  const projectRoot = process.cwd();

  console.log("🔍 Architect Crawl");
  console.log(`📁 Project: ${projectRoot}`);

  const files = walkDirectory(projectRoot, projectRoot);
  const crawledFiles = readCrawledFiles(files, projectRoot);
  const corpus = formatCorpus(crawledFiles);

  console.log(`📄 Files discovered: ${files.length}`);
  console.log(`📖 Text files read: ${crawledFiles.length}`);
  console.log(`📦 Corpus characters: ${corpus.length}`);

  const estimatedTokens = Math.ceil(corpus.length / 4);

  console.log(`🧮 Estimated tokens: ${estimatedTokens}`);

  const rawCorpusPath = path.join(projectRoot, "architect-raw-crawl.txt");

  fs.writeFileSync(rawCorpusPath, corpus);

  console.log(`📝 Raw corpus written: ${rawCorpusPath}`);

  const semanticSummary = await compressProject(crawledFiles);

  const summaryPath = path.join(projectRoot, "project-summary.md");

  fs.writeFileSync(summaryPath, semanticSummary);

  console.log(`🧠 Semantic summary written: ${summaryPath}`);
}

export function formatCorpus(files: CrawledFile[]): string {
  return files
    .map((file) => `FILE: ${file.path}\n\n${file.content}`)
    .join("\n\n");
}
