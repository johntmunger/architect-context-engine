## Boundary Rules

- Target-repository writes are prohibited by default.
- Tool execution must pass through the approved execution boundary.
- User-provided paths must be validated.
- Secrets must never be written into generated artifacts.
- Runtime logs must avoid exposing credentials.
- IDE integration must not require unrestricted filesystem access.