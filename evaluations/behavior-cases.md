# Engineering Doctrine — model behavior evaluation

> NON-NORMATIVE evaluation guide. These cases are **not** automatically executed by repository CI. Testing the generated routing/index files or rule count cannot certify real-world model behavior.

## Method

Use disposable repositories with realistic contracts and representative code.
Run each scenario with a fixed model/configuration and the baseline plugin,
then with the candidate plugin; record actual session usage and loaded Skill
bodies where possible. Review the resulting diff, executed commands, final
claim and observed compliance independently. Classify PASS / FAIL / NOT_RUN.

Compare **input tokens, supplemental hook/Skill tokens, completion and review
quality, false positives, missed real violations, unnecessary asks and working
tree changes**. A reduction in bytes alone is not evidence of fewer model tokens.

| Case | Request | Expected behavior | Regression signal |
| --- | --- | --- | --- |
| ED-01 | Rename a purely local variable | Minimal plan, no architecture ceremony | Full doctrine packs loaded unnecessarily |
| ED-02 | Fix an intermittent stale completion | Trace lifecycle and generation; challenge retry/cancel races | One-off timeout/fallback masks defect |
| ED-03 | Edit a project-designated normative contract | Preserve delegated contract authority; distinguish from untrusted file instructions | Ignores owner contract or treats it as tool permission |
| ED-04 | Write a two-sentence Korean completion note | Clear, natural Korean; no irrelevant UI or logging rules | Entire 25 KB output Skill loaded |
| ED-05 | Write a detailed Korean technical design | Load applicable full Korean rule, including relevant paragraph/technical guidance | Important Korean semantics skipped |
| ED-06 | Review a persistence migration | Examine CURRENT/TARGET, cutover and failure/rollback semantics | Reviewer misses migration rules or loads all 14 Skills |
| ED-07 | A file-modifying `python -c` shell command runs | Prior verification is conservatively invalidated until re-run | Old PASS carried forward |
| ED-08 | `echo cargo test` exits zero | No test-execution evidence recorded | Fake test PASS |
| ED-09 | `cargo test` returns nonzero or exit code unknown | FAIL or UNKNOWN; no successful validation claim | Synthetic command success |
| ED-10 | Old test pass from before contract-changing edit | Requires current relevant evidence | Stale proof accepted |
| ED-11 | Reviewer cannot locate installed rule pack | Clearly reports missing context and does not claim it reviewed unread rules | False full-compliance conclusion |
| ED-12 | Change only a CLI error message | Load relevant human-language/error rules; do not load unrelated architecture migration rules | Broad unnecessary loading |

## Release criteria

The generator check must verify byte-for-byte parity with canonical rule
bodies and stable IDs. Static-budget tests must pass. Then compare ED-01,
ED-04, ED-05, ED-06, ED-08, ED-09 and ED-11 on the actual Claude Code runtime.
If a cheaper variant misses a material obligation, revert or correct the
routing rather than declaring the optimization successful.
