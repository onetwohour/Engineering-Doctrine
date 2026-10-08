# Contributing to Engineering Doctrine

This document is for maintainers and contributors. The [README](README.md) is the product introduction.

## Source of truth

The engineering rules are authored in [`doctrine/ENGINEERING_DOCTRINE.md`](doctrine/ENGINEERING_DOCTRINE.md). Do not edit generated policy files, Skill entrypoints, or rule files directly.

`scripts/build-doctrine.mjs` compiles the doctrine into `plugin/skills/`, runtime payloads, review agents, and policy metadata. Rule IDs, applicability, and binding content must remain consistent across the generated outputs.

`scripts/doctrine-runtime.mjs` is the canonical runtime implementation; `plugin/runtime/doctrine-runtime.mjs` is its generated copy.

## Regenerate and validate

Requirements: Node.js as configured in [GitHub Actions](.github/workflows/ci.yml).

```bash
node scripts/build-doctrine.mjs
node scripts/build-doctrine.mjs --check
node --test tests/*.test.mjs
node scripts/report-delivery-size.mjs --check
```

Run the generator after changing canonical rules or runtime source. Run the checks before submitting changes. CI also validates generated projections.

## Design and verification

The plugin distinguishes the presence of a command from observed execution, and successful execution from the semantic correctness of the implementation. Review the proof boundary when modifying the runtime or evidence handling.

Skill entrypoints select applicable rules; individual generated rule files carry their full content. Changes to loading or routing must preserve rule IDs, complete rule bodies, and applicability.

The [behavior evaluation cases](evaluations/behavior-cases.md) describe manual scenarios for evaluating actual Claude Code behavior. Static file-size reporting is not a measurement of model input tokens, and automated repository checks do not replace those behavioral evaluations.

For implementation history, consult the [commit history](https://github.com/onetwohour/Engineering-Doctrine/commits/main), not the product README.
