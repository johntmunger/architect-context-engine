# IDE Integration

## Principle

Architect must remain fully usable from the terminal.

## Presentation Ladder

1. Existing IDE bridge
2. Documented IDE launcher
3. User-selected IDE
4. Terminal-only fallback

## Supported Operations

- Open latest response
- Open generated artifact
- Reveal artifact location
- Optional future live presentation

## IDE Preference

- Detection
- User selection
- Persistence
- Override behavior

## Failure Behavior

IDE presentation failure must not invalidate the generated response.