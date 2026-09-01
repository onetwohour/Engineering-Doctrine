### 24.2 Durable task state

Establish durable task state when safe continuation depends on decisions, evidence, or stage status that cannot be reliably reconstructed from authoritative repository state and the active context. A second material stage is a trigger only when losing the first stage's conclusions would make the next stage unsafe or wastefully ambiguous. Also establish state after re-entry or compaction when needed, for owner-level decisions that must survive context loss, or when accumulated independent changes make intent unsafe to reconstruct from the diff alone.

Prefer an environment-provided task-state, workspace-memory, or other non-repository continuity mechanism when one exists. Do not create a repository file solely as model memory unless the repository already defines such a convention or the owner explicitly authorizes it. Do not hide task state inside product documentation, source comments, configuration, tests, or other durable artifacts that have a different owner.

Record only what must survive:

```text
Request        the original ask, as close to verbatim as practical
Scope          in / out
Decisions      settled choices and rejected alternatives that must not be retried
Stages         done / in progress / not started
Files changed  path — what and why
Verification   checks run and their results
Open           unresolved owner decisions or material uncertainties
Next action    the next safe step and where to re-enter
```

Update at meaningful stage boundaries rather than narrating every action. Keep task state out of commits unless repository convention or the owner requires otherwise. Retire or close it when the task ends so it cannot become stale authority.

Task state is intentionally task-relative. When durable product knowledge must survive the task, extract the final fact, verify it against the final repository state, and rewrite it into the artifact that actually owns that knowledge.

---
