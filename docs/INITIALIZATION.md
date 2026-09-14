Include:

Target repository detection

Current working directory behavior

Explicit target path behavior

Configuration loading

Environment validation

Runtime startup

Context/cache initialization

Artifact directory preparation

IDE detection

Interactive mode startup

Also document what must not happen:

## Initialization Invariants

- Never write generated files into the target repository.
- Never require an IDE extension to operate.
- Never silently discard a failed initialization phase.
- Never claim context is warmed unless the operation completed.
- Never start interactive chat without reporting degraded initialization.