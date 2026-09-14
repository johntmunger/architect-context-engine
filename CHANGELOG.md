# Changelog

All notable changes to Architect will be documented here.

The changelog records meaningful changes to behavior, architecture,
developer workflow, diagnostics, and user experience.

## [Unreleased]

### Added

- Established the initial `/docs` documentation structure.
- Added architecture documentation placeholders for:
  - System architecture
  - CLI experience
  - Lifecycle
  - Initialization
  - Failure recovery
  - IDE integration
  - Runtime artifacts
  - Security and boundaries
  - Testing strategy
  - Implementation plan
- Added an initial `docs/decisions/` structure for architectural decision records.

### Changed

- Began formalizing Architect as a standalone control-plane and CLI workflow.
- Established the direction for `architect chat` as the primary user-facing workflow.
- Established the principle that Architect owns generated artifacts.

### Architectural Direction

- Architect-generated artifacts remain inside the Architect repository.
- The target repository is analyzed but remains read-only.
- IDE presentation is optional and must have a terminal fallback.
- Lifecycle phases should be observable, recoverable, and explicit.

### Notes

- This is the initial documentation baseline.
- Implementation details and decisions will be recorded incrementally as development continues.