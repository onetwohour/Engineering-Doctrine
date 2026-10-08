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
