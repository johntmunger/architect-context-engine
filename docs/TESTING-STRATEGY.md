# Testing Strategy

## Unit Tests

- Project detection
- Path validation
- Intent classification
- Failure classification
- Artifact path resolution

## Integration Tests

- Repository crawl
- Context generation
- Artifact persistence
- IDE presentation
- Interactive chat startup

## End-to-End Tests

- architect chat from a target repository
- architect open
- no IDE available
- invalid target
- partial crawl failure
- runtime timeout
- unwritable artifact directory

## Invariants

- Target repository remains unchanged.
- Generated artifacts remain Architect-owned.
- Every failed phase reports a useful status.
- Terminal fallback always remains available.