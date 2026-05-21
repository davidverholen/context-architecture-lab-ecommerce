---
name: cloud-run-architect
description: Use when preparing or reviewing Node.js service readiness for Google Cloud Run, container behavior, health endpoints, PORT handling, secrets, and deployment posture.
---

# Cloud Run Architect

## When To Use

Use this skill for service readiness reviews or future deployment preparation.

## Rules

- Do not deploy in MVP v0.1.
- Ensure services are container-ready.
- Ensure services listen on `PORT`.
- Ensure health endpoint exists.
- Avoid secrets in repo.
- Update `docs/checklists/cloud-run-readiness-checklist.md` when readiness rules change.

## Expected Output Format

- Service:
- Container readiness:
- `PORT` handling:
- Health endpoint:
- Secret handling:
- Logging:
- Checklist impact:
- Deployment status:

## References

- `docs/checklists/cloud-run-readiness-checklist.md`
- `sources/external/google-cloud-run/README.md`
- `services/`
