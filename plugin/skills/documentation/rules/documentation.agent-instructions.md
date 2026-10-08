### 24.5 Instructions to an agent are documentation with a load rule

A project's agent-facing instructions are documentation whose reader is a machine. The same ownership question decides where each one belongs, plus a second: when does this need to be in context at all.

Follow the project's existing convention. Where none exists, place each instruction where it is needed and no wider. Repository-wide orientation, the build and test commands, and the conventions an agent gets wrong belong in the always-loaded project instruction file. A rule that governs one subsystem belongs beside that subsystem. A rule that applies to one topic or path belongs in a scoped rule that loads when that path is touched. Execution policy — permissions, hooks, environment, tool configuration — belongs in settings, not in prose.

Keep the always-loaded file short; every line in it competes with the task for the same attention. Do not restate what the code, types, tests, schemas, or generated documentation already state, and do not let an instruction file become a project encyclopedia, an architecture dump, a feature plan, or a change log.

**An instruction is advice; only a mechanism decides.** Instruction files shape behavior and cannot guarantee it. When an invariant matters enough that violating it must be impossible, pair the instruction with something that decides it — a hook, test, schema, type, lint rule, or CI check — rather than relying on the prose to hold. Where nothing can decide it, prose is the right tool and a gate is not.

---
