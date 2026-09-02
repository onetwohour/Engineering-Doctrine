## 15. Testing

For behavior that is reasonably testable, prefer **RED → GREEN → REFACTOR → VERIFY → USE**: a test that reproduces the failure or specifies the behavior; the smallest solution consistent with the design; clarity without behavior change; focused checks then wider; the real public path exercised once when the environment permits.

Exploratory work — probing an unfamiliar external API, exploratory UI, performance investigation — does not require forced test-first ceremony. Add durable tests once the intended behavior is sufficiently defined.

Choose the strongest level that can genuinely prove the implementation wrong: unit, integration, contract/schema, end-to-end. Test behavior, not incidental internal shape. Cover inputs and outputs, public contracts, state transitions, persistence, side effects, errors, retries, recovery, external boundaries, and user-visible behavior.

### 15.1 Derive the test space from the model

Do not derive the test set only from the implementation branches, the bug report's exact example, or cases the implementer happened to think of while coding. That merely mirrors the implementation's blind spots. Derive relevant cases independently from requirements, invariants, ownership, state machines, boundary contracts, lifecycle, and failure semantics.

As applicable, challenge:

- **equivalence classes and boundaries** — empty, singleton, minimum/maximum, just-inside/just-outside, malformed, missing, duplicate, stale, and oversized values
- **state and transition space** — each valid transition, invalid transitions, repeated operations, duplicate delivery, out-of-order events, retry, cancellation, restart, shutdown, and recovery
- **interaction space** — combinations of independent axes when their interaction can change behavior; use targeted pairwise/combinatorial coverage rather than blindly enumerating everything
- **ownership and authority** — multiple writers, stale derived state, replay, conflicting updates, cache/source disagreement, and mutation through alternate entry points
- **failure points** — fail before mutation, during partial mutation, at persistence/commit boundaries, after external side effects, on timeout, and during rollback or retry
- **concurrency and ordering** — interleavings that can violate ownership, uniqueness, idempotence, ordering, or lifecycle assumptions
- **properties and invariants** — round-trip, idempotence, monotonicity, conservation, uniqueness, authorization, durability, or other domain properties that should hold across many inputs

When the input or state space is broad and the oracle can be stated, prefer property-based, generative, fuzz, model-based, or fault-injection testing where they can explore more of that space than hand-picked examples.

Coverage depth scales with risk and the size of the relevant state space. A truly local defect may need only the regression plus nearby boundary cases. A stateful, concurrent, persistent, security-sensitive, or externally integrated change needs a wider challenge set.

**"We did not think of that case" is evidence that the test model was incomplete, not a sufficient explanation for the missing test.** When a plausible missed case appears, identify which dimension, invariant, transition, interaction, or failure mode was absent from the model and strengthen the test derivation accordingly.

Prefer real implementations, in-memory substitutes, and test databases over heavy mocking when practical. If a test surfaces evidence that contradicts the model, fix the model before chasing green.

---
