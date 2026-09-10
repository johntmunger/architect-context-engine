# Architect — Architecture

Architect is a repository-aware AI architecture system built around **controlled information boundaries**.

The system deliberately separates repository discovery, evidence collection, semantic compression, interactive reasoning, artifact persistence, and IDE delivery.

Its central architectural principle is:

> **Control the information before asking the model to reason about it.**

This document describes the implementation model and the boundaries between its major components.

---

## 1. System Model

Architect operates on a target repository established by the process from which the CLI is invoked.

The Architect installation and the target repository are separate concerns.

Conceptually:

```text
Architect Installation
        │
        │ CLI
        ▼
Current Working Directory
        │
        ▼
Target Repository
        │
        ▼
Filesystem Boundary
        │
        ▼
Bounded Evidence
        │
        ▼
Semantic Compression
        │
        ▼
Architectural Knowledge
        │
        ▼
Interactive Reasoning
        │
        ▼
Persistent Response Artifact
        │
        ▼
IDE Boundary
```

The target repository is determined from:

```text
process.cwd()
```

This is important because the same globally installed Architect executable can operate against many different repositories without becoming part of those repositories.

---

# 2. Architectural Boundaries

Architect is structured around explicit information and execution boundaries.

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

Each boundary has a distinct responsibility.

### Filesystem Boundary

Determines which repository content may enter the system.

### Evidence Boundary

Defines the bounded material that is available for architectural analysis.

### Semantic Processing Boundary

Transforms repository evidence into a smaller architectural representation.

### Reasoning Boundary

Determines what context is supplied to the interactive reasoning model.

### Artifact Boundary

Persists the result of reasoning outside the interactive session.

### IDE Boundary

Delivers an explicitly requested artifact into the editor associated with the current workspace.

These boundaries are intentionally separated rather than allowing one component to implicitly perform another component's work.

---

# 3. Information Flow

The primary data flow is:

```text
Target Repository
       │
       ▼
    crawl.ts
       │
       ▼
Raw Repository Corpus
       │
       ▼
  compress.ts
       │
       ▼
project-summary.md
       │
       ▼
    chat.ts
       │
       ▼
LATEST_RESPONSE.md
       │
       ▼
     open.ts
       │
       ▼
Workspace-specific IDE socket
       │
       ▼
Architect IDE Bridge
```

This creates two important transformations.

The first is:

```text
Repository
    ↓
Bounded Evidence
    ↓
Architectural Knowledge
```

The second is:

```text
Reasoning Result
    ↓
Persistent Artifact
    ↓
IDE Presentation
```

The IDE does not participate in repository analysis.

It is a delivery boundary.

---

# 4. Filesystem Discovery

Filesystem discovery is implemented primarily in:

```text
lib/crawl.ts
```

The crawler is responsible for establishing the raw information boundary before model processing occurs.

The crawler does not attempt to understand the architecture while walking the filesystem.

Its job is to determine what repository information is eligible to become evidence.

---

## 4.1 Ignored Directories

The crawler excludes implementation, build, cache, and version-control directories including:

```text
node_modules
.git
.next
dist
build
.cache
```

These directories are excluded because their contents are generally not primary architectural evidence.

The exclusion also prevents dependency trees and generated output from dominating the evidence corpus.

---

## 4.2 Directory Content Ceiling

Architect applies a generic directory-level content ceiling of:

```text
100,000 bytes
```

A directory whose aggregate file content exceeds this ceiling is excluded before Architect descends into the directory.

This is intentionally generic.

It is not a hardcoded rule for a particular repository or technology.

The purpose is to prevent large content trees from crossing the filesystem boundary simply because they happen to contain many individually valid files.

The directory-level decision therefore occurs before those contents become part of the raw corpus.

---

## 4.3 File Content Ceiling

Individual files larger than:

```text
250,000 bytes
```

are skipped.

This provides a second boundary after directory-level filtering.

The two limits serve different purposes:

```text
Directory ceiling
        ↓
Reject oversized content trees

File ceiling
        ↓
Reject oversized individual files
```

---

## 4.4 Supported Text Extensions

The crawler currently considers:

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

Architect is therefore deliberately focused on textual repository evidence rather than attempting to ingest arbitrary binary or generated content.

---

# 5. Generated Artifact Exclusion

Architect generates artifacts inside the target repository.

Those artifacts must not become evidence for the next crawl.

The crawler therefore excludes:

```text
architect-raw-crawl.txt
project-summary.md
LATEST_RESPONSE.md
```

This establishes a one-way relationship:

```text
Repository Evidence
        │
        ▼
Architect Processing
        │
        ▼
Generated Artifacts
```

rather than:

```text
Repository Evidence
        ↕
Generated Artifacts
```

Without this boundary, Architect could progressively analyze its own previous outputs instead of the underlying repository.

---

# 6. Raw Evidence Corpus

The bounded crawler output is persisted as:

```text
architect-raw-crawl.txt
```

This file represents the material that crossed the filesystem/evidence boundary.

It is useful as an observable intermediate representation.

It allows inspection of:

- what files were collected
- what information entered the corpus
- whether directory boundaries behaved as expected
- whether file filtering behaved as expected
- how corpus size changes between runs

The raw corpus is not intended to be the final architectural representation.

It is evidence.

That distinction is important:

```text
Raw Corpus
    =
Collected Evidence

Project Summary
    =
Architectural Representation
```

---

# 7. Semantic Compression

Semantic compression is implemented in:

```text
lib/compress.ts
```

The current compression model is:

```text
Claude Haiku 4.5
claude-haiku-4-5-20251001
```

The compression stage receives the bounded repository evidence and transforms it into architectural knowledge.

The model is not asked to reproduce the repository.

It is asked to preserve the relationships and information required for architectural reasoning.

---

## 7.1 Compression Priorities

The compression stage prioritizes:

- project purpose
- repository structure
- components
- relationships
- data flows
- control flows
- interfaces
- contracts
- execution boundaries
- authority boundaries
- dependencies
- repository-specific patterns
- architectural decisions
- constraints
- important files

It deliberately removes information that is below the level required for architectural reasoning.

---

## 7.2 Compression Constraints

The compression model is instructed to:

- use repository evidence only
- avoid inventing behavior
- avoid inventing relationships
- preserve important architectural relationships
- avoid reproducing source code
- avoid summarizing every file independently
- omit repetitive implementation detail

The intended result is:

> **The smallest faithful architectural representation that allows downstream reasoning about the repository.**

The configured output ceiling is a maximum rather than a target.

A smaller repository should not be artificially expanded merely to reach a fixed output size.

---

# 8. Architectural Knowledge

The output of semantic compression is written to:

```text
project-summary.md
```

This file is the primary reusable architectural representation produced by Architect.

It sits between repository evidence and interactive reasoning:

```text
Raw Repository Evidence
        │
        ▼
Semantic Compression
        │
        ▼
project-summary.md
        │
        ▼
Interactive Reasoning
```

The important architectural property is that the reasoning model does not need to receive the complete raw repository as its primary context.

Instead, the repository has already passed through an explicit evidence and semantic-processing boundary.

---

# 9. Interactive Reasoning

Interactive reasoning is implemented in:

```text
lib/chat.ts
```

The current reasoning model is:

```text
Claude Sonnet 4.6
claude-sonnet-4-6
```

The reasoning layer operates downstream of semantic compression.

Conceptually:

```text
project-summary.md
        │
        ▼
Cached Architectural Context
        │
        ▼
Claude Sonnet 4.6
        │
        ▼
Interactive Response
        │
        ▼
LATEST_RESPONSE.md
```

This separation prevents repository ingestion and interactive reasoning from becoming the same operation.

The crawler establishes what information is available.

The compression stage establishes what architectural knowledge survives.

The reasoning layer operates on that resulting representation.

---

# 10. Prompt Caching

The interactive reasoning layer is designed around a reusable project context.

The architectural representation can remain stable across multiple questions during an interactive session.

Architect therefore uses prompt caching for the persistent project context.

The purpose is both operational and architectural:

```text
Stable Project Context
        │
        ├── request 1
        ├── request 2
        ├── request 3
        └── request N
```

The same architectural knowledge can support multiple reasoning operations without treating every request as a completely new repository-ingestion event.

---

# 11. Heartbeat Behavior

Long-running interactive sessions maintain a heartbeat to keep the reasoning interaction active.

The current implementation uses a heartbeat interval of approximately:

```text
4.5 minutes
```

The heartbeat exists at the runtime/session layer.

It does not alter the architectural representation.

This distinction matters because session maintenance is separate from repository analysis.

---

# 12. Response Artifact

Successful reasoning responses are persisted as:

```text
LATEST_RESPONSE.md
```

The artifact boundary provides a persistent representation of the latest reasoning result.

The response therefore exists independently of the terminal interaction that produced it.

Conceptually:

```text
Interactive Reasoning
        │
        ▼
LATEST_RESPONSE.md
```

The file is overwritten by each successful chat response.

It is excluded from future crawls and should not be treated as repository source material.

---

# 13. CLI Runtime Boundary

The CLI entry point is:

```text
index.ts
```

The public command surface is:

```text
architect crawl
architect chat
architect open
```

Command dispatch is explicit.

```text
crawl
  ↓
runCrawl()

chat
  ↓
runChat()

open
  ↓
openLatestResponse()
```

The runtime is compiled from TypeScript into:

```text
dist/index.js
```

The package exposes that compiled entry point as the global:

```text
architect
```

The production execution boundary is therefore:

```text
TypeScript
    ↓
TypeScript compiler
    ↓
dist/index.js
    ↓
architect
```

The Architect installation remains independent of the target repository.

---

# 14. Workspace Identity

Workspace identity is established from:

```text
process.cwd()
```

when the CLI is invoked.

This value is used by the IDE-opening path to determine which editor workspace should receive the request.

For example:

```text
cd ~/Code/project-a
architect open
```

and:

```text
cd ~/Code/project-b
architect open
```

represent different workspace identities even though the same global `architect` executable is used.

This is preferable to maintaining a single global IDE destination.

---

# 15. IDE Boundary

IDE integration is implemented as a separate adapter architecture.

The core CLI does not directly control a specific editor.

Instead:

```text
Architect CLI
      │
      ▼
Local IPC
      │
      ▼
IDE Adapter
      │
      ▼
Editor Workspace
```

The current adapter is the separate:

```text
architect-ide-vscode
```

repository.

The adapter is responsible for translating Architect's generic open request into the native behavior of a VS Code-compatible editor.

The core Architect repository therefore does not contain editor-specific UI logic.

---

# 16. Workspace-Aware IPC Routing

The IDE bridge uses a Unix domain socket for local communication.

Socket paths are derived deterministically from the workspace path.

The algorithm is:

```text
workspacePath
      │
      ▼
SHA-256
      │
      ▼
first 16 hexadecimal characters
      │
      ▼
~/.architect/ide-<hash>.sock
```

For example, conceptually:

```text
/Users/example/Code/project
        ↓
SHA-256
        ↓
e7a043034d556547...
        ↓
~/.architect/ide-e7a043034d556547.sock
```

The complete hash is not required for routing.

The first 16 hexadecimal characters provide the deterministic workspace-specific identifier used by the current implementation.

---

# 17. Why Workspace-Hashed Sockets Exist

A single global IDE socket would create ambiguity when multiple editor windows or repositories are open.

For example:

```text
Repository A ── IDE A
Repository B ── IDE B
Repository C ── IDE C
```

The CLI must not have to guess which editor should receive:

```text
architect open
```

Workspace hashing establishes a deterministic mapping:

```text
Repository A
    ↓
Socket A
    ↓
IDE A

Repository B
    ↓
Socket B
    ↓
IDE B
```

The current working directory therefore becomes the routing identity.

---

# 18. CLI → IDE Contract

The CLI sends an explicit open request containing:

```text
{
  action: "open",
  workspace: <workspace path>,
  path: <response path>
}
```

The IDE adapter validates that:

```text
request.workspace
```

matches its active workspace.

The expected successful response is conceptually:

```text
{
  ok: true,
  workspace: <workspace path>
}
```

A rejected request returns:

```text
{
  ok: false,
  ...
}
```

The IDE adapter does not determine which file should be opened.

The CLI provides the explicit path.

This keeps artifact ownership on the Architect side and file presentation on the IDE side.

---

# 19. IDE Adapter Responsibilities

The current VS Code-compatible bridge is intentionally narrow.

It is responsible for:

1. determining its active workspace
2. establishing the workspace-specific IPC socket
3. receiving an Architect open request
4. validating workspace identity
5. opening the explicitly supplied file
6. returning a success or failure response
7. cleaning up its socket when the extension is disposed

It is **not** responsible for:

- repository crawling
- semantic compression
- model selection
- prompt construction
- interactive reasoning
- generating `project-summary.md`
- generating `LATEST_RESPONSE.md`

This is an adapter boundary, not an AI runtime.

---

# 20. IDE Failure Behavior

The IDE integration intentionally fails explicitly when no matching adapter is available.

If the expected workspace-specific socket does not exist:

```text
IDE socket not found
```

is reported.

The core CLI does not silently open the response through a native operating-system file opener.

This is an intentional design choice.

A native fallback could cause:

- focus to move unexpectedly
- the response to open in the wrong application
- an unrelated editor to receive the file
- workspace identity to be lost

The `open` command therefore means:

> **Open the latest response in the Architect IDE associated with this workspace.**

It does not mean:

> **Open this file somewhere using whatever application the operating system chooses.**

---

# 21. Local IPC Model

The current IDE communication uses local Unix domain sockets under:

```text
~/.architect/
```

The communication path is local to the machine.

The socket is associated with a specific workspace.

The adapter also validates the workspace value supplied by the CLI before accepting the request.

The IPC mechanism is intentionally simple because the required operation is simple:

```text
send path
    ↓
validate workspace
    ↓
open file
    ↓
return result
```

There is no need for a general-purpose remote protocol for the current use case.

---

# 22. Multiple IDE Instances

Workspace-aware routing allows multiple repositories to have independent adapter sockets.

Conceptually:

```text
~/.architect/
├── ide-<workspace-a-hash>.sock
├── ide-<workspace-b-hash>.sock
└── ide-<workspace-c-hash>.sock
```

The CLI selects the socket associated with the current working directory.

An optional environment override is also supported:

```text
ARCHITECT_IDE_SOCKET
```

This provides an explicit routing mechanism for development, diagnostics, or controlled environments.

---

# 23. Editor Independence

The CLI's IDE boundary is deliberately editor-agnostic.

The current adapter targets VS Code-compatible editors, but the CLI does not depend on VS Code APIs.

A future adapter can implement the same contract for another editor.

For example:

```text
                  Architect CLI
                       │
                       ▼
                 Open Contract
                  /     |     \
                 /      |      \
                ▼       ▼       ▼
             VS Code  Cursor  JetBrains
             Adapter  Adapter   Adapter
```

The current implementation provides the first branch.

JetBrains/WebStorm integration is not part of the current v1 adapter.

Adding such an adapter should not require changing the repository crawler, compression pipeline, reasoning layer, or response artifact model.

---

# 24. Component Responsibilities

The current core components are:

```text
architect/
├── index.ts
├── lib/
│   ├── crawl.ts
│   ├── compress.ts
│   ├── config.ts
│   ├── chat.ts
│   └── open.ts
├── dist/
├── README.md
└── ARCHITECTURE.md
```

### `index.ts`

Owns:

- CLI entry point
- command dispatch

It does not own repository analysis or IDE protocol implementation.

### `lib/crawl.ts`

Owns:

- filesystem traversal
- directory boundaries
- file boundaries
- text filtering
- generated-artifact exclusion
- raw corpus creation
- compression-stage orchestration

### `lib/compress.ts`

Owns:

- semantic compression
- Anthropic compression-model invocation
- architectural representation generation

### `lib/config.ts`

Owns:

- environment configuration
- runtime configuration

### `lib/chat.ts`

Owns:

- interactive reasoning
- architectural context
- prompt caching
- heartbeat/session behavior
- response persistence

### `lib/open.ts`

Owns:

- locating the latest response
- workspace identity
- workspace-specific socket routing
- IDE open request
- IDE response handling
- explicit IDE failure behavior

---

# 25. Architectural Invariants

Several properties should remain true as Architect evolves.

## 25.1 The Repository Is Not the Reasoning Context

The raw repository should not become the default reasoning payload simply because it is available.

Repository information must first pass through the established boundaries.

```text
Repository
    ↓
Bounded Evidence
    ↓
Architectural Representation
    ↓
Reasoning
```

---

## 25.2 Generated Context Must Not Feed Back Into Crawling

Architect-generated artifacts must remain outside subsequent repository evidence.

```text
Generated Artifacts
        ✕
        │
        │
Future Crawl
```

This prevents recursive contamination of architectural context.

---

## 25.3 Workspace Identity Must Be Deterministic

The same absolute workspace path must resolve to the same socket identity.

```text
workspace path
      ↓
deterministic hash
      ↓
deterministic socket
```

The CLI should not need editor-specific heuristics to determine the destination.

---

## 25.4 IDE Integration Must Remain a Boundary

The core Architect runtime should not become coupled to editor APIs.

The IDE bridge is an adapter.

```text
Architect
    │
    │ generic open contract
    ▼
IDE Adapter
    │
    ▼
Editor API
```

---

## 25.5 Artifact Ownership Remains Explicit

Architect owns the response artifact.

The IDE owns presentation of that artifact.

```text
Architect
   │
   ├── creates LATEST_RESPONSE.md
   │
   ▼
IDE Adapter
   │
   └── opens LATEST_RESPONSE.md
```

The IDE should not become responsible for generating or interpreting the response.

---

## 25.6 Failures Should Be Explicit

A missing IDE adapter should produce an explicit routing error.

The system should not silently substitute another application or another workspace.

Explicit failure preserves the semantics of the command and prevents unexpected side effects.

---

# 26. End-to-End Runtime

The complete current flow can be represented as:

```text
                 TARGET REPOSITORY
                        │
                        ▼
               architect crawl
                        │
                        ▼
              Filesystem Boundary
                        │
                        ▼
                Bounded Evidence
                        │
                        ▼
             architect-raw-crawl.txt
                        │
                        ▼
              Semantic Compression
                  Claude Haiku 4.5
                        │
                        ▼
                project-summary.md
                        │
                        ▼
               architect chat
                        │
                        ▼
              Cached Project Context
                        │
                        ▼
              Claude Sonnet 4.6
                        │
                        ▼
               LATEST_RESPONSE.md
                        │
                        ▼
               architect open
                        │
                        ▼
             Workspace Identity
                        │
                        ▼
              SHA-256 Socket Hash
                        │
                        ▼
           ~/.architect/ide-<hash>.sock
                        │
                        ▼
              Architect IDE Bridge
                        │
                        ▼
                  Active IDE
```

The system therefore contains a clear progression:

```text
Discovery
    ↓
Evidence
    ↓
Compression
    ↓
Knowledge
    ↓
Reasoning
    ↓
Artifact
    ↓
Presentation
```

---

# 27. Separation of Concerns

Architect's architecture deliberately separates five different kinds of work.

### Discovery

> What exists in the repository?

Handled by:

```text
lib/crawl.ts
```

### Compression

> What architectural information is worth preserving?

Handled by:

```text
lib/compress.ts
```

### Reasoning

> What can we infer, explain, or decide from that architectural representation?

Handled by:

```text
lib/chat.ts
```

### Persistence

> What result should survive the interactive session?

Handled by:

```text
LATEST_RESPONSE.md
```

### Presentation

> Which editor workspace should display that result?

Handled by:

```text
lib/open.ts
+
architect-ide-vscode
```

These concerns should not collapse into a single runtime abstraction merely for convenience.

---

# 28. Why the Boundaries Matter

The architecture is not primarily an optimization for reducing token counts.

The boundaries provide control over what information is allowed to move through the system.

That affects:

- context capacity
- API cost
- processing time
- reasoning quality
- reliability
- privacy
- security
- caching
- reproducibility
- debugging
- change detection

The important architectural distinction is:

```text
Available Information
        ≠
Required Information
```

Architect exists to make that distinction operational.

---

# 29. Current Model Responsibilities

The current implementation gives the two Claude models different responsibilities.

```text
Claude Haiku 4.5
        │
        ▼
Semantic Compression
        │
        ▼
Architectural Knowledge

Claude Sonnet 4.6
        │
        ▼
Interactive Reasoning
        │
        ▼
Architect Response
```

Haiku is used for reducing bounded repository evidence into an architectural representation.

Sonnet is used for reasoning over that representation.

The models therefore occupy different stages of the architecture rather than competing for the same task.

---

# 30. Deferred Capabilities

The current architecture intentionally does not attempt to solve every possible AI development workflow.

The following capabilities remain outside the core v1 implementation:

- model-provider abstraction
- automatic model fallback
- broad editor integration
- JetBrains/WebStorm adapter
- generalized remote IDE transport
- autonomous code modification
- generalized agent orchestration
- repository-wide arbitrary binary ingestion

These may be added later if they preserve the existing boundaries.

The architecture should not be expanded merely because a capability is technically possible.

---

# 31. Architectural Principle

Architect is built around a simple proposition:

> **Better reasoning begins with better information boundaries.**

The system therefore does not start with:

```text
Repository
    ↓
LLM
```

It starts with:

```text
Repository
    ↓
Boundary Decisions
    ↓
Relevant Evidence
    ↓
Semantic Compression
    ↓
Architectural Knowledge
    ↓
Reasoning
```

The IDE layer then remains separate:

```text
Reasoning Result
    ↓
Persistent Artifact
    ↓
Explicit Workspace Routing
    ↓
IDE Presentation
```

The resulting architecture is intentionally conservative about information flow and explicit about execution ownership.

The repository supplies evidence.

The compression layer produces architectural knowledge.

The reasoning layer reasons over that knowledge.

Architect owns the resulting artifact.

The IDE adapter presents it.

Each boundary has one job.

That separation is the foundation of the system.