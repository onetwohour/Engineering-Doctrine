# Engineering Doctrine

**English** · [简体中文](README.zh-CN.md) · [한국어](README.ko.md)

**Engineering Doctrine** is a Claude Code plugin for disciplined software engineering. It guides Claude through understanding the root cause, identifying ownership and invariants, making focused changes, checking the result, and reviewing the work before completion.

## Installation

```bash
claude plugin marketplace add onetwohour/claude-plugins
claude plugin install engineering-doctrine@onetwohour
```

Start a new Claude Code session after installation.

## Usage

No special command is required. Describe the task as usual:

```text
Find the cause of the intermittent session loss after login and fix it.
```

```text
Analyze the ownership structure of this module and refactor it if necessary.
```

```text
Reproduce this bug, fix it, and add a regression test.
```

The plugin selects guidance based on the task. A small, isolated edit stays lightweight; changes affecting architecture, state, security, data, concurrency, or migrations receive more thorough scrutiny.

## Engineering principles

- **Understand before changing.** Trace causes, responsibilities, state, and failure paths.
- **Respect existing architecture.** Reuse the responsible abstraction rather than creating competing sources of truth.
- **Change with precision.** Keep edits within the justified scope and protect existing work.
- **Verify actual behavior.** Run relevant checks, consider failure cases, and distinguish observations from assumptions.
- **Review before completion.** Inspect the final diff and communicate what was established by evidence.

## Full doctrine

Read the [Engineering Doctrine](doctrine/ENGINEERING_DOCTRINE.md) for the complete engineering principles.

## Local use

To run the plugin from a clone without installing it:

```bash
git clone https://github.com/onetwohour/Engineering-Doctrine.git
claude --plugin-dir ./Engineering-Doctrine/plugin
```

The `--plugin-dir` option applies to the current session.

## License

[Apache-2.0](LICENSE)
