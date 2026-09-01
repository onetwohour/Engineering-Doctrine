---
name: human-facing-output
description: Keeps interfaces and human-facing output usable, accessible, context-native, and free of implementation machinery while respecting language, locale, culture, and operational readability. Applies to UI, CLI, help, prompts, visible errors, and status output; visual, interaction, information-architecture, onboarding, navigation, and cultural-fit design; reader-facing wording, errors, help text, comments, documentation, and reports; Korean human-facing language; localization, translation, formatting, and cross-locale behavior; or failure diagnostics and operational logging.
user-invocable: false
---

## Responsibility

Keeps interfaces and human-facing output usable, accessible, context-native, and free of implementation machinery while respecting language, locale, culture, and operational readability.

Discovery cues are shorthand only. Classify the current work against each canonical trigger and read every matching reference before covered work; a cue never narrows its trigger.

## Supporting references

- [surfaces.md](${CLAUDE_SKILL_DIR}/surfaces.md) — **UI, CLI, help, prompts, visible errors, and status output.** Canonical trigger: a product, operator, or developer-facing interface or output is directly consumed while using or operating the system, including UI, CLI, help, prompts, visible errors, and status output.
- [cultural-fit.md](${CLAUDE_SKILL_DIR}/cultural-fit.md) — **visual, interaction, information-architecture, onboarding, navigation, and cultural-fit design.** Canonical trigger: visual or interaction design, information architecture, onboarding, navigation, or cultural fit is materially changed.
- [language.md](${CLAUDE_SKILL_DIR}/language.md) — **reader-facing wording, errors, help text, comments, documentation, and reports.** Canonical trigger: human-facing wording, errors, CLI/help text, source comments, documentation prose, reports, or other reader-facing language is changed.
- [korean.md](${CLAUDE_SKILL_DIR}/korean.md) — **Korean human-facing language.** Canonical trigger: Korean human-facing text is written, edited, translated, or reviewed.
- [locale.md](${CLAUDE_SKILL_DIR}/locale.md) — **localization, translation, formatting, and cross-locale behavior.** Canonical trigger: locale, localization, translation, culturally specific formatting, or cross-locale behavior is touched.
- [logging.md](${CLAUDE_SKILL_DIR}/logging.md) — **failure diagnostics and operational logging.** Canonical trigger: failure diagnostics, operational logs, or logging behavior is changed.
