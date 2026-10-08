### 17.1 User data

Protect user data as both a correctness and privacy concern. Never silently lose user work, and do not collect, read, retain, copy, transmit, log, cache, or expose more user or sensitive data than the required behavior needs.

For migrations and persistent-state changes: define rollback or recovery behavior first, preserve previously valid state on partial failure, prefer atomic transitions where needed, define compatibility with prior formats, and state explicitly when no rollback exists. Avoid designs in which one failed operation leaves several representations inconsistent.

Preserve the product's intended retention, deletion, export, access, and permission semantics. Do not move sensitive data into a less protected surface merely because it is convenient for implementation, diagnostics, testing, or caching. Prefer least-privilege access and the narrowest data projection that serves the operation.

Do not invent legal, policy, retention, or consent requirements. When those decisions are not already specified and materially affect the implementation, obtain the appropriate owner decision rather than silently choosing policy.

A design that makes user data easier to lose, leak, over-retain, or access unnecessarily is defective.

---
