### 16.3 Performance evidence

Never optimize blindly. Performance work should begin from a reproducible workload and baseline, identify the constrained resource or hot path with measurement or profiling, make the narrowest justified change, then rerun the same measurement and correctness checks. Distinguish CPU, GPU, memory and allocation pressure, disk I/O, network I/O, lock contention, startup, latency, throughput, frame time, binary size, and other resource constraints rather than treating "slow" as one diagnosis.

For noisy runtime metrics such as latency, throughput, startup time, or frame time, a performance claim normally requires repeated samples and a distribution appropriate to the decision: control warm-up, keep input and build configuration constant, compare equivalent machine conditions, and report a central tendency plus relevant tail or spread where it matters. A single noisy before/after timing is weak evidence.

Deterministic metrics such as binary size, serialized bytes, exact allocation counts under a deterministic harness, or other reproducible static quantities may legitimately be supported by an exact measurement rather than a statistical distribution. The evidence model should match the metric.

If the environment cannot support a valid measurement, say so and do not make the claim. Do not trade substantial structural complexity for an unmeasured or insignificant gain.

---
