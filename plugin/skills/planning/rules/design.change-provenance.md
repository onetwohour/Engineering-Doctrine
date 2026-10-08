### 12.1 Keep why, what, and how separate

Where a project records change provenance — because the repository already does, or the owner asks — keep three questions in distinct artifacts rather than collapsing them into one document: why the change is needed, what must be true once it is done, and how the repository will be changed to get there. Follow the project's existing names and layout; do not impose a structure on a repository that has its own.

Each layer is settled at a different time, so each is evidence of something different. Do not write an implementation choice into the statement of why unless it is already a settled constraint. Do not let the plan quietly redefine what was agreed. Preserving the layers is what makes it possible to find later where a requirement turned into something else.

Record uncertainty instead of resolving it silently. Distinguish a fact from a decision, a constraint, an assumption, an open question, and a risk. An open question answered without the owner is an unrecorded decision, and the record will not show that it was ever open.

A plan owes its completion proof. "Implement authentication" is not a plan; "anonymous requests return 401, valid sessions return 200, expired sessions are rejected, and the integration suite passes" is. State what changes, in what order, and the signal that will show each stage is done.

Why and the agreed outcome are historical once settled and are not rewritten to match what was built. The plan is a live contract: when the approved approach changes during implementation, update it in the same change rather than leaving the next reader a plan the repository no longer follows.

---
