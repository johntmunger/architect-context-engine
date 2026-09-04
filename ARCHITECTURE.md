# Architect — Architecture Notes

This document is a compact technical reference for maintaining, rebuilding, or
explaining Architect. The public-facing setup and usage instructions live in
`README.md`.

## Installation Model

Architect is maintained as a single development package rather than being
installed inside every repository it analyzes.

```text
~/Code/
├── architect/
├── project-a/
├── project-b/
└── project-c/
```

Architect operates on the repository from which it is invoked. The target
repository is determined by the current working directory:

```ts
process.cwd()
```

This means Architect can analyze another repository without copying Architect
source code, dependencies, or configuration into that repository.

### Global Development Installation

During development, Architect can be exposed as a global CLI with:

```bash
npm link
```

The link points to the Architect development package rather than copying it
into consuming repositories.

Conceptually:

```text
architect
    ↓
global npm link
    ↓
Architect installation
    ↓
dist/index.js
```

A linked installation can then be invoked from another repository:

```bash
cd ~/Code/project-a
architect
```

### Side-by-Side Installation

Global linking is not required.

Architect can remain completely separate from a target repository:

```text
~/Code/
├── architect/
└── project-a/
```

Build Architect:

```bash
cd ~/Code/architect
npm install
npm run build
```

Then invoke the compiled CLI from the target repository:

```bash
cd ~/Code/project-a
node ../architect/dist/index.js
```

No source-code changes, dependency installation, or symlink inside the target
repository are required.

## Node.js Environment

Architect requires Node.js and npm.

A user-owned Node environment such as NVM is useful for development and global
CLI tooling. NVM manages Node.js versions and keeps the associated npm
environment under the user's control.

The important distinction is:

```text
NVM
 ↓
Node.js
 ↓
npm
 ↓
Architect development environment
```

This is a development-environment concern, not a requirement that consuming
repositories use NVM.

## Build / Runtime Boundary

Architect is written in TypeScript, but the CLI executes the compiled
JavaScript runtime.

```text
TypeScript source
       ↓
      tsc
       ↓
dist/index.js
       ↓
Architect CLI
```

The source files in `lib/` are development-time TypeScript.

The `dist/` directory contains the compiled runtime produced by the build.

After source changes:

```bash
npm run build
```

The executable CLI should therefore be treated as the compiled runtime rather
than the TypeScript source.

## Repository Context

Architect's installation location and the repository being analyzed are
separate concerns.

```text
                 Architect
                    │
                    ▼
             compiled CLI
                    │
                    ▼
             process.cwd()
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   project-a                project-b
```

The same Architect installation can therefore operate against different
repositories without becoming part of them.

## Rebuild Checklist

When rebuilding Architect on another machine:

1. Install Node.js, optionally through NVM.
2. Clone Architect.
3. Install dependencies.
4. Configure the Anthropic API key.
5. Run `npm run build`.
6. Optionally run `npm link`.
7. Verify the `architect` command if linked.
8. Test Architect from its own directory.
9. Test Architect from another repository.

For a non-linked side-by-side installation, use the compiled
`dist/index.js` directly.

## Maintenance Principle

Keep the distinction clear between:

- **Architect itself** — the development package and compiled CLI.
- **The target repository** — the project Architect operates on.
- **The developer environment** — Node.js, npm, and optional NVM configuration.

Architect should remain externally applied to target repositories rather than
requiring those repositories to contain Architect-specific source or
dependencies.
