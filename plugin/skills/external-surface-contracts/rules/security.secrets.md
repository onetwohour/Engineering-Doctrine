### 17.3 Secrets encountered during work

Read credential material only when required by the task, and only as much as required. Never reproduce a secret's value in reports, logs, commits, fixtures, errors, comments, or examples; refer to it by name and location.

If a credential is found committed or present in history: report its location without reproducing its value; stop operations that could expose, propagate, rotate, delete, or rewrite it or its history; do not rotate, delete, or rewrite without owner authority; continue independent work only when doing so cannot increase exposure. **Finding a secret does not authorize destructive cleanup.**
