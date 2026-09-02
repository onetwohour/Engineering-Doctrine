---
name: version-control
description: "Invoke this Doctrine skill when current work involves running git: staging, committing, branching, stashing, resetting, rebasing, amending, force-pushing, or otherwise touching history."
user-invocable: false
---

## Responsibility

Protects task ownership and repository history by staging in-scope work, preserving unexplained changes, and reserving history-rewriting operations for explicit authority.

This summary is discovery orientation only; the canonical rule projection below carries the binding requirements.

## 23. Version control

Follow the repository's commit and branch conventions; if none exist, use concise conventional forms appropriate to the project. Do not commit unless the owner asks or the repository's established workflow requires it. Stage only changes that belong to the task.

If the working tree contains unexplained changes: do not revert, tidy, or silently include them — treat the unexplained state as a re-entry condition and determine ownership before mutating it further.

Never rewrite published history without explicit owner authority: no force-pushing published history, amending published commits, rebasing published work, dropping an unexplained stash, or resetting away unexplained work merely to obtain a clean state. Temporary task-state files stay out of commits unless explicitly requested.

---
