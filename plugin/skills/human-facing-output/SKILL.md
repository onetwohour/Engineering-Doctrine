---
name: human-facing-output
description: "Wording a person will read, including a reply to the owner: reports, errors, help text, labels, comments, documentation prose; writing, editing, translating, or reviewing Korean, in a reply or in any artifact a person will read; anything a person sees while using the system: UI, CLI output, help, prompts, errors, status; localization, translation, time zones, date and number formatting, sorting, or cross-locale behavior; log lines, failure diagnostics, severity levels, or operational observability output; or visual or interaction design, information architecture, onboarding, navigation, or cultural fit. Read this doctrine BEFORE writing anything a person will read, in a reply or in any artifact."
---

## Responsibility

Keeps interfaces and human-facing output usable, accessible, context-native, and free of implementation machinery while respecting language, locale, culture, and operational readability.

Cues are discovery shorthand; the rules below are the binding text, in doctrine order and grouped by the trigger that routes them.

**Cue: Anything a person sees while using the system: UI, CLI output, help, prompts, errors, status.** Canonical trigger: a product, operator, or developer-facing interface or output is directly consumed while using or operating the system, including UI, CLI, help, prompts, visible errors, and status output.

## 19. Human-facing surfaces

Usability is a correctness property. A feature is not complete if an ordinary user cannot tell what to do, must understand unnecessary implementation concepts, must perform avoidable steps, cannot recover from mistakes, loses work, sees development machinery, or cannot use the feature accessibly.

Ask: What does the person actually see? What will they understand? Is the intended action obvious in this product and context? Can they complete the task without developer knowledge? Can mistakes be recovered safely? Is their work preserved? Is visible complexity genuinely necessary — and is it for the person, or for implementation convenience?

Choose safe defaults. Do not ask users to supply information the system can reliably determine unless explicit choice, consent, authority, preference, or confirmation is itself part of the requirement. Respect people's time: avoid unnecessary clicks, repeated entry, configuration, confirmation, explanation, internal concepts, and recovery steps. Do not expose a configuration option merely because implementing the correct default is harder. The surface reflects how people understand the task, not the database schema or internal state machine.

### 19.1 User-visible states

Where applicable, define: first entry, loading, empty, normal, partial failure, error, recovery, unauthorized. An empty state must be understandable; when a meaningful next action exists, expose it without inventing one merely to fill the screen. A failure state leaves a way to retry, correct, cancel, or recover where such recovery exists — never turn a recoverable failure into an unnecessary fatal exit, and never swallow it silently.

### 19.2 Accessibility

Accessibility is functional correctness: semantic controls; keyboard operation; logical focus, restored after modal interactions; labels on icon-only controls; meaning never carried by color alone; zoom and text scaling supported; errors identify both the field and the remedy; platform conventions followed. Do not regress accessibility merely to simplify implementation.

### 19.3 CLI and developer-facing tools

CLI and developer tools are human-facing surfaces too: readable default output, explicit flags for machine formats, errors on stderr, meaningful exit codes, actionable failure messages, progress for genuinely long operations, interruption without corruption, help written in user concepts. Do not force operators to reverse-engineer internal state to understand normal output.

### 19.4 Development machinery must not leak

Before finishing user-visible work, inspect the real surface for accidental exposure of: debug, test, or staging controls; mock toggles; agent metadata; internal IDs; enum names; class names; database concepts; API field names; environment variables; file paths; stack traces; build metadata; placeholder text; dummy data presented as real.

Invisible testing hooks are acceptable when they do not alter the human experience. Do not reshape human interfaces for automation convenience. When recurring automation materially needs a machine contract, prefer an appropriate machine interface rather than distorting the human interface.

**Cue: Visual or interaction design, information architecture, onboarding, navigation, or cultural fit.** Canonical trigger: visual or interaction design, information architecture, onboarding, navigation, or cultural fit is materially changed.

### 19.5 Context-native and culturally situated design

No visual or interaction convention is culturally neutral merely because it is common in global software. Do not default without evidence to a familiar "modern" aesthetic, information density, card/grid structure, navigation model, icon metaphor, whitespace ratio, typography hierarchy, color association, interaction rhythm, direct-choice framing, or onboarding pattern.

Likewise, do not localize by stereotype: adding traditional motifs, changing colors, increasing or reducing density, altering hierarchy, or choosing symbols merely because users belong to a country, language, ethnicity, generation, or other broad group is not cultural adaptation.

Derive design from the actual product, task, content, brand, platform, established local conventions, accessibility needs, and evidence about the intended audience. Product type and individual variation may matter more than a broad cultural label. When cultural fit is material and evidence is missing, investigate representative usage or authoritative local guidance rather than substituting a stereotype.

A localized surface should feel native because its information architecture, interaction, language, and visual decisions fit the context — not because cultural decoration was added to a globally generic design.

---

**Cue: Wording a person will read, including a reply to the owner: reports, errors, help text, labels, comments, documentation prose.** Canonical trigger: human-facing wording, errors, CLI/help text, source comments, documentation prose, reports, or other reader-facing language is changed.

## 20. Human-facing language

Write as though the text was conceived for the target language, audience, product, and medium — not translated from another language and not generated from a generic prose template. Preserve the intended meaning, but let the target language determine what should be explicit, omitted, repeated, ordered, grouped, or left to context.

Do not impose source-language discourse patterns — often English in model-generated material — merely because they are familiar: unnecessary subjects or pronouns, topic-sentence-first paragraphing, forced triads, symmetrical pros-and-cons, excessive bulleting, direct address, support-desk phrasing, generic transitions, repeated summaries, or explanatory padding. Use any of these when they are natural and useful in the actual target context, not as default scaffolding.

Do not overcorrect into artificial localness. Natural language is not lexical purification, maximal localization, or a performance of cultural identity. Do not replace established loanwords, product terms, technical vocabulary, conventional abbreviations, or internationally shared concepts merely to make text look less foreign. Do not add idioms, honorific padding, slang, dialect, cultural references, or stylistic quirks unless the audience and surface actually call for them.

Use established vocabulary before inventing vocabulary. Preserve distinctions between concepts; do not let one vague metaphorical word stand for several unrelated operations. A local or project-specific term needs a real concept behind it and should be defined before readers must rely on it.

Natural-language edits are semantic edits. Do not rewrite by blind global substitution when the same surface form can have different meanings or grammatical roles. Review occurrences in context. This does not prohibit exact mechanical edits whose semantics are proven uniform.

Do not substitute evaluative adjectives for information. Claims such as robust, flexible, powerful, efficient, clean, or scalable require a concrete property, mechanism, constraint, measurement, or comparison. State the property instead of decorating the conclusion.

Do not manufacture balance when the evidence supports a conclusion. State the conclusion and its basis. When evidence is insufficient, state the missing fact that would resolve or materially change the decision instead of padding the text with symmetrical arguments.

Organize sentences, paragraphs, headings, and lists according to the target language, audience, and medium. Clarity requires visible relationships between ideas; it does not require every language to copy English sentence length, paragraph rhythm, explicitness, or list structure. Use prose, lists, tables, or fragments according to what the surface convention and information structure actually need.

### 20.1 Errors

Human-facing errors communicate: what did not happen; why, if known; what the person can do next.

```text
✗ Error: ECONNREFUSED at line 42
✓ Couldn't connect to the server. Try again.
```

Do not invent a cause when it is unknown — a correct next step beats a guessed explanation. Do not show ordinary users unnecessary stack traces, raw exceptions, file paths, internal IDs, enum names, class names, API fields, or credentials.

### 20.2 Register

Use the register expected by the audience and surface; do not import formality, intimacy, directness, apology, or enthusiasm from the source language or a generic assistant persona. Keep register internally coherent unless a deliberate role difference requires otherwise.

Labels should name actions or states in the convention users already understand. Prefer a specific action label over a generic confirmation label when it makes the consequence clearer, but follow established platform and product conventions when those are more recognizable.

Apologize only when apology is appropriate to the product's responsibility and the target culture/register; never reflexively apologize for the user's valid input merely because an operation failed.

**Cue: Writing, editing, translating, or reviewing Korean, in a reply or in any artifact a person will read.** Canonical trigger: Korean human-facing text is written, edited, translated, or reviewed.

### 20.3 Korean

Write Korean as Korean, not as English syntax with Korean words and not as an exercise in removing foreign-looking vocabulary. Judge nativeness at the sentence, paragraph, and discourse levels, not only by whether each individual sentence is grammatical. Let Korean determine what can remain implicit, how clauses connect, where a topic needs to be restated, and how information is grouped.

Let Korean omit what context already makes recoverable, but distinguish natural omission from semantic loss. Omit subjects, pronouns, arguments, and other material when the intended referent or relation remains readily recoverable from the local context; reintroduce them when the topic changes, two plausible referents compete, a long interruption makes the antecedent uncertain, or the distinction itself matters. Do not satisfy a cold-reader or explicitness requirement by mechanically repeating the same subject in consecutive sentences. Explicitness means that the relation can be reconstructed without hidden context, not that every clause restates every noun.

Concision is not permission to collapse ordinary Korean prose into telegraphic shorthand. In prose, do not string together noun phrases, adverbial phrases, bare stems, or connective endings merely to save tokens when a predicate, ending, particle, or explicit relation is needed to make the statement clear. Fragments remain appropriate where the actual surface convention calls for them, including headings, labels, table cells, compact status displays, and similar structures.

Handle particles, endings, spacing, predicates, and auxiliary constructions according to their actual grammatical and semantic function. Do not add linguistic material merely to make a sentence longer or more formal, but do not remove material that carries case, scope, tense, aspect, modality, contrast, causality, condition, or another distinction the reader needs.

Prefer verbs over excessive nominalization. Avoid stacked genitive `의` constructions when they hide the relationship between concepts; recast the expression with a predicate, clause, particle, or another ordinary Korean construction when that makes the relation materially clearer. Do not mechanically remove `의` when the genitive construction itself is natural and unambiguous.

Keep established technical terms, loanwords, abbreviations, product names, identifiers, and domain vocabulary when they are what competent Korean readers actually use. Translate them only when the translated term is established or materially clearer. Native Korean, Sino-Korean, loanwords, and established foreign terminology are all legitimate; immediate comprehension and domain precision outrank lexical purity, formality, or preference for any vocabulary origin. Keeping an English technical term does not require keeping English word order around it: preserve the term, then make the surrounding sentence ordinary Korean.

Use ordinary, specific vocabulary for ordinary operations. Do not replace a precise action or relation with a colorful, metaphorical, or overly colloquial expression merely because it sounds more vivid or conversational. Keep figurative or colloquial language when it is established for the relevant audience, medium, or domain and remains at least as clear as the literal alternative.

#### Korean technical and specification prose

Technical prose often fails in Korean even when every term is correct because the source-language discourse structure survives translation. Do not translate the grammatical role of an English sentence when Korean would express the same relation differently.

In particular, do not routinely give software artifacts human speech, cognition, perception, entitlement, or motion merely because English technical prose can use verbs such as *say*, *ask*, *know*, *see*, *own*, *live*, *walk*, or *end* metaphorically. Name the actual operation or relation instead. Depending on the semantics, use verbs such as `정의한다`, `기록한다`, `보관한다`, `읽는다`, `조회한다`, `요청한다`, `검사한다`, `반환한다`, `전달한다`, `소비한다`, `선택한다`, `거절한다`, or `의존한다`. This is not a ban on established domain metaphors; keep terms such as tree, graph, pipeline, ownership, source of truth, or other project vocabulary when the metaphor itself is an established concept. The failure is importing an incidental English metaphor as Korean sentence structure.

Do not let one metaphorical noun stand in for several technical distinctions. Words corresponding to *truth*, *world*, *path*, *story*, *question*, *answer*, *voice*, or similar abstractions must not replace a more precise concept such as canonical state, stored value, execution environment, control flow, request, query result, return value, or authority unless the project deliberately defines the metaphor as a term.

Do not serialize an English declaration pattern into a chain of short Korean sentences merely because each source sentence had an explicit subject. When several consecutive sentences share one topic, combine or reorganize them if that makes the relations clearer. Repeating `A는 ...`, `A는 ...`, `A는 ...` is appropriate when contrast or independent emphasis requires it, not as the default translation of repeated English subjects.

Do not use punctuation as a substitute for Korean clause relations. In particular, an em dash, colon, slash, or parenthetical aside must not become the default glue for reason, contrast, consequence, condition, or qualification. When the relation matters, express it through an ordinary connective ending, conjunction, particle, or a clean sentence boundary. Punctuation may still be used where Korean technical writing conventionally uses it and where it improves rather than replaces the syntax.

Lists are for genuinely parallel items, lookup structures, procedures, alternatives, and other information whose structure is clearer as a list. Do not break continuous reasoning into bullets merely to avoid composing a paragraph, and do not turn every property into a one-line proclamation. A normative specification may remain concise and forceful while still using complete Korean sentences and natural paragraph structure.

Normative force does not require English-style proclamation. Preserve `MUST`, `MUST NOT`, `SHOULD`, `MAY`, identifiers, rule names, and other canonical tokens when the document defines them, but let Korean carry the surrounding relation. The reader should be able to distinguish obligation, prohibition, condition, exception, reason, and consequence without reconstructing an English sentence underneath the Korean one.

```text
✗ 파일은 index가 이미 한 번 읽었다. 두 번 읽으면 파일이 무엇을 말하는지에 대한 답이 둘이 된다.
  Entry가 본문을 들고 있고 search는 그것을 읽는다.

✓ 파일 내용은 index에서 한 번만 읽는다. search는 index가 보관한 Entry의 본문을 사용하며
  파일을 별도로 다시 읽지 않는다. 따라서 같은 파일 상태를 서로 다른 경로에서 중복 관리하지 않는다.
```

```text
✗ Package는 Resource를 선언한다. Package는 Service를 호출한다.
  Package는 System을 알지 못한다.

✓ Package는 사용할 Resource와 Service를 Manifest에 선언하고, 실행 중에는 선언된 Service를 통해서만
  외부 기능을 요청한다. System 구현에는 직접 의존하지 않는다.
```

```text
✗ view는 아무것도 바꾸지 않는다 — request를 쓴다 — 실제 변경은 ledger가 한다.

✓ view는 상태를 직접 변경하지 않고 request만 기록한다. 실제 변경은 ledger가 처리한다.
```

```text
✗ 규칙이 한 곳으로 내려갔다. 이 함수가 경로를 묻고, resolver가 답한다.

✓ 경로 계산 규칙은 이 함수 하나에서 정의한다. 호출자는 이 함수를 통해 경로를 조회하고,
  resolver는 계산된 경로를 사용한다.
```

The corrected examples are not templates to copy mechanically. Their point is that the Korean version names the actual operation, removes redundant subjects when the topic is stable, and expresses the relation between clauses directly instead of preserving the source-language metaphor or punctuation skeleton.

#### Paragraph-level review

When writing or materially revising more than a short Korean message, review the finished passage as Korean prose rather than checking isolated sentences. Look specifically for:

- the same explicit subject repeated across adjacent sentences although the referent is already stable
- inanimate software artifacts made to speak, ask, know, see, deserve, walk, or otherwise act like people without an established technical reason
- abstract English metaphors translated literally where a concrete operation, state, authority, or result would be clearer
- chains of short declarative sentences that preserve source-language order instead of Korean information flow
- em dashes, colons, parentheses, or bullets carrying relationships that ordinary Korean syntax should express
- stacked nouns or genitives whose semantic relation is only obvious after mentally reconstructing an English phrase
- technical terms that are correct individually but surrounded by unnatural English word order
- a paragraph that is locally grammatical yet still reads as if it was translated sentence by sentence rather than conceived as one Korean passage

If one of these patterns appears, rewrite the affected sentence or paragraph as a semantic unit. Do not repair it by blind word substitution or by globally banning a particular verb or punctuation mark; the same surface form can be correct in another context.

Keep the register and politeness level expected by the audience and surface. Do not copy dropped particles, broken grammar, telegraphic compression, excessive slang, or other accidental defects from a user's wording merely because they appeared in the prompt. This does not override an explicit request for a particular voice, dialect, formality level, character voice, or other deliberate style.

Use passive constructions when they are natural and the actor is irrelevant. Do not force active voice merely because English writing guidance prefers it. Avoid reflexive apology and do not expand concise content into ceremonial explanation merely because polite Korean permits it.

```text
✗ 변경 영향 검토 후 반영 예정.        ✓ 변경이 미치는 영향을 검토한 뒤 반영할 예정입니다.
✗ 캐시 삭제 시 세션 재생성 필요 확인. ✓ 캐시를 삭제하면 세션을 다시 만들어야 하는지 확인합니다.
✗ 당신의 계정을 확인해 주세요.        ✓ 계정을 확인해 주세요.
✗ 저장이 완료되었습니다.              ✓ 저장했습니다.
✗ 오류가 발생하였습니다.              ✓ 불러오지 못했습니다.
✗ 삭제를 수행하시겠습니까?            ✓ 삭제할까요?
```

Avoid fixed particles after arbitrary interpolated values; restructure the sentence or select the particle correctly. Do not assume the sentence for count `0` is the ordinary count sentence with a zero substituted.

**Cue: Localization, translation, time zones, date and number formatting, sorting, or cross-locale behavior.** Canonical trigger: locale, localization, translation, culturally specific formatting, or cross-locale behavior is touched.

### 20.4 Locale and culture are not translation

Language, locale, country, and culture are related but not interchangeable. Do not treat a country or language community as culturally homogeneous, and do not infer preferences from broad cultural stereotypes when product-specific or audience-specific evidence exists.

Localization preserves meaning and function across language and locale. Cultural adaptation may also affect examples, information ordering, trust cues, formality, symbols, interaction expectations, or visual presentation, but only when the target context provides a real reason. Culturalization is not decorative theming.

**Time** — represent absolute instants in UTC where appropriate; preserve civil dates, local times, and named time zones when they are part of domain semantics. Recurring schedules stay anchored to the time zone that owns their meaning and resolve to instants per occurrence. Do not convert a date-only or local-time value into an instant without an explicit zone or domain rule. Do not assume the server's time zone.

**Formatting** — use locale-appropriate dates, decimal and thousands separators, currency, measurement units, and symbol placement.

**Sorting** — collation may be locale-dependent; byte order is not human alphabetical order in many languages.

**Pluralization and grammar** — do not assume categories or inflection rules from the source language.

**Layout** — account for text expansion, line breaking, writing direction, typography, and zoom. A layout that only fits the source language or source-locale assumptions is unfinished.

---

**Cue: Log lines, failure diagnostics, severity levels, or operational observability output.** Canonical trigger: failure diagnostics, operational logs, or logging behavior is changed.

## 21. Logging

Log what a maintainer needs to reconstruct the failure without the user present: what was attempted, the relevant identifying key, outcome, duration, retry state, and the external dependency involved. Avoid logging the same failure redundantly at multiple layers unless each event carries distinct operational meaning.

Follow the project's established logging and observability conventions. Severity should reflect actual impact, expectedness, recovery state, and who or what must act; do not impose a universal ERROR/WARN/INFO/DEBUG mapping when the runtime or organization defines different semantics. If no convention exists, choose and document a consistent scheme that lets operators distinguish actionable failure, degraded recovery, normal operational events, and diagnostic detail.

Never log secrets, tokens, full sensitive request bodies, or unnecessary personal data. Do not place unbounded values — arbitrary user IDs, raw input — into metric-label names or other cardinality-sensitive dimensions.

---
