# Engineering Doctrine

**English** · [简体中文](README.zh-CN.md) · [한국어](README.ko.md)

**Engineering Doctrine** is a working-discipline plugin for Claude Code. Before making changes, it guides Claude Code to identify the actual cause, ownership, invariants, lifecycle, and boundaries; change only what is necessary; verify behavior with evidence; and review the full change again before declaring the work complete.

## Installation

```bash
claude plugin marketplace add onetwohour/Engineering-Doctrine
claude plugin install engineering-doctrine@onetwohour
```

After installation, start a new Claude Code session.

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

If you checked out this repository directly:

```bash
claude --plugin-dir ./plugin
```
