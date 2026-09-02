# Architect — Build & Runtime Boundary

## Purpose

Architect is written in TypeScript, but the global CLI executes the compiled JavaScript runtime.

This creates a boundary between:

```text
Source Code
    ↓
TypeScript
    ↓
Build
    ↓
Compiled Runtime
```
