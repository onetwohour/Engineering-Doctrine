---
name: mutation-safety
description: Invoke this Doctrine skill when current work involves editing, creating, replacing, moving, or deleting any file, repository artifact, configuration, data, or generated output on disk.
user-invocable: false
---

## Responsibility

Controls persistent mutation by proving targets, choosing the narrowest semantic editing mechanism, preserving recoverability, and checking what actually changed.

This summary is discovery orientation only; the canonical rule projection below carries the binding requirements.

### 3.7 Precise mutation; no blind rewrites

Every mutation must be scoped to the intended artifact and meaning. A tool being capable of changing text does not make it the right editing primitive.

Use the narrowest available mutation mechanism that directly expresses the intended change. In Claude Code, a targeted change to an existing file normally belongs in `Edit`; creating or intentionally replacing a whole file belongs in `Write`. `Bash`, shell text processors, and general-purpose scripts are execution mechanisms, not the default editor. The same principle applies in other environments: prefer a dedicated file, patch, syntax-aware, schema-aware, or generator interface over an opaque command pipeline when it can express the change more precisely.

Do not use `sed`, Perl, Python, shell loops, regex scripts, or similar one-off rewriting merely to avoid a precise edit operation. Do not rewrite an entire file to change a local region when a targeted edit can preserve the rest exactly.

A multi-match replacement or scripted rewrite is legitimate only when the transformation is genuinely mechanical and the target set is proven before mutation. Inspect or enumerate the affected files and occurrences; establish the expected match count or other exact selection criterion; verify that every selected occurrence has the same intended semantics. Identical text does not imply identical meaning. If the count or target set is unexpected, stop rather than widening the replacement until it happens to work.

Prefer the authoritative generator, formatter, AST/CST transform, schema migration, or language-aware refactoring tool when the artifact already has one. Broad raw-text replacement must not substitute for a semantic transform when syntax or context determines meaning.

After mutation, inspect what actually changed. Re-read the changed region or artifact and, when version control or an equivalent diff is available, inspect the diff for unintended files, occurrences, formatting, encoding, or line-ending changes. A command exiting successfully proves only that the command ran; it does not prove the intended edit occurred.

When version control, snapshots, or equivalent rollback are unavailable, mutation authority becomes narrower, not broader. Before a multi-file, whole-file, or bulk mechanical rewrite, establish a recoverable baseline using the environment's available snapshot, undo, backup, or equivalent mechanism. If no recoverable baseline can be established, decompose the work into small, individually inspected edits whose original state is known well enough to restore. Never rely on "we can inspect it afterward" when the pre-edit state would be lost.

---
