# ADR-004: Agentic Change Governance

## Status

Accepted

## Context

Agents can accelerate implementation but can also cross ownership boundaries if authority is implicit. A technically correct change can still be wrong when it uses another context's language, promotes a local exception, skips a handoff, or treats visible knowledge as permission.

## Decision

Codex and other agents may propose and implement bounded changes when context ownership, source authority, delegated authority, and risk level are explicit.

Knowledge is not permission. Agents may not accept business, customer, fulfillment, deployment, or governance risk. Human owners remain accountable for intent, risk acceptance, exceptions, incidents, policy, autonomy thresholds, source-of-truth status, and durable operating rules.

Medium and high risk changes must record:

- Affected bounded context and neighboring contexts.
- Required, optional, forbidden, and missing-authority context.
- Source authority and examples-only material.
- Required handoff, review gate, and unresolved obligations.
- Accountable human owner or role.
- Evidence required before action.
- Durable memory, ADR, checklist, schema, example, or open-question impact.

Boundary-aware review must check both the artifact and the responsibility path. It should verify semantic ownership, source authority, handoff completion, review gate closure, schema and operational impact, and whether learning needs curation.

## Consequences

- Product projection, storefront, fulfillment, checkout, customer data, Cloud Run, and governance changes require explicit review.
- Agents must identify affected context, source authority, required checks, and durable memory updates.
- Repeated learnings should be proposed as documentation or instruction updates.
- Local exceptions and stale memory do not become policy without owner review.
- MVP v0.1 scope exclusions remain intact unless explicitly requested and approved through scope and governance review.
