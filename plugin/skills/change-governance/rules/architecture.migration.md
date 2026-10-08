## Architecture migration and authority handoff

Steady state has one canonical semantic definition and an unambiguous authority path. Migration may temporarily contain multiple representations and paths, but it must not silently create competing semantic authority.

Keep these roles distinct when they coexist:

```text
CURRENT      contract that interprets running/public/persisted behavior now
TARGET       approved contract that becomes current after the change is activated
HISTORICAL   superseded record with no current or target decision authority
```

Normative document status, semantic role (`current/target`), implementation conformance, and runtime activation are separate axes. An approved or merged TARGET does not mean the runtime has cut over; a file rename or branch merge is not an authority handoff.

For old/new representation, backfill, shadow read/write, staged rollout, bridge, controlled dual-write, or read/write cutover, close as applicable:

- migration objective and effective phase/state
- CURRENT and TARGET contract for each phase
- semantic authority and mutation authority
- authoritative read path and crash/restart source of record
- purpose and non-authoritative status of shadow/secondary representations
- partial-success, ordering, retry, idempotency, and ambiguous-outcome semantics for replication or dual-write
- reconciliation when representations diverge
- equivalence/completeness/correctness verification before cutover
- cutover condition and the exact authority/read/write handoff
- rollback boundary and the point after which forward-fix, compensation, or another migration is required
- stale completion, acknowledgement loss, partial commit, duplicate effect, and unknown-outcome handling
- observability for divergence, lag, duplicate effects, and failed backfill
- expiry and removal of old paths and compatibility bridges

A useful monotonic model is `OLD_AUTHORITATIVE → TRANSITION_PREPARED → CUTOVER_COMMITTED → NEW_AUTHORITATIVE → TARGET_BECOMES_CURRENT → OLD_PATH_RETIRED`. The names are optional; at every point a caller must be able to determine which authority to follow. If atomic handoff is impossible, evaluate split-brain prevention such as fencing, epoch/version checks, monotonic switches, or leases.

Shadow reads generate verification evidence, not primary read authority. Shadow or replicated writes maintain a secondary representation, not independent mutation authority. If two paths accept different mutations independently and later synchronize them, treat that as a possible competing-authority steady-state design rather than hiding it under the word migration.

Every transitional topology needs an explicit convergence and terminal condition. If old and new paths must coexist indefinitely, redesign and document that as steady-state architecture instead of leaving a permanent "temporary" architecture.
---
