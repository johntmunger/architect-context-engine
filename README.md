# Architect

**Repository-aware AI reasoning with controlled context, semantic compression, and IDE handoff.**

Architect is a local-first developer tool that helps an AI reason about a software repository without indiscriminately sending the entire repository into a model context.

It creates a bounded evidence corpus, compresses that evidence into an architectural representation, and uses the resulting project context for interactive reasoning.

Architect can also persist the latest response as a Markdown artifact and open that artifact directly in an integrated IDE.

---

## What Architect Does

Architect separates repository understanding into explicit stages:

```text
Repository
    ↓
Filesystem boundaries
    ↓
Supported source files
    ↓
Bounded raw evidence corpus
    ↓
Architecture-focused semantic compression
    ↓
project-summary.md
    ↓
Interactive reasoning
    ↓
LATEST_RESPONSE.md
    ↓
IDE handoff
```

The central principle is:

> **Control the information before asking the model to reason about it.**

Architect is designed to preserve the information needed for architectural reasoning while avoiding unnecessary source-level detail.

It prioritizes:

* Project purpose
* Repository structure
* Components and relationships
* Data and control flows
* Interfaces and contracts
* Execution and authority boundaries
* Dependencies
* Repository-specific patterns
* Architectural decisions
* Constraints
* Important files

It deliberately avoids treating every file as equally important.

---

## Current Capabilities

Architect currently provides:

* Bounded repository crawling
* Supported-file filtering
* Raw corpus generation for inspection
* Architecture-focused semantic compression
* Cached project context
* Interactive terminal reasoning
* Persistent latest-response output
* Workspace-aware IDE handoff
* Integrated VS Code/Cursor support
* Integrated JetBrains support
* Workspace-specific local socket communication
* Generated-artifact exclusion from future crawls

The original standalone VS Code/Cursor bridge may remain available on GitHub as a backup reference, but the canonical integration source now lives inside this repository.

---

## Requirements

* Node.js
* npm
* An Anthropic API key
* A supported IDE if using IDE handoff

Architect currently uses Anthropic Claude models for compression and interactive reasoning.

The exact model configuration is controlled by the application configuration and may change independently of this README.

---

## Installation

Clone the repository:

```bash
git clone <architect-repository-url>
cd architect
```

Install dependencies:

```bash
npm install
```

Create a `.env` file at the repository root:

```env
ANTHROPIC_API_KEY=your_key_here
```

Build the project:

```bash
npm run build
```

The build produces the compiled CLI under `dist/`.

The package exposes the command:

```text
architect
```

For local development, use:

```bash
npm run dev
```

---

## Basic Usage

Architect is intended to be invoked from the repository being analyzed.

### 1. Crawl a repository

From the target repository:

```bash
architect crawl
```

The crawl process:

1. Determines the filesystem scope to inspect.
2. Applies directory and file exclusions.
3. Collects supported text-based repository content.
4. Constructs a bounded raw evidence corpus.
5. Sends the bounded corpus to the compression stage.
6. Writes the resulting architectural representation to `project-summary.md`.

### 2. Start interactive reasoning

After a successful crawl:

```bash
architect chat
```

The chat command loads the generated project context and opens an interactive terminal session.

Ask questions directly in the terminal.

To exit:

```text
exit
```

If the required project context does not exist, Architect will direct you to run:

```bash
architect crawl
```

first.

### 3. Open the latest response in an IDE

After a successful chat response:

```bash
architect open
```

The command sends the latest response artifact to the configured local IDE integration.

The IDE integration opens:

```text
LATEST_RESPONSE.md
```

The handoff is workspace-aware. Architect identifies the current workspace and communicates with the matching local IDE bridge rather than using one global, ambiguous endpoint.

---

## Generated Artifacts

Architect creates the following artifacts in the target repository.

### `architect-raw-crawl.txt`

The bounded raw evidence corpus collected during the crawl.

This file is useful for:

* Inspecting what crossed the filesystem boundary
* Debugging crawler behavior
* Comparing corpus sizes between runs
* Validating directory exclusions
* Validating file filtering
* Reviewing the evidence supplied to compression

This is generated output and is excluded from future crawls.

### `project-summary.md`

The architecture-focused semantic representation of the repository.

This is the primary reusable project-context artifact.

It is intended to capture how the repository works without requiring the entire repository to be supplied to every reasoning request.

This file is generated output and is excluded from future crawls.

### `LATEST_RESPONSE.md`

The most recent response produced by `architect chat`.

This provides a persistent Markdown artifact that can be:

* Opened in an IDE
* Previewed independently
* Shared manually
* Reviewed after a terminal session
* Used as a durable record of a reasoning result

The file is overwritten after each successful chat response.

This file is generated output and is excluded from future crawls and version control.

---

## IDE Integrations

Architect integrations are maintained inside the main repository:

```text
integrations/
├── vscode/
└── jetbrains/
```

### VS Code and Cursor

The VS Code integration supports VS Code-compatible editors, including Cursor where supported by the bridge implementation.

The integration is responsible for receiving an Architect open request and opening the requested Markdown artifact in the active workspace.

The original standalone bridge repository may remain online as a backup or historical reference. The integrated copy is the canonical development location.

### JetBrains

The JetBrains integration is maintained under:

```text
integrations/jetbrains/
```

It is implemented as an IntelliJ Platform plugin and is intended for JetBrains IDEs such as WebStorm and other compatible IntelliJ-based environments.

The plugin:

* Identifies the active workspace
* Creates a workspace-specific local socket
* Receives Architect open requests
* Opens `LATEST_RESPONSE.md`
* Cleans up its local socket when the IDE exits

The plugin is developed and built independently from the root TypeScript CLI.

---

## Local IDE Handoff

The CLI and IDE integrations communicate locally.

The current handoff model uses a workspace-specific Unix socket under:

```text
~/.architect/
```

The socket identity is derived from the current workspace, preventing separate repositories from accidentally sharing the same IDE endpoint.

The open request contains the workspace and target artifact:

```json
{
  "action": "open",
  "workspace": "/path/to/workspace",
  "path": "/path/to/workspace/LATEST_RESPONSE.md"
}
```

The IDE bridge returns a structured success or failure response.

This is intentionally a narrow protocol. Architect does not require a general-purpose remote agent channel merely to open a generated Markdown artifact.

---

## Repository Structure

The repository is organized around the core CLI and its IDE integrations:

```text
architect/
├── index.ts
├── lib/
│   ├── chat.ts
│   ├── compress.ts
│   ├── config.ts
│   ├── crawl.ts
│   └── open.ts
├── integrations/
│   ├── vscode/
│   └── jetbrains/
├── docs/
├── dist/
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
└── ARCHITECTURE.md
```

### Core files

#### `index.ts`

CLI entry point and command dispatch.

#### `lib/crawl.ts`

Responsible for:

* Filesystem discovery
* Crawl boundaries
* Directory and file filtering
* Raw corpus construction
* Crawl orchestration
* Invoking semantic compression

#### `lib/compress.ts`

Responsible for:

* Model integration
* Architecture-focused compression
* Converting bounded repository evidence into reusable project context

#### `lib/config.ts`

Responsible for:

* Runtime configuration
* Environment handling
* Model and application settings

#### `lib/chat.ts`

Responsible for:

* Loading project context
* Interactive reasoning
* Writing the latest response artifact

#### `lib/open.ts`

Responsible for:

* Resolving the current workspace
* Locating the workspace-specific IDE socket
* Sending the open request
* Handling the IDE bridge response

#### `integrations/vscode/`

Contains the integrated VS Code/Cursor bridge.

#### `integrations/jetbrains/`

Contains the JetBrains plugin and its build configuration.

---

## Design Philosophy

Architect treats information management as an architectural concern.

The important question is not simply:

> Can this information be sent to a model?

The more important question is:

> Should this information cross the boundary at all?

Architect therefore favors:

* Explicit filesystem boundaries
* Bounded collection
* Evidence-based transformation
* Semantic compression
* Reusable project context
* Narrow execution paths
* Persistent artifacts
* Local integration protocols
* Clear separation between CLI responsibilities and IDE responsibilities

The intended result is not a complete copy of the repository.

The intended result is:

> **The smallest faithful architectural representation that supports useful downstream reasoning.**

---

## Development

Install dependencies:

```bash
npm install
```

Build the root project:

```bash
npm run build
```

Run the development entry point:

```bash
npm run dev
```

The root CLI is compiled into:

```text
dist/
```

### VS Code/Cursor integration

The VS Code/Cursor integration has its own package and build configuration under:

```text
integrations/vscode/
```

Run the commands defined by that integration’s `package.json`.

Do not treat the former standalone bridge repository as the source of truth for new changes. Changes should be made in the integrated repository first.

### JetBrains integration

The JetBrains plugin is built from:

```text
integrations/jetbrains/
```

From that directory:

```bash
./gradlew buildPlugin
```

The generated plugin distribution is written under the plugin build directory, typically:

```text
integrations/jetbrains/build/distributions/
```

Install the resulting ZIP through the IDE’s plugin installation flow when testing locally.

---

## Generated Files and Version Control

Generated artifacts should not be treated as source files.

The following files are generated during normal use:

```text
architect-raw-crawl.txt
project-summary.md
LATEST_RESPONSE.md
```

They are excluded from future crawls.

The repository also excludes development and build output such as:

```text
dist/
integrations/jetbrains/build/
*.vsix
.idea/
```

The exact exclusion rules are maintained in the repository’s `.gitignore`.

---

## Operational Boundaries

Architect is intentionally not an unrestricted repository agent.

The crawler is bounded by:

* Filesystem scope
* Directory exclusions
* Supported file types
* Corpus limits
* Compression limits
* Explicit model calls

The compression stage is not intended to reproduce source code or provide a file-by-file dump.

The chat stage reasons over generated project context rather than automatically recrawling the entire repository for every question.

The IDE integration is not a general remote execution system. Its current responsibility is narrow:

> Receive a local request and open the requested Architect response artifact in the appropriate workspace.

---

## Troubleshooting

### `architect chat` says that project context is missing

Run:

```bash
architect crawl
```

Then retry:

```bash
architect chat
```

### `architect open` cannot find an IDE bridge

Check that:

* The target IDE is running.
* The IDE integration is installed.
* The IDE has opened the same workspace from which `architect open` is being run.
* The workspace-specific socket exists under `~/.architect/`.
* The integration is not using a stale build.

### The latest response does not open

Check that:

```text
LATEST_RESPONSE.md
```

exists in the current workspace.

Then retry:

```bash
architect open
```

### The IDE opens the wrong workspace

Close duplicate IDE windows and ensure the target repository is opened as the active workspace.

Architect uses workspace-specific socket identity to avoid cross-repository collisions.

---

## Project Status

Architect is an evolving local-first AI developer tool.

The current direction is:

1. Stabilize the CLI and generated artifacts.
2. Keep crawl and compression boundaries explicit.
3. Maintain a reusable architectural project context.
4. Keep the IDE handoff protocol narrow and reliable.
5. Consolidate integrations under the main repository.
6. Add cross-IDE fixtures and protocol tests.
7. Improve observability around crawl, compression, chat, and open operations.

The root repository is the canonical source for the integrated system.
