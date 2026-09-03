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
- `LATEST_RESPONSE.md`

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

Architect is invoked globally from the repository being analyzed.

### Crawl a Repository

From the target repository:

```bash
architect crawl
```

The crawl command:

1. identifies repository content within the filesystem boundaries
2. collects supported text files
3. constructs a bounded raw corpus
4. sends the corpus to the semantic compression model
5. writes the resulting architectural context to `project-summary.md`

### Start Interactive Reasoning

After a successful crawl:

```bash
architect chat
```

The chat command loads `project-summary.md` as the project's architectural context and opens an interactive terminal conversation.

Type questions or requests directly into the terminal.

To close the session:

```text
exit
```

If `project-summary.md` does not exist, Architect will instruct you to run:

```bash
architect crawl
```

first.

---

## Interactive Chat

The chat layer is deliberately separate from the crawl and compression stages.

```text
project-summary.md
        ↓
   cached context
        ↓
   Claude Sonnet 4.6
        ↓
   Architect response
        ↓
LATEST_RESPONSE.md
```

## Output

Architect produces three generated artifacts in the target repository.

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

It provides the interactive chat layer with a compact representation of how the repository works without requiring the entire repository to be supplied as context.

This file is generated output and is excluded from future crawls.

### `LATEST_RESPONSE.md`

The most recent response produced by `architect chat`.

This provides a persistent artifact of the latest reasoning result that can be opened or previewed independently of the terminal session.

The file is overwritten with each successful chat response.

It is generated output and is excluded from future crawls and version control.

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
│   └── crawl.ts
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

## Setup

Architect currently uses Anthropic's Claude models for semantic
compression and interactive reasoning.

1. Clone the repository.
2. Install dependencies.
3. Create a `.env` file at the root of the Architect installation.
4. Add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_key_here
```

If you use a different `.env` location, update the path in
`lib/config.ts` accordingly.

---

## Using Architect with Another Repository

Architect is designed to operate **on** a repository without becoming part of
that repository.

The Architect installation and the target repository can remain completely
separate. Architect uses the current working directory as the repository being
analyzed.

### Developer Installation

For a developer working directly from the Architect source repository:

```bash
git clone <architect-repository>
cd architect
npm install
npm run build
```

Configure the Architect installation with an Anthropic API key as described in
[Setup](#setup).

If you want the `architect` command available globally during development, the
package can be linked from the Architect repository.

From the Architect directory:

```bash
npm link
```

The resulting `architect` command can then be run from a target repository:

```bash
cd ~/Code/my-project
architect
```

The target repository does not need to contain Architect source code,
dependencies, configuration, or a symlink.

### Side-by-Side Without Linking

Architect can also be used directly from a separate, side-by-side directory
without creating a global link:

```text
~/Code/
├── architect/
└── my-project/
```

Build Architect normally:

```bash
cd ~/Code/architect
npm install
npm run build
```

Then invoke its compiled CLI from the target repository:

```bash
cd ~/Code/my-project
node ../architect/dist/index.js
```

Architect remains in its own directory while operating on `my-project`.

**No symlink, dependency installation, or source-code changes are required in
the target repository.**
