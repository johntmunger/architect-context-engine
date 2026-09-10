# Architect

Architect is a repository-aware AI architecture assistant for understanding software projects through **controlled information boundaries**.

It does not send an entire repository directly to an LLM.

Instead, Architect progressively reduces a repository into a bounded, evidence-based architectural representation and then uses that representation for interactive reasoning.

The core principle is:

> **Control the information before asking the model to reason about it.**

---

## What Architect Does

Architect separates repository understanding into distinct stages:

1. **Filesystem discovery** — identify repository content within explicit boundaries.
2. **Evidence collection** — collect bounded files that can serve as architectural evidence.
3. **Semantic compression** — compress that evidence into a high-density architectural representation.
4. **Interactive reasoning** — reason over the resulting project knowledge rather than indiscriminately over the entire repository.
5. **IDE delivery** — make the latest reasoning result available as a persistent Markdown artifact that can be opened directly in the active IDE.

The result is a workflow that is designed to preserve architectural signal while controlling unnecessary repository information.

---

## Architecture

```text
                    Target Repository
                           │
                           ▼
                  Filesystem Discovery
                           │
                           ▼
                    Bounded Evidence
                           │
                           ▼
                  Raw Crawl Corpus
                           │
                           ▼
                 Semantic Compression
                           │
                           ▼
                 project-summary.md
                           │
                           ▼
                  Interactive Reasoning
                           │
                           ▼
                 LATEST_RESPONSE.md
                           │
                           ▼
                       IDE Bridge
```

Each boundary exists for a reason.

| Boundary | Purpose |
| --- | --- |
| Filesystem | Prevent unnecessary repository content from entering the corpus |
| Evidence | Establish the actual material available for architectural analysis |
| Compression | Reduce implementation detail while preserving architectural relationships |
| Reasoning | Give the model a bounded representation rather than the raw repository |
| Artifact | Preserve the latest result independently of the interactive session |
| IDE | Deliver the result into the workspace where Architect was invoked |

This improves more than token efficiency.

Controlled information can improve **speed, cost, context capacity, reliability, privacy, security, caching, and reasoning quality**.

---

## Information Boundaries

A repository may contain substantially more information than a model needs to understand its architecture.

Architect therefore asks two different questions:

> **Can we send it?**

and:

> **Should we send it?**

Those are not the same question.

Architect establishes filesystem and content boundaries **before** semantic processing occurs.

This makes information selection an explicit part of the architecture rather than an accidental consequence of model context limits.

---

## Crawl Boundaries

The crawler applies several boundaries while discovering repository content.

### Ignored Directories

Architect does not descend into directories such as:

- `node_modules`
- `.git`
- `.next`
- `dist`
- `build`
- `.cache`

These generally represent dependencies, build output, generated content, caches, or version-control data rather than primary architectural evidence.

### Directory Content Ceiling

A directory with more than **100,000 bytes of aggregate file content** is excluded before Architect descends into it.

This is a generic boundary rather than a repository-specific exclusion.

The crawler evaluates filesystem information before reading the contents of a large directory tree, allowing oversized areas to be rejected without adding their contents to the raw corpus.

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

This prevents generated context from feeding back into subsequent architectural analysis.

---

## Semantic Compression

After filesystem discovery, Architect constructs a bounded raw repository corpus.

That corpus is then passed to a semantic compression model whose job is to preserve **architecturally meaningful information** while removing unnecessary implementation detail.

The current compression model is:

```text
Claude Haiku 4.5
claude-haiku-4-5-20251001
```

The compression stage prioritizes:

- project purpose
- repository structure
- components and relationships
- data flows
- control flows
- interfaces and contracts
- execution boundaries
- authority boundaries
- dependencies
- repository-specific patterns
- architectural decisions
- constraints
- important files

It deliberately does **not** attempt to reproduce the repository.

The compression model is instructed to:

- use repository evidence only
- avoid inventing behavior or relationships
- preserve important architectural relationships
- avoid reproducing source code
- avoid summarizing every file independently
- omit repetitive implementation detail

The objective is:

> **Produce the smallest faithful architectural representation that allows downstream reasoning about the repository.**

The output ceiling is a limit, not a target. Different repositories require different amounts of architectural representation.

---

## Interactive Reasoning

Interactive reasoning operates downstream of semantic compression.

The current reasoning model is:

```text
Claude Sonnet 4.6
claude-sonnet-4-6
```

The reasoning workflow uses the generated architectural representation rather than treating the entire repository as its primary context.

Conceptually:

```text
project-summary.md
        │
        ▼
  cached context
        │
        ▼
 Claude Sonnet 4.6
        │
        ▼
 Architect response
        │
        ▼
LATEST_RESPONSE.md
```

The chat layer is intentionally separate from the crawl and compression stages.

This separation means repository ingestion and interactive reasoning are different operations with different information requirements.

---

## Prompt Caching and Long-Running Sessions

The interactive reasoning layer is designed around a stable architectural context that can be reused across requests.

Architect uses prompt caching for the persistent project context and maintains a heartbeat during longer interactive sessions.

This allows repeated reasoning against the same architectural representation without rebuilding the entire repository context for every question.

The architectural context is therefore treated as a reusable runtime resource rather than a one-time prompt payload.

---

## Generated Artifacts

Architect produces three primary artifacts in the target repository.

### `architect-raw-crawl.txt`

The bounded raw evidence corpus collected from the repository.

This is useful for:

- inspecting what crossed the filesystem boundary
- debugging crawler behavior
- comparing corpus size between runs
- validating directory and file exclusions

It is generated output and is excluded from future crawls.

### `project-summary.md`

The semantically compressed architectural representation produced by the compression model.

This is the primary reusable architectural artifact.

It gives the reasoning layer a compact representation of how the repository works without requiring the entire repository to be supplied as context.

It is generated output and is excluded from future crawls.

### `LATEST_RESPONSE.md`

The most recent response produced by Architect.

It provides a persistent Markdown artifact that can be opened independently of the terminal session or delivered directly into the active IDE.

The file is overwritten with each successful chat response.

It is generated output and is excluded from future crawls and version control.

---

## CLI

Architect currently exposes three commands:

```text
architect crawl
architect chat
architect open
```

The commands are intentionally separated by responsibility.

### `architect crawl`

Run repository discovery and semantic compression.

```bash
architect crawl
```

This establishes the target repository from the current working directory, applies the crawler boundaries, produces the bounded raw corpus, and generates `project-summary.md`.

### `architect chat`

Start interactive reasoning against the generated architectural context.

```bash
architect chat
```

Questions and requests can then be entered directly into the terminal.

To end the session:

```text
exit
```

### `architect open`

Open the latest Architect response in the IDE associated with the current workspace.

```bash
architect open
```

Architect determines the workspace from the current working directory.

The IDE bridge uses that workspace identity to route the request to the correct editor instance.

If no compatible Architect IDE bridge is running for that workspace, the command reports that the workspace-specific IDE socket was not found.

Architect does **not** silently fall back to opening the response in a native system application. This keeps `architect open` tied to the explicit IDE workflow rather than unexpectedly stealing focus or opening the file somewhere else.

---

## IDE Integration

Architect's IDE integration is deliberately separated from the core CLI.

The CLI does not need to know how a particular editor opens a file.

Instead:

```text
Architect CLI
     │
     │ open request
     ▼
Workspace-specific IPC socket
     │
     ▼
Architect IDE bridge
     │
     ▼
Active workspace
     │
     ▼
LATEST_RESPONSE.md
```

The current bridge targets **VS Code-compatible editors**.

It has been tested with:

- Visual Studio Code
- Cursor

The bridge is a separate project:

```text
architect-ide-vscode
```

The bridge does not perform repository crawling, semantic compression, or AI reasoning.

Its responsibility is intentionally narrow:

> Receive an explicit request from Architect and open the requested response file in the active workspace.

### Workspace Routing

Each workspace receives a deterministic local IPC socket derived from its absolute workspace path.

Conceptually:

```text
workspace path
      │
      ▼
 SHA-256 hash
      │
      ▼
first 16 hex characters
      │
      ▼
~/.architect/ide-<hash>.sock
```

This allows multiple Architect-compatible editor instances to coexist without the CLI guessing which workspace should receive an `open` request.

### WebStorm / JetBrains IDEs

JetBrains IDEs such as WebStorm do not currently have an Architect bridge.

The core CLI is not tied to VS Code or Cursor, however.

A future JetBrains adapter can implement the same IDE-side contract without changing the core repository-processing or reasoning architecture.

---

## Optional: VS Code IDE Bridge

Architect can also be used from VS Code through the optional
`architect-ide-vscode` companion project.

The bridge provides VS Code integration for opening a repository and
launching Architect operations through the local Architect CLI.

Architect's core CLI works independently through:

- `architect crawl`
- `architect chat`
- `architect watch`

The bridge adds IDE integration and supports the `architect open`
workflow.

Follow the bridge project's README for the VS Code-specific installation,
configuration, and usage instructions.

## Running Architect Against Another Repository

Architect operates on the repository from which it is invoked.

The Architect installation does **not** need to be inside the target repository.

A typical layout can be:

```text
~/Code/
├── architect/
└── my-project/
```

Then:

```bash
cd ~/Code/my-project
architect crawl
architect chat
architect open
```

The target repository is established from the current working directory.

This keeps the Architect runtime separate from the project being analyzed.

---

## Setup

Architect currently uses Anthropic Claude models for semantic compression and interactive reasoning.

### 1. Clone Architect

```bash
git clone <architect-repository>
cd architect
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Configure Anthropic

Create a `.env` file at the root of the Architect installation:

```env
ANTHROPIC_API_KEY=your_key_here
```

### 4. Build Architect

```bash
npm run build
```

The TypeScript project is compiled into `dist/`, and the CLI entry point is marked executable.

### 5. Link the CLI

For a global development installation:

```bash
npm link
```

You can then invoke Architect from another repository:

```bash
cd ~/Code/my-project
architect crawl
```

---

## Development

Install dependencies:

```bash
npm ci
```

Build:

```bash
npm run build
```

Run the TypeScript entry point directly during development:

```bash
npm run dev
```

The package exposes:

```text
architect
```

through:

```text
dist/index.js
```

The production CLI is therefore:

```text
TypeScript source
       ↓
      tsc
       ↓
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
│   └── open.ts
├── dist/
├── ARCHITECTURE.md
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### Core Components

#### `index.ts`

CLI entry point and command dispatch.

It maps the public commands to the corresponding runtime operations:

```text
crawl → runCrawl()
chat  → runChat()
open  → openLatestResponse()
```

#### `lib/crawl.ts`

Responsible for:

- filesystem discovery
- crawl boundaries
- directory filtering
- file filtering
- raw corpus construction
- semantic compression orchestration

#### `lib/compress.ts`

Responsible for:

- Anthropic model integration
- semantic compression
- architecture-focused project representation

#### `lib/config.ts`

Responsible for runtime configuration and environment handling.

#### `lib/chat.ts`

Responsible for:

- interactive reasoning
- generated project context
- prompt caching
- heartbeat behavior
- response persistence

#### `lib/open.ts`

Responsible for:

- locating `LATEST_RESPONSE.md`
- determining the current workspace
- resolving the workspace-specific IDE socket
- sending the IDE open request
- reporting IDE routing failures

---

## Design Philosophy

Architect treats information management as an architectural concern.

A repository is not automatically useful simply because it is available.

The system therefore follows this progression:

```text
More Repository Information
             │
             ▼
      Boundary Decisions
             │
             ▼
       Relevant Evidence
             │
             ▼
      Semantic Compression
             │
             ▼
     Architectural Knowledge
             │
             ▼
        Better Reasoning
```

The goal is not maximum repository ingestion.

The goal is **maximum useful architectural signal within a controlled information boundary**.

Architect therefore favors:

- explicit filesystem boundaries
- bounded evidence
- evidence-based transformation
- semantic compression
- reusable architectural context
- explicit runtime boundaries
- deterministic workspace identity
- narrow IDE integration
- persistent generated artifacts

---

## What Architect Is Not

Architect is not intended to be:

- a generic repository summarizer that dumps every file into a model
- a replacement for source control
- a code formatter
- a build system
- an IDE
- an autonomous coding agent
- a general-purpose file browser

Its purpose is narrower:

> **Build a faithful, bounded representation of a software repository that can support architectural reasoning.**

---

## Architectural Boundaries

The system can be understood as a sequence of increasingly specialized boundaries:

```text
Repository
     │
     ▼
Filesystem Boundary
     │
     ▼
Evidence Boundary
     │
     ▼
Semantic Processing Boundary
     │
     ▼
Architectural Knowledge
     │
     ▼
Reasoning Boundary
     │
     ▼
Artifact Boundary
     │
     ▼
IDE Boundary
```

Each boundary answers a different question.

### Filesystem Boundary

What repository content is allowed into the system?

### Evidence Boundary

What collected material is actually available as architectural evidence?

### Semantic Processing Boundary

What information can be removed while preserving architectural meaning?

### Reasoning Boundary

What representation should the reasoning model actually receive?

### Artifact Boundary

What result should persist after the reasoning session?

### IDE Boundary

Where should that result be opened, and which workspace owns the request?

Keeping these boundaries explicit is a central design property of Architect.

---

## Current Scope

The current v1 implementation focuses on a controlled pipeline:

```text
crawl
  ↓
bounded repository evidence
  ↓
semantic compression
  ↓
project-summary.md
  ↓
interactive reasoning
  ↓
LATEST_RESPONSE.md
  ↓
workspace-aware IDE opening
```

Model abstraction, provider fallback, and broader editor integrations are intentionally outside the current core scope.

The architecture leaves room for those capabilities later without requiring the filesystem, evidence, compression, reasoning, or IDE boundaries to be collapsed.

---

## The Core Principle

Architect is built around one simple idea:

> **Control the information before asking the model to reason about it.**

A better architectural representation does not necessarily contain more information.

It contains the **right information, selected deliberately, transformed faithfully, and delivered through explicit boundaries**.