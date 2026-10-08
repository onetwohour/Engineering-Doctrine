### 25.3 Re-entry

When returning after context loss or uncertainty: stop writing → inspect repository status and the diff → inspect recent history when relevant → read durable task state → reconcile → resume only when current state and requirements are understood.

Three cases:

1. **Diff and task state agree** → resume from the next action, saying briefly what you are picking up so the owner can catch an error.
2. **Diff contains unexplained changes** → do not revert, tidy, overwrite, or silently include them. Identify them concretely; ask only if ownership uncertainty requires owner authority (`judgment.decision-gate`).
3. **No durable task state exists** → reconstruct from authoritative evidence — the diff, recent history, and the earliest visible request quoted rather than paraphrased. Mark every reconstructed field `[reconstructed]`. If reconstruction exposes an uncertainty that requires owner authority under `judgment.decision-gate`, present it before resuming mutation. Otherwise record the reconstruction, briefly state the reconstructed next action, and resume. **A reconstructed fact must never be represented as a recorded fact.**

**IMPORTANT: uncertainty reduces mutation authority.** Until re-grounded, reading and read-only investigation remain available; destructive or irreversible actions do not.
