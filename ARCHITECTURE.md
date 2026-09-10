# Architect — Architecture

## 1. Purpose

Architect is a local-first, repository-aware AI reasoning system.

Its purpose is to help a model reason about a software repository using a controlled, architecture-focused representation rather than indiscriminately supplying the entire repository for every request.

Architect separates:

1. Repository discovery
2. Evidence collection
3. Semantic compression
4. Interactive reasoning
5. Persistent response generation
6. IDE handoff

The system is built around one central principle:

> **Control the information before asking the model to reason about it.**

Architect is not intended to be a complete repository mirror, unrestricted autonomous agent, or general-purpose remote execution channel.

---

## 2. Architectural Goals

Architect is designed to provide:

* Bounded repository inspection
* Explicit filesystem boundaries
* Evidence-based project understanding
* Reusable architectural context
* Separation between crawling and reasoning
* Persistent reasoning artifacts
* Narrow and testable integration contracts
* Workspace-aware IDE communication
* Local-first operation
* Clear failure behavior
* Minimal unnecessary model context

The system should favor a small, faithful representation of the repository over a large, noisy context dump.

---

## 3. Non-Goals

Architect does not currently attempt to:

* Send every repository file to the model
* Maintain a complete semantic index of every source symbol
* Replace an IDE
* Act as a general-purpose remote execution framework
* Execute arbitrary model-generated shell commands
* Provide a universal protocol for every IDE action
* Automatically modify repository source code
* Guarantee that generated architectural context is permanently current
* Treat generated artifacts as authoritative source code

The current system is primarily an **architectural understanding and reasoning pipeline** with a narrow IDE artifact-opening capability.

---

## 4. System Overview

The current system can be represented as:

```text
┌─────────────────────────────┐
│ Target Repository            │
│                             │
│ Source files                │
│ Configuration               │
│ Documentation               │
│ Repository structure        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Crawl Boundary              │
│                             │
│ Filesystem scope            │
│ Directory exclusions        │
│ File filtering              │
│ Corpus limits               │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Raw Evidence Corpus         │
│                             │
│ architect-raw-crawl.txt     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Semantic Compression        │
│                             │
│ Architecture-focused model  │
│ Evidence-based synthesis    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Project Context             │
│                             │
│ project-summary.md          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Interactive Reasoning       │
│                             │
│ architect chat              │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Persistent Response         │
│                             │
│ LATEST_RESPONSE.md          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ IDE Handoff                 │
│                             │
│ architect open              │
│ Workspace-specific socket   │
└─────────────────────────────┘
```

---

## 5. Core Components

## 5.1 CLI Entry Point

### `index.ts`

The CLI entry point is responsible for:

* Parsing command input
* Dispatching supported commands
* Invoking the appropriate application layer
* Reporting success and failure to the terminal

The CLI is exposed as:

```text
architect
```

The current command surface is:

```text
architect crawl
architect chat
architect open
```

The CLI should remain thin.

Business logic belongs in the corresponding modules rather than being embedded directly in command dispatch.

---

## 5.2 Crawl Layer

### `lib/crawl.ts`

The crawl layer is responsible for transforming a repository filesystem into a bounded evidence corpus.

Its responsibilities include:

* Determining the target workspace
* Discovering repository content
* Applying directory exclusions
* Applying file exclusions
* Selecting supported text files
* Enforcing crawl limits
* Constructing the raw corpus
* Persisting the raw crawl artifact
* Invoking semantic compression

The crawler is an information boundary.

It determines what information is allowed to proceed to the model layer.

### Crawl principle

The crawler should not be understood as:

> Read everything and send it to the model.

It should be understood as:

> Collect the most relevant permitted evidence within explicit limits.

### Crawl output

The raw evidence artifact is:

```text
architect-raw-crawl.txt
```

This artifact exists for inspection and debugging.

It makes the crawl boundary observable by allowing developers to inspect what information was collected before compression.

---

## 5.3 Compression Layer

### `lib/compress.ts`

The compression layer converts bounded repository evidence into an architecture-focused project representation.

The compression stage should preserve:

* Project purpose
* Repository structure
* Component relationships
* Data flows
* Control flows
* Interfaces
* Contracts
* Dependencies
* Execution boundaries
* Important implementation patterns
* Architectural constraints
* Important files
* Evidence-supported design decisions

The compression stage should avoid:

* Reproducing large sections of source code
* Summarizing every file independently
* Inventing behavior
* Inventing dependencies
* Treating guesses as repository facts
* Preserving repetitive implementation detail
* Expanding beyond the evidence supplied to it

The intended output is not a conventional file-by-file summary.

It is a compact architectural model suitable for downstream reasoning.

### Compression objective

> **Produce the smallest faithful architectural representation that allows downstream reasoning about the repository.**

The output limit is a ceiling, not a target.

A small repository may require little context. A complex repository may require more context to preserve meaningful relationships.

---

## 5.4 Configuration Layer

### `lib/config.ts`

The configuration layer is responsible for runtime settings and environment handling.

This includes configuration such as:

* API credentials
* Model selection
* Runtime options
* Application-level limits
* Environment-specific behavior

Secrets must be supplied through environment configuration and must not be written into generated artifacts or committed to version control.

The current model configuration is an implementation detail and may change independently of the architectural contract.

---

## 5.5 Chat Layer

### `lib/chat.ts`

The chat layer is responsible for interactive reasoning over generated project context.

The intended flow is:

```text
project-summary.md
        ↓
Loaded project context
        ↓
Interactive reasoning model
        ↓
Architect response
        ↓
LATEST_RESPONSE.md
```

The chat layer is deliberately separate from crawling and compression.

This separation provides several benefits:

* Crawling does not need to happen for every question.
* The same project context can support multiple questions.
* The model receives a stable architectural representation.
* The latest response can be persisted independently.
* Crawl and reasoning failures can be diagnosed separately.

The chat layer should not silently replace the project context with an unrestricted repository dump.

If project context is missing, the expected behavior is to instruct the user to run:

```bash
architect crawl
```

---

## 5.6 Open Layer

### `lib/open.ts`

The open layer is responsible for handing the latest response artifact to an IDE integration.

Its responsibilities include:

* Resolving the current workspace
* Computing the workspace-specific integration identity
* Locating the local IDE socket
* Constructing the open request
* Sending the request
* Reading the integration response
* Reporting success or failure

The current open operation is intentionally narrow.

It opens:

```text
LATEST_RESPONSE.md
```

It does not execute arbitrary IDE commands or provide a general-purpose remote control interface.

---

## 6. Artifact Lifecycle

Architect uses generated files as explicit boundaries between stages.

```text
Repository
    ↓
architect-raw-crawl.txt
    ↓
project-summary.md
    ↓
Interactive chat
    ↓
LATEST_RESPONSE.md
```

## 6.1 `architect-raw-crawl.txt`

This file contains the bounded raw evidence corpus.

It is useful for:

* Inspecting collected evidence
* Debugging crawl behavior
* Comparing corpus sizes
* Reviewing exclusions
* Verifying the crawl boundary
* Investigating compression input

It is generated output.

It must be excluded from future crawls.

## 6.2 `project-summary.md`

This file contains the compressed architectural representation.

It is the primary reusable project-context artifact.

It is intended to be:

* Readable by humans
* Reusable by the chat layer
* Small enough to avoid unnecessary context expansion
* Faithful to repository evidence
* Regenerated when repository architecture changes materially

It is generated output.

It must be excluded from future crawls.

## 6.3 `LATEST_RESPONSE.md`

This file contains the most recent successful response from interactive chat.

It exists to provide a durable artifact outside the terminal session.

It can be:

* Opened in an IDE
* Previewed as Markdown
* Reviewed later
* Shared manually
* Used as a record of the latest reasoning result

It is overwritten after each successful response.

It is generated output and should not be committed as source.

---

## 7. Information Boundaries

Architect has multiple information boundaries.

```text
Filesystem boundary
        ↓
Crawler boundary
        ↓
Raw corpus boundary
        ↓
Compression boundary
        ↓
Project-context boundary
        ↓
Chat request boundary
        ↓
IDE handoff boundary
```

Each boundary should have a clear purpose.

## 7.1 Filesystem Boundary

The filesystem boundary determines which repository locations may be inspected.

It should prevent accidental traversal into unrelated locations such as:

* User home directories outside the workspace
* Dependency directories
* Build output
* Generated artifacts
* Version-control internals
* IDE metadata
* Secrets
* Other repositories

The exact exclusion behavior is implemented by the crawler and repository configuration.

## 7.2 Corpus Boundary

The corpus boundary limits the amount of raw evidence that can be assembled.

This protects against:

* Unbounded model input
* Excessive token usage
* Context pollution
* Accidental inclusion of irrelevant files
* Large generated files overwhelming useful source evidence

A crawl limit is a safety and quality boundary, not merely a performance optimization.

## 7.3 Compression Boundary

The compression boundary transforms raw evidence into architectural knowledge.

The compression model should not be treated as an unrestricted author.

Its output must remain grounded in the supplied repository evidence.

Where evidence is insufficient, the resulting context should preserve uncertainty rather than inventing an answer.

## 7.4 Chat Boundary

The chat layer reasons over the generated project context.

This makes the project summary a deliberate intermediate representation.

The model is not expected to receive the entire repository for every question.

## 7.5 IDE Boundary

The IDE integration receives a narrow local request.

The current protocol is designed around opening a generated Markdown artifact.

The IDE integration should not become an implicit general-purpose execution authority.

---

## 8. IDE Integration Architecture

IDE integrations are maintained inside the main repository:

```text
integrations/
├── vscode/
└── jetbrains/
```

The integrated repository is the canonical source for new changes.

The former standalone VS Code/Cursor bridge may remain online for backup, historical reference, or recovery purposes, but it should not be treated as the primary development location.

---

## 8.1 Workspace Identity

Architect uses workspace-specific identity for IDE communication.

The current implementation derives an identifier from the current workspace path:

```text
sha256(process.cwd()).slice(0, 16)
```

The resulting socket follows the pattern:

```text
~/.architect/ide-<workspace-hash>.sock
```

This prevents separate repositories from accidentally targeting the same IDE endpoint.

Workspace identity is important because a developer may have multiple IDE windows open simultaneously.

A global socket would create ambiguity about:

* Which workspace should receive the request
* Which IDE instance should open the file
* Whether the artifact belongs to the correct repository

Workspace-specific sockets make the routing decision explicit.

---

## 8.2 Open Request

The current open request has the following conceptual shape:

```json
{
  "action": "open",
  "workspace": "/path/to/workspace",
  "path": "/path/to/workspace/LATEST_RESPONSE.md"
}
```

The request contains:

* The requested action
* The workspace from which the request originated
* The artifact path to open

The request is sent over the workspace-specific local Unix socket.

The protocol is intentionally small.

It should remain easy to:

* Inspect
* Test
* Mock
* Implement in multiple IDEs
* Diagnose when something fails

---

## 8.3 Open Response

The IDE integration returns a structured response.

A successful response is represented conceptually as:

```json
{
  "ok": true
}
```

A failure response should provide enough information for the CLI to report a useful diagnostic without exposing unnecessary internal details.

The CLI should distinguish between failures such as:

* Socket not found
* IDE integration not running
* Workspace mismatch
* Connection failure
* Invalid response
* IDE-side open failure

---

## 8.4 VS Code/Cursor Integration

### `integrations/vscode/`

The VS Code/Cursor integration is responsible for:

* Running inside a VS Code-compatible editor
* Identifying the active workspace
* Creating the workspace-specific local socket
* Receiving open requests
* Validating the request
* Opening the requested Markdown artifact
* Returning a structured response
* Cleaning up its socket when the integration exits

The bridge should not assume that every request is valid.

At minimum, it should validate:

* The action
* The workspace
* The target path
* The relationship between the target path and workspace

The bridge should not become a general-purpose shell or arbitrary command executor.

---

## 8.5 JetBrains Integration

### `integrations/jetbrains/`

The JetBrains integration is implemented as an IntelliJ Platform plugin.

It is designed for JetBrains IDEs such as WebStorm and other compatible IntelliJ-based environments.

The plugin is responsible for:

* Detecting the active workspace
* Creating a workspace-specific local socket
* Receiving Architect open requests
* Validating incoming requests
* Opening `LATEST_RESPONSE.md`
* Returning structured success or failure responses
* Cleaning up the socket during shutdown

The JetBrains plugin has its own build lifecycle because it is built using the IntelliJ Platform toolchain rather than the root TypeScript build.

The plugin distribution is generated under:

```text
integrations/jetbrains/build/distributions/
```

---

## 9. Protocol Design Principles

The IDE protocol should remain:

### Local

Communication is intended to occur on the developer’s machine.

### Workspace-aware

Requests must resolve to the intended repository and IDE workspace.

### Narrow

The current operation is opening a generated response artifact.

### Explicit

Requests and responses should be structured rather than inferred from arbitrary text.

### Validated

The receiving integration should validate incoming requests before acting.

### Observable

Failures should be diagnosable from CLI and IDE logs.

### Extensible without overbuilding

Future actions may be added deliberately, but the protocol should not begin as a broad remote-control surface.

---

## 10. Security and Trust Boundaries

Architect handles repository information and may send selected repository evidence to an external model provider.

The main security concerns are:

* What files are collected
* What content crosses the model boundary
* Where generated artifacts are written
* Which local process receives IDE requests
* Whether a request can escape the intended workspace
* Whether secrets can enter the crawl corpus
* Whether generated output can be mistaken for source

## 10.1 Repository Content

The crawler must enforce explicit boundaries.

Sensitive files should be excluded through crawler rules and repository configuration where appropriate.

Examples include:

* Environment files
* Credentials
* Private keys
* Tokens
* Local secrets
* Generated dependency content
* Unrelated filesystem content

## 10.2 Model Boundary

Only the bounded crawl corpus should be supplied to compression.

The compression stage should not silently expand the scope of information collection.

The model should be instructed to use repository evidence and avoid unsupported invention.

## 10.3 IDE Socket

The IDE socket is local and workspace-specific.

The receiving integration should validate the workspace and target path before opening the artifact.

A future hardening pass should consider additional protections such as:

* Stronger workspace-path validation
* Socket ownership checks
* Request framing
* Explicit protocol versioning
* Better stale-socket handling
* More detailed error codes

## 10.4 Path Validation

The IDE integration must not blindly open arbitrary paths supplied by an untrusted request.

The intended target is the generated response artifact within the current workspace.

Path validation should prevent accidental or malicious traversal outside the expected workspace boundary.

---

## 11. Failure Model

Architect has several independent failure domains.

```text
Crawl failure
    ↓
Compression failure
    ↓
Chat failure
    ↓
Artifact write failure
    ↓
IDE discovery failure
    ↓
IDE connection failure
    ↓
IDE open failure
```

These failures should remain distinguishable.

## 11.1 Crawl Failures

Possible causes:

* Invalid workspace
* Permission errors
* Unsupported files
* Excessive corpus size
* Filesystem traversal errors
* Invalid configuration

The crawler should report the affected stage and avoid presenting incomplete output as a successful crawl.

## 11.2 Compression Failures

Possible causes:

* Missing API key
* Provider error
* Network failure
* Invalid model response
* Context-size failure
* Malformed output

A failed compression operation should not silently overwrite a valid existing project summary with invalid content.

## 11.3 Chat Failures

Possible causes:

* Missing project context
* Missing API key
* Provider error
* Invalid response
* Artifact write failure

The chat layer should make clear whether the failure occurred during model reasoning or while writing the response artifact.

## 11.4 IDE Failures

Possible causes:

* IDE not running
* Integration not installed
* Socket not created
* Stale socket
* Workspace mismatch
* Invalid request
* IDE-side file-open failure

The CLI should report actionable diagnostics rather than a generic connection error whenever possible.

---

## 12. Build Boundaries

Architect has separate build domains.

## 12.1 Root CLI

The root project is a TypeScript application.

Typical commands are:

```bash
npm install
npm run build
npm run dev
```

The compiled CLI is emitted under:

```text
dist/
```

## 12.2 VS Code/Cursor Integration

The VS Code/Cursor integration has its own package and build configuration under:

```text
integrations/vscode/
```

Its build and packaging commands are defined by that integration’s package configuration.

The root CLI build should not be assumed to build or package the VS Code/Cursor integration automatically.

## 12.3 JetBrains Integration

The JetBrains plugin has its own Gradle-based build.

From the plugin directory:

```bash
./gradlew buildPlugin
```

The resulting distribution is written under:

```text
integrations/jetbrains/build/distributions/
```

The root TypeScript build and JetBrains plugin build are separate concerns.

---

## 13. Generated Output and Repository Hygiene

Generated artifacts are not source code.

The following files are generated:

```text
architect-raw-crawl.txt
project-summary.md
LATEST_RESPONSE.md
```

They should be excluded from:

* Future crawls
* Normal source review
* Version control
* Architectural source-of-truth claims

Development and build output should also remain excluded where appropriate:

```text
dist/
integrations/jetbrains/build/
*.vsix
.idea/
```

The repository’s `.gitignore` is the operational source of truth for exclusion behavior.

---

## 14. Current Architectural Invariants

The following invariants should remain true unless deliberately changed.

### Invariant 1: Crawling is bounded

Architect must not silently become an unrestricted repository ingestion system.

### Invariant 2: Compression is evidence-based

The compression stage must preserve repository-supported facts and avoid unsupported invention.

### Invariant 3: Project context is reusable

The chat layer should be able to reason over generated project context without recrawling for every request.

### Invariant 4: Generated artifacts are explicit

Raw evidence, compressed context, and latest responses are separate artifacts with separate purposes.

### Invariant 5: IDE handoff is narrow

The current IDE protocol opens a generated artifact. It is not general-purpose remote execution.

### Invariant 6: Workspace identity matters

IDE requests must be routed to the correct workspace-specific integration.

### Invariant 7: Integrations live with the system

The integrated repository is the canonical source for IDE integration changes.

### Invariant 8: Failures remain diagnosable

Crawl, compression, chat, artifact, socket, and IDE failures should not collapse into indistinguishable errors.

---

## 15. Current Repository Layout

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

This layout reflects the current separation between:

* Root CLI behavior
* Repository processing
* Model interaction
* Generated artifacts
* IDE integrations
* Documentation
* Build output

---

## 16. Future Evolution

Potential future work should build on the current boundaries rather than bypassing them.

Likely areas include:

### Protocol hardening

* Explicit protocol version
* Request identifiers
* Structured error codes
* Better stale-socket recovery
* Stronger path validation
* Integration health checks

### Cross-IDE fixtures

* Shared request fixtures
* Shared response fixtures
* Workspace identity tests
* Invalid-request tests
* Socket lifecycle tests
* Cross-platform behavior tests

### Observability

* Crawl statistics
* Corpus size reporting
* Compression timing
* Model request diagnostics
* Artifact lifecycle logging
* IDE handoff diagnostics

### Context quality

* Better architectural extraction
* More explicit uncertainty handling
* Improved repository relationship preservation
* Better handling of monorepos
* More precise generated-file exclusion
* Optional incremental crawling

### Integration expansion

* Additional IDE adapters
* More reliable active-workspace detection
* IDE-side status reporting
* Controlled future actions beyond opening Markdown

Any expansion should preserve the principle that new authority is introduced deliberately and through explicit contracts.

---

## 17. Summary

Architect is organized as a controlled pipeline:

```text
Bounded evidence
    ↓
Semantic architectural context
    ↓
Interactive reasoning
    ↓
Persistent response artifact
    ↓
Workspace-aware IDE handoff
```

The architecture is intentionally conservative.

The crawler controls what information enters the system.

The compression layer turns that information into reusable architectural knowledge.

The chat layer reasons over the generated context.

The artifact layer makes results persistent.

The IDE layer provides a narrow local handoff.

The long-term direction is not to make Architect an unrestricted agent. It is to make repository understanding, reasoning, and developer-tool integration more reliable through explicit boundaries, observable artifacts, and small testable contracts.
