### 26.1 Completion criteria

Do not confuse activity with completion. The task is complete only when the requested outcome exists.

Before claiming completion, require all of the following as applicable:

- the concrete result has passed review with no known material violation of an applicable doctrine rule
- completion is judged at the boundary of the requested project outcome, not at the boundary of the feature, file, component, diff, or code changed during the task; a locally correct patch is not complete while a known material project-level condition still makes the requested outcome incorrect (`scope.honesty`)
- the relevant verification evidence supports the scope of the claims being made
- no known material in-scope requirement remains unimplemented merely because it is difficult, large, or inconvenient
- any remaining in-scope gap is caused by a confirmed constraint or an explicit owner scope decision and is reported as incomplete rather than complete
- unresolved uncertainty, unverified behavior, and relevant out-of-scope risk are represented truthfully

A coherent checkpoint is still a checkpoint. Green tests, a small diff, a sophisticated design, one working path, or an honest list of omitted work does not by itself make the requested outcome complete.

---

## 29. The standard

Before reporting completion, ask:

> **Do I understand the real problem; have I formed the clearest coherent design that solves it; have I implemented that design as completely as delegated authority and actual environment constraints permit; and can I show with evidence that the result serves both the people who use it and the people who must understand, operate, recover, and maintain it?**

If a material in-scope gap remains without a confirmed constraint or explicit scope change, the work is not complete.

---
