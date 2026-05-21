---
name: change-reviewer
description: Use when classifying agentic change requests, identifying risk, required checks, review gates, and required docs or ADR updates.
---

# Change Reviewer

## When To Use

Use this skill before accepting or implementing changes that affect commerce, integration, fulfillment, customer data, deployment, or governance boundaries.

## Rules

- Classify risk before implementation.
- Check source authority.
- Require human review gates for high-risk domains.
- Confirm schemas, examples, docs, checklists, and ADRs are updated or explicitly unchanged.
- Preserve open questions.

## Expected Output Format

- Change type:
- Affected domain:
- Risk level:
- Required checks:
- Required human review gate:
- Required docs/ADR updates:

## References

- `docs/context/agentic-change-governance.md`
- `docs/checklists/architecture-change-checklist.md`
- `docs/checklists/shopify-change-checklist.md`
- `docs/checklists/integration-flow-checklist.md`
- `schemas/change-request.schema.json`
- `schemas/governance-decision.schema.json`
