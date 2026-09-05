# Engineering Doctrine

**English** · [简体中文](README.zh-CN.md) · [한국어](README.ko.md)

**Engineering Doctrine** is a working-discipline plugin for Claude Code. Before making changes, it guides Claude Code to identify the actual cause, ownership, invariants, lifecycle, and boundaries; change only what is necessary; verify behavior with evidence; and review the full change again before declaring the work complete.

## Installation

```bash
claude plugin marketplace add onetwohour/claude-plugins
claude plugin install engineering-doctrine@onetwohour
```

After installing, start a new Claude Code session.

## Usage

No separate command is required. Ask for work as you normally would.

```text
Find the cause of the intermittent session loss after login and fix it.
```

```text
Analyze the ownership structure of this module and refactor it if necessary.
```

```text
Reproduce this bug, fix it, and add a regression test.
```

Only the rules needed for the type and risk of the task are applied. Small changes stay lightweight, while complex work involving architecture, state, security, data, concurrency, or migrations receives deeper review.

## What changes when you use it?

Claude Code more consistently aims to:

- Fix the actual cause rather than the symptom
- Confirm ownership, state, and invariants before implementation
- Avoid unnecessary abstractions and architecture ceremony
- Make safe, precise file changes
- Derive tests from the model and failure space
- Never claim verification for work that was not actually run
- Preserve user data and existing work
- Review the diff and evidence again before completion

## Full Doctrine

The complete Engineering Doctrine is available at [doctrine/ENGINEERING_DOCTRINE.md](doctrine/ENGINEERING_DOCTRINE.md).

## Local Usage

To run the plugin from a clone without installing it:

```bash
git clone https://github.com/onetwohour/Engineering-Doctrine.git
claude --plugin-dir ./Engineering-Doctrine/plugin
```

`--plugin-dir` applies to that session only, so pass it every time you start Claude Code.

## If the doctrine skills are not being used

Claude Code lists every skill's name and description in the model's context, but that listing has a budget of about 1% of the model's context window. When many skills are installed, Claude Code shortens or drops descriptions, starting with the skills invoked least. The doctrine skills are loaded only by Claude, so they are the first to lose their descriptions, and without a description Claude cannot tell when to load them.

Check with `/context` (the Skills row shows the listing as the model receives it) and `/doctor` (the listing's cost and its biggest contributors). If the listing is over budget, raise it in `settings.json` with `"skillListingBudgetFraction": 0.02`, or set skills you do not need to `"name-only"` in `skillOverrides`.

After context compaction, Claude Code re-attaches each invoked skill, keeping the first 5,000 tokens of each within a combined 25,000-token budget and filling from the most recently invoked. Every doctrine skill fits the per-skill limit, but all twelve together come to roughly 26,800 tokens, so a session that loads most of them can lose the earliest-invoked ones. Invoke a skill again to restore it, by name if you want to force it: `/engineering-doctrine:mutation-safety`.

## License

[Apache-2.0](LICENSE)
