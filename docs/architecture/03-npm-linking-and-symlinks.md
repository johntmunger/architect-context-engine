# Architect — npm Linking & Symlinks

## Purpose

Architect is developed in one location but needs to be available as a command from many repositories.

`npm link` provides that connection without copying the Architect package into each repository.

The important distinction is:

```text
Architect is developed in one place
        ↓
npm creates links to that package
        ↓
any repository can invoke the same Architect
```
