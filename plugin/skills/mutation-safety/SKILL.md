---
name: mutation-safety
description: Editing, creating, replacing, moving, or deleting any file, configuration, data, scratch file, or generated output on disk, by Edit, Write, or a shell command. Read this doctrine BEFORE the first edit, creation, move, or deletion of a file by any tool, even one line.
user-invocable: false
---

## Responsibility

Controls persistent mutation by proving targets, choosing the narrowest semantic editing mechanism, preserving recoverability, checking what actually changed, and retiring the working artifacts it created.

Cues are discovery shorthand; the rules below are the binding text, in doctrine order and grouped by the trigger that routes them.

**Cue: Editing, creating, replacing, moving, or deleting any file, configuration, data, scratch file, or generated output on disk, by Edit, Write, or a shell command.** Canonical trigger: mutating any persistent file, repository artifact, configuration, data, or generated output.

### 3.7 Precise mutation; no blind rewrites

Every mutation must be scoped to the intended artifact and meaning. A tool being capable of changing text does not make it the right editing primitive.

Use the narrowest available mutation mechanism that directly expresses the intended change. In Claude Code, a targeted change to an existing file normally belongs in `Edit`; creating or intentionally replacing a whole file belongs in `Write`. `Bash`, shell text processors, and general-purpose scripts are execution mechanisms, not the default editor. The same principle applies in other environments: prefer a dedicated file, patch, syntax-aware, schema-aware, or generator interface over an opaque command pipeline when it can express the change more precisely.

Do not use `sed`, Perl, Python, shell loops, regex scripts, or similar one-off rewriting merely to avoid a precise edit operation. Do not rewrite an entire file to change a local region when a targeted edit can preserve the rest exactly.

A multi-match replacement or scripted rewrite is legitimate only when the transformation is genuinely mechanical and the target set is proven before mutation. Inspect or enumerate the affected files and occurrences; establish the expected match count or other exact selection criterion; verify that every selected occurrence has the same intended semantics. Identical text does not imply identical meaning. If the count or target set is unexpected, stop rather than widening the replacement until it happens to work.

Prefer the authoritative generator, formatter, AST/CST transform, schema migration, or language-aware refactoring tool when the artifact already has one. Broad raw-text replacement must not substitute for a semantic transform when syntax or context determines meaning.

After mutation, inspect what actually changed. Re-read the changed region or artifact and, when version control or an equivalent diff is available, inspect the diff for unintended files, occurrences, formatting, encoding, or line-ending changes. A command exiting successfully proves only that the command ran; it does not prove the intended edit occurred.

When version control, snapshots, or equivalent rollback are unavailable, mutation authority becomes narrower, not broader. Before a multi-file, whole-file, or bulk mechanical rewrite, establish a recoverable baseline using the environment's available snapshot, undo, backup, or equivalent mechanism. If no recoverable baseline can be established, decompose the work into small, individually inspected edits whose original state is known well enough to restore. Never rely on "we can inspect it afterward" when the pre-edit state would be lost.

---

### 3.8 Retire what you create

Creating something for your own execution creates the obligation to end its life. Scratch scripts, temporary files, intermediate outputs, generated fixtures, backup copies, working branches and stashes, and background processes are yours to retire.

Decide where each one lives before creating it. When the environment designates a scratch or temporary location outside the owner's project, put it there and the obligation ends with the session. Anything written inside the owner's project or working tree is retired when the task ends, unless it survives as a deliberate deliverable the owner has been told about.

Retire only what this task created. Pre-existing files, unexplained working-tree changes, and another task's artifacts fall under `safety.no-silent-destruction` and are not yours to sweep up.

Account for the residue before reporting completion: what was removed, what remains, and why it remains. A stray file the owner finds later is a defect, not a detail.

---
