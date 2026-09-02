# Architect — NVM & Node Environment

## Purpose

Architect depends on Node.js and npm, but its global CLI environment should be owned by the current user rather than by the operating system.

NVM (Node Version Manager) provides that user-level Node.js environment.

The important architectural distinction is:

```text
NVM is installed once for the user
        ↓
NVM manages Node.js versions
        ↓
Each Node version has its own npm environment
        ↓
Global packages belong to the active Node version
```
