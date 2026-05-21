# Agentic Change Governance

Agents may draft, analyze, recommend, and implement bounded work. They may not independently accept high-risk business, customer, fulfillment, deployment, or governance risk.

Knowledge is not permission. An agent that knows a plausible answer still needs the right context ownership, delegated authority, risk threshold, and evidence before acting.

Human accountability remains with named people or accountable roles. Agents can carry delegated responsibilities inside bounded work, but they do not own business outcomes, exceptions, incidents, policy, or durable operating rules.

Risk levels:

- Low: docs-only clarification, example cleanup, isolated test change.
- Medium: schema changes, service boundary changes, integration mapping changes, review checklist changes.
- High: product projection, customer-facing storefront behavior, fulfillment behavior, checkout, customer data, governance rules, deployment posture, autonomy thresholds, source-of-truth status.

Review gates are required for:

- Product projection changes.
- Storefront behavior changes.
- Order integration and fulfillment changes.
- Customer data handling.
- Cloud Run deployment readiness.
- Governance boundary changes.

## Decision Rights Record

For medium and high risk work, record:

- Affected bounded context and semantic owner.
- Decision type: act, propose, approve, reject, accept risk, create exception, change policy, or escalate.
- Agent delegated authority and explicit limits.
- Accountable human owner or role.
- Evidence required before action.
- Required handoff or review gate.
- Durable record that survives the decision.

## Boundary-Aware Review

Review should check:

- Source authority and context selection.
- Whether required, optional, forbidden, and missing-authority context were handled correctly.
- Whether semantic ownership differs from file ownership.
- Whether required handoffs were completed and obligations carried forward.
- Schema impact, operational risk, idempotency, auditability, and failure handling.
- Whether a local exception was promoted beyond its scope.
- Durable memory, ADR, checklist, or open-question updates.

## Governance Observability

Governance must stay visible enough to evaluate later. For agentic changes, preserve the relevant trail:

- Which context pack was used.
- Which sources were treated as authoritative.
- Which handoff or review gate was required.
- Which owner approved or blocked the interpretation.
- Which obligations remain open.
- Where learning was routed after the change.

These are project review signals, not a requirement to add a monitoring platform in MVP v0.1.

## MVP Boundary

MVP v0.1 excludes Paperclip Teams, RAG, and Cloud Run deployment unless explicitly requested and approved through scope and governance review. Akeneo CE is approved only as optional local setup behind the product export/projection boundary. Live Shopify sync is approved only as an optional `shopify-admin-target` adapter behind ADR-006 and must not become a default dependency without review. Hydrogen is approved only as an optional storefront boundary behind ADR-007 and must not become a default dependency without review.
