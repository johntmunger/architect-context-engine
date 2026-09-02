# Architect: Architectural Compression

## Project Purpose

Architect is a **repository-aware AI architecture assistant** that controls information flow across system boundaries. It functions as an information-management layer between software repositories and LLM reasoning models, progressively reducing and structuring data before it crosses each boundary.

The guiding principle: *"Can we send it?" is not the same question as "Should we send it?"*

---

## Architectural Layers

### 1. **Global Installation & Environment**
- **Single Architect instance** at `~/Code/architect` serves all repositories
- **NVM-managed Node.js** (user-owned at `~/.nvm`) provides runtime
- **npm link symlink** exposes CLI globally without per-repository copies
- **Context**: `process.cwd()` determines which repository Architect analyzes

### 2. **Source & Runtime Boundary**
- **TypeScript source** (`lib/`) with modular feature files
- **Compiled JavaScript** (`dist/`) executes as global CLI
- Build step creates executable entry point

### 3. **Information Reduction Pipeline** (Core Architecture)

```
Repository Files
    ↓ [Filesystem Boundary]
Relevant Files (filtered by extension, size, ignored dirs)
    ↓ [Raw Corpus Assembly]
Concatenated evidence with FILE: markers
    ↓ [Semantic Processing Boundary]
Claude Haiku Compression Engine
    ↓ [Compressed Knowledge]
Architectural Summary (project-summary.md)
    ↓ [Reasoning Boundary]
Downstream AI Reasoning Layer
```

Each reduction stage has explicit rationale: speed, cost, context capacity, privacy/safety, security, reliability, caching efficiency, change detection.

### 4. **Command Interface**
- **crawl**: filesystem discovery → raw corpus → semantic compression
- **chat**: interactive reasoning with cached project context (planned)
- **watch**: file monitoring → auto-recompression on changes (planned)
- **clean**: artifact cleanup (planned)

---

## Major Components

### **Filesystem Crawler** (`lib/crawl.ts`)
**Responsibility**: Discover and filter repository contents; assemble raw corpus

**Filtering Strategy**:
- **Ignored directories** (blacklist): `node_modules`, `.git`, `.next`, `dist`, `build`, `.cache`
- **Allowed extensions** (whitelist): `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md`, `.yaml`, `.yml`, `.toml`, `.css`, `.html`
- **File size limit**: 250 KB per file
- **Ignored files**: `.DS_Store`

**Output Artifacts**:
- `architect-raw-crawl.txt`: Raw corpus with `FILE: path` markers (audit trail)
- Statistics logged to stdout (file count, token estimate)

### **Semantic Compressor** (`lib/compress.ts`)
**Responsibility**: LLM-powered architectural extraction

**Processing**:
- Receives filtered `CrawledFile[]` array
- Formats corpus with path headers
- Submits to Claude Haiku-4-5 with architectural system prompt
- Max output: 4000 tokens

**System Role Instruction**:
Extracts and preserves project purpose, layers, components, relationships, interfaces, dependencies, data flow, and decisions—**not code reproduction**.

**Output**: `project-summary.md` (semantic architectural summary)

### **Configuration** (`lib/config.ts`)
**Responsibility**: Environment-based credential management

- Loads `.env` file at module initialization
- Validates `ANTHROPIC_API_KEY` presence
- Throws early if missing (fail-fast principle)

### **CLI Router** (`index.ts`)
**Responsibility**: Command dispatch

- Maps `process.argv[2]` to command handlers
- Currently implements `crawl` action
- Extensible for planned commands

---

## Relationships Between Components

```
User invokes: architect crawl [in project directory]
    ↓
CLI Router (index.ts)
    ↓
Crawl Handler (lib/crawl.ts)
    ├─→ walkDirectory() — recursive filesystem traversal
    ├─→ readCrawledFiles() — load content with filters
    ├─→ formatCorpus() — assemble marked blocks
    ├─→ write architect-raw-crawl.txt (debug artifact)
    └─→ Compressor (lib/compress.ts)
            ├─→ load Config (API key)
            ├─→ format corpus with FILE: headers
            ├─→ call Claude Haiku API
            └─→ write project-summary.md (semantic output)
```

**Data Flow**:
1. Filesystem → Crawler filter pipeline → Raw text array
2. Raw array → Corpus formatter → String buffer
3. Buffer → Compressor → Claude Haiku LLM
4. LLM response → File writer → `project-summary.md`

---

## Runtime Boundaries

### **Filesystem Boundary**
- Read-only traversal from `process.cwd()` down
- Size and type filtering applied before content load
- Artifacts written to project directory

### **Semantic Processing Boundary** (API/LLM)
- Only **relevant, pre-filtered files** cross this boundary—not raw repository
- Compression reduces input volume and noise
- Explicit reasoning prompt prevents code reproduction
- Enables downstream prompt caching for efficiency

### **Installation Boundary**
- Global npm-linked binary avoids per-repository setup
- User-owned NVM environment prevents permission escalation issues

---

## Contracts & Interfaces

### **CrawledFile Type**
```typescript
type CrawledFile = {
  path: string;       // relative path from project root
  content: string;    // full file contents
}
```

### **Compressor Function**
```typescript
async compressProject(files: CrawledFile[]): Promise<string>
```
Input: filtered file array  
Output: semantic architectural summary text

### **Crawl Function**
```typescript
async function runCrawl(): Promise<void>
```
Side effects: writes artifacts to disk, logs to stdout

### **Corpus Formatter**
```typescript
function formatCorpus(files: CrawledFile[]): string
```
Converts `CrawledFile[]` to marked-up text block (reusable utility)

---

## Important Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `@anthropic-ai/sdk` | Claude API client with type safety | ^0.121.0 |
| `dotenv` | `.env` file loading | ^17.4.2 |
| `typescript` | Language, type checking, compilation | ^7.0.2 |
| `tsx` | TypeScript runtime execution | ^4.23.12 |
| `@types/node` | Node.js standard library types | ^26.4.0 |

---

## Data Flow

**Execution Sequence (crawl command)**:

1. **Discovery** (filesystem walk)
   - Recursive traversal from `process.cwd()`
   - Skip blacklisted directories early
   - Collect relative paths of eligible files

2. **Filtering** (content validation)
   - Check file extension whitelist
   - Enforce 250 KB size limit
   - Load content into memory

3. **Corpus Assembly**
   - Format as `FILE: <path>\n\n<content>` blocks
   - Concatenate all blocks
   - Write raw corpus to disk (audit trail)

4. **Compression** (LLM call)
   - Package `CrawledFile[]` array
   - Format for API (corpus string)
   - Call Claude Haiku with system prompt
   - Receive architectural summary

5. **Output** (artifact creation)
   - Write semantic summary to `project-summary.md`
   - Log completion and token counts

---

## External Systems

### **Claude API** (Anthropic)
- **Model**: `claude-haiku-4-5-20251001`
- **Role**: Semantic compression engine
- **Input contract**: Raw repository corpus
- **Output contract**: Architectural summary text
- **Authentication**: `ANTHROPIC_API_KEY` from environment

### **Node.js Runtime** (via NVM)
- Executes TypeScript (via `tsx`)
- Provides filesystem and OS APIs
- Supplies npm for package management

---

## Significant Architectural Decisions

### **1. Global Single Installation**
- One Architect binary serves all repositories
- Invoked from project directory via `process.cwd()`
- Avoids duplication, ensures consistency
- Reduces maintenance and setup burden

### **2. Progressive Information Reduction**
- Multiple filtering stages before API boundary
- Rationale: privacy, cost, context efficiency, reliability
- Explicit system prompt guides extraction (not reproduction)
- Enables downstream caching and reuse

### **3. User-Owned Environment**
- NVM (user's `~/.nvm`) instead of system Node.js
- npm link symlink instead of package copies
- Avoids EACCES permission errors
- Better isolation and control

### **4. Build/Runtime Separation**
- TypeScript source (`lib/`) for development
- Compiled JavaScript (`dist/`) for execution
- Executable flag set during build
- Enables fast startup and CLI portability

### **5. Modular Command Architecture**
- CLI router dispatches to independent handlers
- Each command (crawl, chat, watch, clean) is self-contained
- Allows incremental development and testing

### **6. System Prompt as Architecture Guard**
- Compressor uses explicit reasoning instructions
- Directs model to extract architecture, not code
- Prevents hallucination and noise
- Ensures consistent, focused summaries

---

## Extension Points & Future Capabilities

- **chat**: Interactive console with Claude Sonnet 4.5 + prompt caching (90% API discount)
- **watch**: File system monitoring with debouncing to auto-trigger compression
- **clean**: Artifact deletion and workspace reset
- **Model selection**: Configurable model choice (Haiku vs. Sonnet)
- **Cache management**: Heartbeat mechanisms to maintain prompt cache windows
- **Response persistence**: Store `LATEST_RESPONSE.md` for IDE integration