# Architect — Global Installation

## Purpose

Architect is a local developer CLI designed to analyze and operate on software repositories.

Architect is maintained as a single development package rather than being installed separately inside every repository.

The goal is:

project-a ──┐
project-b ──┼──→ one global Architect
project-c ──┘

The consuming repositories do not contain copies of Architect.

---

## Source Location

The Architect development package lives at:

~/Code/architect

Source code is maintained in:

architect/
├── index.ts
├── lib/
│ ├── crawl.ts
│ └── chat.ts
├── dist/
└── package.json

`lib/` contains the TypeScript source.

`dist/` contains the compiled runtime used by the CLI.

See [Build & Runtime Boundary](./04-build-runtime-boundary.md).

---

## Global Node Environment

Architect uses a user-owned Node.js environment managed by NVM.

NVM is installed once at:

~/.nvm

It provides the Node.js and npm environment used by Architect and other global developer tools.

See [NVM & Node Environment](./02-nvm-node-environment.md).

---

## Global Linking

Architect is exposed as a global CLI using:

npm link

The package is **linked**, not copied, into the global npm environment.

Conceptually:

architect command
↓
global npm package
↓
~/Code/architect
↓
dist/index.js

This allows the same Architect installation to be used from any repository.

See [npm Linking & Symlinks](./03-npm-linking-and-symlinks.md).

---

## Repository Context

Architect is global, but it operates against the repository from which it is invoked.

Node provides this context through:

process.cwd()

For example:

cd ~/Code/project-a
architect crawl

Architect sees `~/Code/project-a` as its current working directory.

The same global command can therefore operate against another repository without installing another copy of Architect.

---

## Permission Principle

Global npm tooling should live in a user-owned environment.

A root-owned npm prefix such as:

/usr/local

can cause `EACCES` errors during:

npm link

Do not solve this with:

sudo npm link

Use a user-owned NVM environment instead.

---

## Rebuild Checklist

After setting up a new machine:

1. Install/load NVM.
2. Install and activate the desired Node version.
3. Verify Node and npm use the NVM environment.
4. Build Architect.
5. Verify `dist/index.js` is executable.
6. Run `npm link` from `~/Code/architect`.
7. Verify `which architect`.
8. Test Architect from its own directory.
9. Test Architect from another repository.

---

## Architecture

User
│
└── NVM
│
└── Node + npm
│
└── Global Architect link
│
▼
~/Code/architect
│
└── dist/
