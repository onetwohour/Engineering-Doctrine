### 13.2 Find the existing owner before adding a concept

Before introducing a new type, module, helper, utility, service, repository, adapter, parser, serializer, validator, error type, configuration mechanism, or architectural abstraction, search for the concept and behavior already present in the repository — not only the name you intend to use. If overlapping implementations exist, determine the canonical owner before adding another. A new abstraction needs a clear responsibility, owner, and reason it cannot be expressed by an existing concept without making that concept less coherent.

---
