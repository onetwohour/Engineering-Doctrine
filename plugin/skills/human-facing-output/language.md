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
