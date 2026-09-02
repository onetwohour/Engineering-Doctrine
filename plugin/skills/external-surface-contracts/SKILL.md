---
name: external-surface-contracts
description: "Invoke this Doctrine skill when current work involves reading or writing external data: files, network, config, subprocess output, IPC, serialized formats, model output; auth, permissions, secrets, crypto, untrusted paths, uploads, subprocess execution, or privileged operations; user-owned, personal, or sensitive data that is stored, transmitted, logged, cached, exported, retained, or deleted; changing a running or deployed system where a code revert alone would not undo the effects; or adding, upgrading, or removing a dependency, or touching a manifest, lockfile, vendored or generated state."
user-invocable: false
---

## Responsibility

Protects external, trust, data, deployment, and dependency boundaries by making contracts explicit and preserving security, user data, reversibility, and supply-chain integrity.

Discovery cues are shorthand only. Classify the current work against each canonical trigger and read every matching reference before covered work; a cue never narrows its trigger.

## Supporting references

- [boundaries.md](${CLAUDE_SKILL_DIR}/boundaries.md) — **reading or writing external data: files, network, config, subprocess output, IPC, serialized formats, model output.** Canonical trigger: external input/output, files, network, config, subprocesses, serialized data, IPC, APIs, or model output crosses a boundary.
- [security.md](${CLAUDE_SKILL_DIR}/security.md) — **auth, permissions, secrets, crypto, untrusted paths, uploads, subprocess execution, or privileged operations.** Canonical trigger: authentication, authorization, permissions, secrets, cryptography, untrusted files or paths, uploads, subprocess execution, network requests, databases, serialization or deserialization, templating, plugins or extensions, or privileged operations are touched.
- [user-data.md](${CLAUDE_SKILL_DIR}/user-data.md) — **user-owned, personal, or sensitive data that is stored, transmitted, logged, cached, exported, retained, or deleted.** Canonical trigger: user-owned, personal, sensitive, durable, uploaded, persisted, remotely stored, exported, retained, deleted, transmitted, logged, cached, or permissioned data is touched.
- [reversal.md](${CLAUDE_SKILL_DIR}/reversal.md) — **changing a running or deployed system where a code revert alone would not undo the effects.** Canonical trigger: changing behavior in a running or deployed system can produce persistent data, messages, external side effects, caches, client state, or other effects that a code revert alone may not undo.
- [dependencies.md](${CLAUDE_SKILL_DIR}/dependencies.md) — **adding, upgrading, or removing a dependency, or touching a manifest, lockfile, vendored or generated state.** Canonical trigger: dependencies, manifests, lockfiles, generated or vendored state, upgrades, removals, or migrations are touched.
