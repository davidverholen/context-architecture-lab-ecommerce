# Handoff Protocols

A handoff is a controlled boundary exchange between bounded contexts. It moves a question, constraint, review request, exception, or learning candidate to the context that owns the answer without transferring ownership.

## When A Handoff Is Required

Use a handoff when:

- The current change crosses semantic, data, workflow, security, policy, deployment, or governance ownership.
- The agent has relevant context but not authority to interpret it.
- A required source belongs to another context or has unclear status.
- The change could turn a local exception into shared policy.
- A review gate requires approval from a context owner.

## Minimum Handoff Record

Every handoff should include:

- Source context and receiving context.
- Requested decision, constraint, review, access approval, exception, or translation.
- Change intent and business reason.
- Relevant context pack and source authority.
- Minimum information allowed to cross the boundary.
- Information that must not cross the boundary.
- Inputs, outputs, schemas, and published language used for translation.
- Known constraints, assumptions, obligations, and unresolved questions.
- Risk level, review gate, accountable owner, and evidence required.
- Handoff status and closure reason.
- Durable memory or learning-loop follow-up after completion.

## Status And Closure

Use simple statuses until a richer workflow exists:

- Requested: the source context has asked the receiving context for a decision or constraint.
- Answered: the receiving context has responded, but obligations may remain open.
- Approved with obligations: the answer allows work to proceed only if named obligations are carried forward.
- Blocked: required authority, evidence, or source material is missing.
- Escalated: the normal owner or policy path is insufficient.
- Expired or superseded: the handoff no longer applies and must not be reused as authority.
- Closed: the source context accepted the answer, recorded obligations, and routed any learning.

A handoff with unresolved obligations is still open and should block final review.

## Boundary Protection

Handoffs operationalize context maps and published language. They let one context ask another for a decision or translation without importing the receiving context's whole model.

In this lab:

- Product projection changes must preserve the PIM/Akeneo-to-Shopify boundary and use schemas/examples as published language.
- Storefront changes must preserve the split between Hydrogen Storefront API reads, Shopify-standard Customer Account API route rendering, Shopify-hosted checkout redirect, product projection writes, Admin API credentials, checkout ownership, and customer data ownership.
- Agent/operator Shopify Admin access must preserve the split between explicit tool access, runtime sync, and accountable review gates.
- Order integration and fulfillment changes must preserve the split between n8n orchestration, custom service logic, and mock WMS contracts.
- Governance changes must preserve human accountability, review gates, and explicit decision rights.
- Shared memory updates must preserve source, scope, owner, and review state so reuse does not become silent policy promotion.
