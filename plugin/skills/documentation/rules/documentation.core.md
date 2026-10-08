## 24. Documentation

Documentation exists to serve a reader, not to prove that work happened. Do not create or modify documentation unless the owner asks, the repository requires it, a public or interface change requires it, existing documentation would otherwise become false, or durable operational or architectural knowledge genuinely requires prose.

**The maintenance question is part of the decision to write.** Before creating any document, answer: who updates this when the thing it describes changes, and how will anyone notice it has gone wrong? If there is no answer, do not write it. Every document you create is a promise to keep it true; stale documentation is worse than none, because wrong docs stop the reader from checking the code.

Prefer forms that remain synchronized with reality: expressive code → executable tests, schemas, examples, and types → generated documentation → comments beside the implementation → durable owned prose. Decay is proportional to distance from what is described.

Do not duplicate authoritative code structure into prose without a maintenance reason — directory listings, function signatures, config keys, API fields, parameter tables should stay generated. Never knowingly leave documentation describing behavior that changed: update it in the same change or report that it remains stale. Do not silently delete stale documentation owned by someone else (`safety.no-silent-destruction`).
