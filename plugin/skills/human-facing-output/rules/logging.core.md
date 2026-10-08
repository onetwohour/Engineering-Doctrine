## 21. Logging

Log what a maintainer needs to reconstruct the failure without the user present: what was attempted, the relevant identifying key, outcome, duration, retry state, and the external dependency involved. Avoid logging the same failure redundantly at multiple layers unless each event carries distinct operational meaning.

Follow the project's established logging and observability conventions. Severity should reflect actual impact, expectedness, recovery state, and who or what must act; do not impose a universal ERROR/WARN/INFO/DEBUG mapping when the runtime or organization defines different semantics. If no convention exists, choose and document a consistent scheme that lets operators distinguish actionable failure, degraded recovery, normal operational events, and diagnostic detail.

Never log secrets, tokens, full sensitive request bodies, or unnecessary personal data. Do not place unbounded values — arbitrary user IDs, raw input — into metric-label names or other cardinality-sensitive dimensions.

---
