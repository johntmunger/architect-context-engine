# Architect

Architect is a repository-aware AI architecture assistant designed to reason about software projects through controlled information boundaries.

It sits between a software repository and a reasoning model, progressively reducing repository information into a bounded architectural representation that can be used as downstream context.

## What Architect Does

Architect separates four concerns:

1. **Filesystem discovery** — identify repository content within defined boundaries.
2. **Evidence collection** — collect bounded repository files that can serve as architectural evidence.
3. **Semantic compression** — use an AI model to compress that evidence into a high-density architectural representation.
4. **Downstream reasoning** — provide the resulting project knowledge to future reasoning workflows.

The goal is not to send an entire repository to an LLM.

The goal is to establish a useful architectural evidence boundary first, then reason over the resulting representation.

---

## Architecture

```text
Repository
    ↓
Filesystem Boundary
    ↓
Relevant Files
    ↓
Raw Corpus
    ↓
Semantic Processing Boundary
    ↓
Compressed Project Knowledge
    ↓
Reasoning Context
```

Each stage reduces or transforms information for a specific reason.

| Concern              | Why reduce unnecessary data?                            |
| -------------------- | ------------------------------------------------------- |
| **Speed**            | Less data to read, transmit, process, and return        |
| **Cost**             | Fewer input/output tokens                               |
| **Context capacity** | More room for the actual reasoning task                 |
| **Privacy / safety** | Avoid sending information that isn't needed             |
| **Security**         | Reduce unnecessary exposure across an API boundary      |
| **Reliability**      | Less irrelevant material competing for model attention  |
| **Caching**          | Smaller, more stable context is easier to reuse         |
| **Change detection** | Easier to determine what actually requires regeneration |

---

## Information Boundaries

Architect is not designed only to reduce LLM token usage or API cost.

A central architectural goal is controlling how much information crosses each boundary of the system.

> **"Can we send it?" is not the same question as "Should we send it?"**

A repository may contain substantially more information than a downstream model needs in order to reason effectively about its architecture.

Architect therefore establishes filesystem and content boundaries before semantic processing occurs.

---

## Crawl Boundaries

Architect applies multiple boundaries while discovering repository content.

### Ignored Directories

The crawler does not descend into directories such as:

- `node_modules`
- `.git`
- `.next`
- `dist`
- `build`
- `.cache`

These are implementation, build, cache, or version-control artifacts rather than primary architectural evidence.

### Directory Content Ceiling

A directory with more than **100,000 bytes of aggregate file content** is excluded before Architect descends into it.

This is a generic boundary rather than a repository-specific exclusion.

The crawler evaluates filesystem metadata before reading file contents, allowing large content trees to be rejected without adding their contents to the raw corpus.

### File Content Ceiling

Individual files larger than **250,000 bytes** are skipped.

### Supported Text Files

Architect currently considers these extensions for text collection:

```text
.ts
.tsx
.js
.jsx
.json
.md
.yaml
.yml
.toml
.css
.html
```

### Generated Architect Artifacts

Architect excludes its own generated artifacts from subsequent crawls:

- `architect-raw-crawl.txt`
- `project-summary.md`

This prevents generated context from feeding back into the next architectural analysis.

---

## Semantic Compression

After filesystem discovery, Architect constructs a raw repository corpus and sends that evidence to a semantic compression model.

The current implementation uses:

```text
Claude Haiku 4.5
claude-haiku-4-5-20251001
```

The compression stage is intentionally architecture-focused.

It prioritizes:

- project purpose
- repository structure
- components and relationships
- data and control flows
- interfaces and contracts
- execution and authority boundaries
- dependencies
- repository-specific patterns
- architectural decisions and constraints
- important files

It deliberately compresses information below the level required for architectural reasoning.

The model is instructed to:

- use repository evidence only
- avoid inventing behavior or relationships
- preserve important architectural relationships
- avoid reproducing source code
- avoid summarizing every file independently
- omit repetitive implementation detail

The objective is:

> Produce the smallest faithful architectural representation that allows downstream reasoning about the repository.

The output limit is intentionally a ceiling rather than a target. Different repositories may require different amounts of architectural representation.

---

## Usage

From a repository:

```bash
architect crawl
```

Architect runs the repository crawl and semantic compression pipeline.

The current CLI entry point supports:

```text
architect crawl
```

---

## Output

Architect currently produces two files in the target repository.

### `architect-raw-crawl.txt`

The bounded raw evidence corpus collected from the repository.

This is useful for:

- inspecting what information crossed the filesystem boundary
- debugging crawler behavior
- comparing corpus size between runs
- validating directory and file exclusions

This file is generated output and is excluded from future crawls.

### `project-summary.md`

The semantically compressed architectural representation produced by the compression model.

This is the primary reusable architectural artifact.

It is intended to provide downstream systems with a compact representation of how the repository works without requiring the entire repository to be supplied as context.

This file is also generated output and is excluded from future crawls.

---

## Development

Install dependencies:

```bash
npm install
```

Build the TypeScript project:

```bash
npm run build
```

The build compiles the TypeScript source into `dist/` and marks the CLI entry point as executable.

Development execution:

```bash
npm run dev
```

The package exposes the CLI through:

```text
architect
```

with the executable mapped to:

```text
dist/index.js
```

---

## Project Structure

```text
architect/
├── index.ts
├── lib/
│   ├── chat.ts
│   ├── compress.ts
│   ├── config.ts
│   ├── crawl.ts
│   └── watch.ts
├── dist/
├── docs/
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### Core Components

**`index.ts`**

CLI entry point and command dispatch.

**`lib/crawl.ts`**

Filesystem discovery, crawl boundaries, file filtering, raw corpus construction, and orchestration of semantic compression.

**`lib/compress.ts`**

Anthropic model integration and architecture-focused semantic compression.

**`lib/config.ts`**

Runtime configuration and environment handling.

**`lib/chat.ts`**

Chat/reasoning functionality built around generated project context.

**`lib/watch.ts`**

Repository watch functionality for triggering project processing as files change.

---

## Design Philosophy

Architect treats information management as an architectural concern.

The important question is not simply whether information can cross an API or model boundary.

It is whether that information should cross the boundary at all.

```text
More Repository Information
            ↓
     Boundary Decisions
            ↓
   Relevant Evidence
            ↓
   Semantic Compression
            ↓
  Architectural Knowledge
            ↓
     Better Reasoning
```

Architect therefore favors explicit boundaries, evidence-based transformation, and controlled context over indiscriminate repository ingestion.

The system is designed around a simple principle:

> **Control the information before asking the model to reason about it.**
