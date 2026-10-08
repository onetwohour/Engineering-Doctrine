## 16. Evidence

Establish how success will be judged before implementing whenever practical. Name the pass/fail signal: test, build exit code, lint rule, typecheck, fixture comparison, screenshot comparison, reproduction, benchmark. If the correct signal can be determined from the task and repository, establish it rather than waiting until the end.

Evidence adequacy is judged against the relevant behavior and risk space, not by test count or by whether the examples named in the task pass. A verification plan that only exercises the path the implementation was written around cannot support a broad correctness or no-regression claim. Before treating verification as sufficient, ask which requirements, invariants, state transitions, boundaries, interaction axes, failure points, and user-visible paths could falsify the result, and ensure the important ones are challenged at an appropriate level. Unknown exact examples are not exempt when their underlying dimension is foreseeable from the model.

For existing projects, establish the relevant baseline when practical. Pre-existing unrelated failures are part of the starting state: do not silently fix them, hide them, or count them as regressions introduced by this task. Completion requires no new relevant failure relative to the baseline, plus satisfaction of the task-specific requirement.
