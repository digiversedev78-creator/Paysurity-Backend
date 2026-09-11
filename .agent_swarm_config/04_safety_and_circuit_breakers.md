# Article IV: Safety Protocols & Circuit Breakers

## 1. The Infinite Loop Circuit Breaker (Rule of 3)
To prevent infinite agent feedback loops and token drain:
- If a Coder Agent submits a Pull Request and fails QA verification **3 consecutive times** on the same task, the execution loop is immediately killed.
- The ticket is flagged and escalated for human intervention or Chief Architect re-routing.

## 2. Zero-Trust Tooling & Secrets Management
Under the Zero-Trust mandate, no sensitive configurations are ever hardcoded.
- All agents must strictly authenticate and retrieve keys dynamically via **GCP Secret Manager**.
- Any Pull Request containing hardcoded API keys, salts, or passwords will trigger an immediate, fatal security rejection by the QA Agent.

## 3. Strict RTM Binding
Code generation must be directly linked to approved architecture.
- The QA Agent forcefully rejects any Pull Requests containing undocumented, orphaned, or unapproved code. 
- Every line of code must trace back to a specific node in the Requirements Traceability Matrix (RTM).
- The RTM syncs automatically and continuously via post-merge `git-hooks` to ensure the Swarm's knowledge state is perfectly aligned with the main branch.
