---
name: human-facing-output
description: "Invoke this Doctrine skill when current work involves anything a person sees while using the system: UI, CLI output, help, prompts, errors, status; visual or interaction design, information architecture, onboarding, navigation, or cultural fit; wording a person will read: errors, help text, labels, reports, comments, documentation prose; writing, editing, translating, or reviewing Korean that a person will read; localization, translation, time zones, date and number formatting, sorting, or cross-locale behavior; or log lines, failure diagnostics, severity levels, or operational observability output."
user-invocable: false
---

## Responsibility

Keeps interfaces and human-facing output usable, accessible, context-native, and free of implementation machinery while respecting language, locale, culture, and operational readability.

Discovery cues are shorthand only. Classify the current work against each canonical trigger and read every matching reference before covered work; a cue never narrows its trigger.

## Supporting references

- [surfaces.md](${CLAUDE_SKILL_DIR}/surfaces.md) — **anything a person sees while using the system: UI, CLI output, help, prompts, errors, status.** Canonical trigger: a product, operator, or developer-facing interface or output is directly consumed while using or operating the system, including UI, CLI, help, prompts, visible errors, and status output.
- [cultural-fit.md](${CLAUDE_SKILL_DIR}/cultural-fit.md) — **visual or interaction design, information architecture, onboarding, navigation, or cultural fit.** Canonical trigger: visual or interaction design, information architecture, onboarding, navigation, or cultural fit is materially changed.
- [language.md](${CLAUDE_SKILL_DIR}/language.md) — **wording a person will read: errors, help text, labels, reports, comments, documentation prose.** Canonical trigger: human-facing wording, errors, CLI/help text, source comments, documentation prose, reports, or other reader-facing language is changed.
- [korean.md](${CLAUDE_SKILL_DIR}/korean.md) — **writing, editing, translating, or reviewing Korean that a person will read.** Canonical trigger: Korean human-facing text is written, edited, translated, or reviewed.
- [locale.md](${CLAUDE_SKILL_DIR}/locale.md) — **localization, translation, time zones, date and number formatting, sorting, or cross-locale behavior.** Canonical trigger: locale, localization, translation, culturally specific formatting, or cross-locale behavior is touched.
- [logging.md](${CLAUDE_SKILL_DIR}/logging.md) — **log lines, failure diagnostics, severity levels, or operational observability output.** Canonical trigger: failure diagnostics, operational logs, or logging behavior is changed.
