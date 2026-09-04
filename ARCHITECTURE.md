# Architect — Architecture

Architect is a repository-aware AI architecture assistant built around controlled information boundaries.

The public-facing installation and usage instructions live in `README.md`. This document describes the system's architectural model and the boundaries between its major stages.

## System Model

Architect operates externally on a target repository rather than becoming part of that repository.

```text
Target Repository
       ↓
Filesystem Boundary
       ↓
Relevant Evidence
       ↓
Raw Corpus
       ↓
Semantic Compression
       ↓
Compressed Project Knowledge
       ↓
Interactive Reasoning
       ↓
Response Artifact
```

The target repository and Architect remain separate:

```text
~/Code/
├── architect/
├── project-a/
├── project-b/
└── project-c/
```

The target repository is established by the current working directory:

```ts
process.cwd()
```

This allows one Architect installation to operate on multiple repositories without copying Architect source code or dependencies into them.

A global CLI link or a direct side-by-side invocation are implementation mechanisms for maintaining this separation; they are not dependencies of the target repositories.

## Information Flow

Architect progressively transforms repository information rather than passing the entire repository directly to a reasoning model.

```text
Repository
    ↓
Filesystem Boundary
    ↓
Relevant Files
    ↓
Raw Corpus
    ↓
Semantic Compression
    ↓
Architectural Knowledge
    ↓
Interactive Reasoning
```

Each boundary exists to control the information that crosses into the next stage.

## Filesystem Boundary

The crawler establishes the first information boundary.

It:

- excludes known implementation, build, cache, and version-control directories
- limits aggregate directory content
- limits individual file size
- considers only supported text-oriented file types
- excludes Architect-generated artifacts

This prevents indiscriminate repository ingestion before semantic processing begins.

The current directory and file boundaries are documented in the README so that the operational limits remain visible to users.

## Evidence Layer

Files that survive the filesystem boundary become repository evidence.

```text
Allowed repository content
          ↓
    Bounded raw corpus
```

`architect-raw-crawl.txt` represents this intermediate evidence layer.

The artifact is derived from the repository and is excluded from future crawls so that generated evidence cannot become recursive input.

## Semantic Compression Boundary

The bounded raw corpus crosses the semantic processing boundary and is supplied to Claude Haiku 4.5.

```text
Raw Corpus
    ↓
Claude Haiku 4.5
    ↓
project-summary.md
```

The compression stage is architecture-focused.

It preserves project purpose, structure, relationships, flows, interfaces, boundaries, dependencies, constraints, patterns, and important files while deliberately reducing repetitive implementation detail.

The objective is:

> Produce the smallest faithful architectural representation that allows downstream reasoning about the repository.

The output limit is a ceiling rather than a target.

## Reasoning Boundary

Interactive reasoning operates downstream of semantic compression.

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

The reasoning model therefore works primarily from compressed architectural knowledge rather than from indiscriminate repository content.

## Prompt Cache and Heartbeat

Interactive chat is designed around reusable context.

The stable project context can be prompt-cached so that subsequent reasoning requests do not repeatedly process the entire architectural representation as new input.

Heartbeat behavior maintains reusable context during an interactive session.

The heartbeat is a cache-maintenance mechanism, not a separate reasoning workflow.

```text
Cached project context
        ↓
Heartbeat / context maintenance
        ↓
User request
        ↓
Sonnet reasoning
        ↓
Response
```

The purpose is to preserve the reusable context boundary while the interactive session remains active.

## Model Responsibilities

Architect intentionally separates model responsibilities.

```text
Claude Haiku 4.5
        │
        ▼
Semantic compression
        │
        ▼
project-summary.md
        │
        ▼
Claude Sonnet 4.6
        │
        ▼
Interactive reasoning
```

Haiku performs bounded semantic reduction.

Sonnet performs downstream interactive reasoning over that reduced representation.

This separation keeps the reasoning model from being used as the initial repository-ingestion mechanism.

## Generated Artifacts

Architect currently produces three important generated artifacts:

| Artifact | Purpose |
| --- | --- |
| `architect-raw-crawl.txt` | Bounded raw repository evidence |
| `project-summary.md` | Compressed architectural knowledge |
| `LATEST_RESPONSE.md` | Most recent interactive reasoning response |

These artifacts have different lifecycle roles:

```text
Raw evidence
    ↓
Compressed knowledge
    ↓
Reasoning response
```

Generated artifacts are excluded from future crawls where appropriate so that derived information does not become repository evidence.

`LATEST_RESPONSE.md` is also excluded from version control because it represents the current local interaction rather than source material.

## Runtime Boundary

Architect is written in TypeScript, but the CLI executes the compiled JavaScript runtime.

```text
TypeScript source
       ↓
      tsc
       ↓
dist/index.js
       ↓
Architect CLI
```

The source files under `lib/` define the development implementation.

The compiled files under `dist/` represent the executable runtime produced by the build.

The runtime boundary therefore separates development source from the executable CLI.

## Component Responsibilities

### `index.ts`

CLI entry point and command dispatch.

### `lib/crawl.ts`

Filesystem discovery, crawl boundaries, file filtering, raw corpus construction, and orchestration of semantic compression.

### `lib/compress.ts`

Anthropic integration and architecture-focused semantic compression.

### `lib/config.ts`

Runtime configuration and Anthropic API-key handling.

### `lib/chat.ts`

Interactive reasoning over the generated project context, including reusable cached context and response generation.

## Architectural Principle

Architect treats information management as an architectural concern.

The central question is not simply whether information can cross a boundary.

It is whether that information should cross the boundary.

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

Architect therefore favors explicit boundaries, evidence-based transformation, bounded context, reusable cached state, and controlled model access over indiscriminate repository ingestion.
