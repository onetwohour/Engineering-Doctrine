### 20.4 Locale and culture are not translation

Language, locale, country, and culture are related but not interchangeable. Do not treat a country or language community as culturally homogeneous, and do not infer preferences from broad cultural stereotypes when product-specific or audience-specific evidence exists.

Localization preserves meaning and function across language and locale. Cultural adaptation may also affect examples, information ordering, trust cues, formality, symbols, interaction expectations, or visual presentation, but only when the target context provides a real reason. Culturalization is not decorative theming.

**Time** — represent absolute instants in UTC where appropriate; preserve civil dates, local times, and named time zones when they are part of domain semantics. Recurring schedules stay anchored to the time zone that owns their meaning and resolve to instants per occurrence. Do not convert a date-only or local-time value into an instant without an explicit zone or domain rule. Do not assume the server's time zone.

**Formatting** — use locale-appropriate dates, decimal and thousands separators, currency, measurement units, and symbol placement.

**Sorting** — collation may be locale-dependent; byte order is not human alphabetical order in many languages.

**Pluralization and grammar** — do not assume categories or inflection rules from the source language.

**Layout** — account for text expansion, line breaking, writing direction, typography, and zoom. A layout that only fits the source language or source-locale assumptions is unfinished.

---
