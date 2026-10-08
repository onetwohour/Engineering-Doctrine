### 9.5 Control paths and fixed values

Branches, flags, modes, settings, exceptions, fixed identities, magic values, and alternate paths are legitimate only when they represent a real semantic distinction.

Before adding or extending one, answer:

1. What durable domain or operational distinction does it represent?
2. Which concept owns that distinction?
3. What authoritative state determines the branch, value, or mode?
4. Can its purpose still be explained without referring to the bug, ticket, caller, user, document, machine, environment, or failing test that exposed the need?

If a material control path has no satisfactory answer, do not commit it as architecture yet. Investigate the owning rule instead.

Do not turn one incident into permanent structure merely because doing so is the shortest patch. Existing technical debt is evidence to investigate, not automatic precedent to extend. Persistence does not make an incident-specific exception legitimate; a branch added only because the principled path was difficult is still an unjustified branch.

Hardcoding is about authority, not syntax. Ask where the value belongs and what should determine it. Moving an unjustified value from source code to a constant, configuration file, JSON, table, registry, database, or environment variable does not repair its authority.

Fixed operational values — timeouts, retry counts, batch sizes, concurrency limits, cache sizes, thresholds — need a source: an external contract, established project policy, measured requirement, resource budget, or algorithmic constraint. Trial-and-error until the current example passes is not a source.

Do not over-apply this rule. A legitimate local branch remains legitimate; a genuine domain state remains a genuine domain state.

---
