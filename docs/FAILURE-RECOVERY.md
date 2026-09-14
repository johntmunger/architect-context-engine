Fatal failures

Examples:

Architect directory is unavailable

Required runtime cannot start

Artifact directory cannot be written

No target repository can be identified

Recoverable failures

Examples:

IDE cannot be opened

One crawl operation fails

A context-warming question times out

A nonessential tool is unavailable

A partial summary is generated

Degraded-mode behavior

For every failure, specify:

Failure
  ↓
Classify
  ↓
Retry if appropriate
  ↓
Fallback if available
  ↓
Continue or terminate
  ↓
Report exact state to user