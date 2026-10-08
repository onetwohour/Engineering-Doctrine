## 15. Testing

For behavior that is reasonably testable, prefer **RED → GREEN → REFACTOR → VERIFY → USE**: a test that reproduces the failure or specifies the behavior; the smallest solution consistent with the design; clarity without behavior change; focused checks then wider; the real public path exercised once when the environment permits.

Exploratory work — probing an unfamiliar external API, exploratory UI, performance investigation — does not require forced test-first ceremony. Add durable tests once the intended behavior is sufficiently defined.

Choose the strongest level that can genuinely prove the implementation wrong: unit, integration, contract/schema, end-to-end. Test behavior, not incidental internal shape. Cover inputs and outputs, public contracts, state transitions, persistence, side effects, errors, retries, recovery, external boundaries, and user-visible behavior.
