# Enterprise Build Template

Use this GitHub Template repository to start new projects with enterprise-grade build gates.

How to use:
1) Click "Use this template" in GitHub to create a new repository (repo)
2) Clone the new repo locally
3) Run: .\scripts\enterprise_init_wizard.ps1

What this enforces:
- Requirements/CANONICAL.json schema validation
- MUST flows cannot be marked done unless matching E2E (End-to-End) test file exists
- Secret scanning + dependency scanning
