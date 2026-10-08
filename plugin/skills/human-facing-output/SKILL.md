---
name: human-facing-output
description: "Wording a person will read, including a reply to the owner: reports, errors, help text, labels, comments, documentation prose; writing, editing, translating, or reviewing Korean, in a reply or in any artifact a person will read; anything a person sees while using the system: UI, CLI output, help, prompts, errors, status; localization, translation, time zones, date and number formatting, sorting, or cross-locale behavior; log lines, failure diagnostics, severity levels, or operational observability output; or visual or interaction design, information architecture, onboarding, navigation, or cultural fit. Read this doctrine BEFORE writing human-facing prose, UI copy, or explanations."
---

## Responsibility

Keeps interfaces and human-facing output usable, accessible, context-native, and free of implementation machinery while respecting language, locale, culture, and operational readability.

**Loading contract:** This file is a discovery index, not a reduced version of the rules.
For every applicable cue below, read every listed file from `rules/` using this skill's
installed base directory before acting or asserting compliance. Each file contains
the complete authoritative rule body compiled from ENGINEERING_DOCTRINE.md.
Do not infer requirements from these titles alone. Do not load irrelevant cues.
When the necessary files are inaccessible, report the limitation instead of
claiming to have applied an unread rule. Always-tier doctrine is separately injected.

### Cue: Anything a person sees while using the system: UI, CLI output, help, prompts, errors, status

Canonical trigger: a product, operator, or developer-facing interface or output is directly consumed while using or operating the system, including UI, CLI, help, prompts, visible errors, and status output.

- [human.surface-core](rules/human.surface-core.md) — Human-facing surfaces
- [human.visible-states](rules/human.visible-states.md) — User-visible states
- [human.accessibility](rules/human.accessibility.md) — Accessibility
- [human.cli](rules/human.cli.md) — CLI and developer-facing tools
- [human.no-machinery-leak](rules/human.no-machinery-leak.md) — Development machinery must not leak
### Cue: Visual or interaction design, information architecture, onboarding, navigation, or cultural fit

Canonical trigger: visual or interaction design, information architecture, onboarding, navigation, or cultural fit is materially changed.

- [human.cultural-design](rules/human.cultural-design.md) — Context-native and culturally situated design
### Cue: Wording a person will read, including a reply to the owner: reports, errors, help text, labels, comments, documentation prose

Canonical trigger: human-facing wording, errors, CLI/help text, source comments, documentation prose, reports, or other reader-facing language is changed.

- [language.core](rules/language.core.md) — Human-facing language
- [language.errors](rules/language.errors.md) — Errors
- [language.register](rules/language.register.md) — Register
### Cue: Writing, editing, translating, or reviewing Korean, in a reply or in any artifact a person will read

Canonical trigger: Korean human-facing text is written, edited, translated, or reviewed.

- [language.korean](rules/language.korean.md) — Korean
### Cue: Localization, translation, time zones, date and number formatting, sorting, or cross-locale behavior

Canonical trigger: locale, localization, translation, culturally specific formatting, or cross-locale behavior is touched.

- [language.locale-culture](rules/language.locale-culture.md) — Locale and culture are not translation
### Cue: Log lines, failure diagnostics, severity levels, or operational observability output

Canonical trigger: failure diagnostics, operational logs, or logging behavior is changed.

- [logging.core](rules/logging.core.md) — Logging
