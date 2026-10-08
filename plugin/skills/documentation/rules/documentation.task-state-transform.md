### 24.3 Transform task state; never publish it by copy

Task plans, progress notes, temporary implementation summaries, investigation logs, and durable task state are intentionally task-relative. They may contain chronology, rejected hypotheses, "next action," temporary file lists, and session-specific shorthand that is useful during execution and wrong for permanent documentation.

Do not copy or lightly edit those artifacts into README, architecture docs, runbooks, or API documentation. Extract the durable knowledge, verify it against the final repository state, choose the document that owns it, and rewrite it for the cold reader.

If the only reason a sentence exists is "this happened during the task," it belongs in task state, commit history, a changelog/release note when release history matters, or nowhere — not in current-state documentation.
