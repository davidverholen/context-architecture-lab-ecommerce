# Context Architecture

Source basis: `sources/paper/context-architecture-whitepaper.md`.

This lab treats Context Architecture as a boundary model plus an operating model for agentic software delivery.

## Stable Model

- Enterprise software is organizational knowledge made executable. Correct changes depend on source authority, domain language, ownership, risk, and prior decisions, not only nearby code.
- Context windows are capacity, not architecture. Larger prompts can expose more material while still hiding which source owns the meaning or decision.
- Strategic DDD provides the boundary language: bounded context, ubiquitous language, context map, published language, and anti-corruption layer.
- Minimum needed context is the operating principle. An agent should receive enough selected context to act safely inside a responsibility boundary, with unrelated or unauthorized material kept out.
- Durable memory compounds learning only when curated, owned, scoped, reviewed, and maintained.
- Handoff protocols make boundaries real by changing what an agent may know, do, decide, record, or escalate when work crosses context ownership.
- Boundary-aware review checks the artifact and the responsibility path that produced it.
- Governance separates knowledge from permission. Agents may act within delegated authority, but humans remain accountable for intent, risk, exceptions, incidents, and durable operating rules.

## Repository Interpretation

The repository demonstrates enterprise decision boundaries, not enterprise scale. The current bounded contexts are intentionally small:

- Product data governance and enrichment: PIM/Akeneo interpretation, with optional Akeneo CE setup allowed only behind the product export boundary from ADR-005.
- Commerce projection: Shopify-facing product and customer experience concepts, including optional Hydrogen storefront consumption and Shopify-standard checkout/account integration, with official Shopify docs as source of truth for API behavior.
- Integration workflow: n8n as the visible local workflow layer, with official n8n docs as source of truth for runtime behavior.
- Custom service boundary: validation, domain logic, idempotency, auditability, and complex error handling.
- Fulfillment boundary: mock WMS contracts and fulfillment-facing examples.
- Context and governance boundary: `docs/context`, ADRs, checklists, handoffs, repo skills, and `AGENTS.md`.

## Agent Operating Rules

Before an architectural change, identify:

- Affected bounded context and neighboring contexts.
- Required, optional, forbidden, and missing-authority context.
- Source-of-truth records and examples-only material.
- Stop conditions that require a handoff or review gate.
- Decision rights: who may decide, approve, accept risk, create an exception, or change operating rules.
- Durable memory updates or open questions created by the change.

Context selection uses this precedence:

- Access boundaries beat relevance.
- Owning context beats caller convenience.
- Source-of-truth records beat examples.
- Stale or unknown source status blocks authority.
- Cross-context interpretation requires a handoff.
- Local exceptions do not become global policy without curation and review.

## Failure Modes To Watch

- Missing context: required information was absent.
- Context contamination: wrong domain, abstraction level, time period, or authority path influenced the work.
- Ambiguous authority: relevant information was visible but ownership or decision status was unclear.
- Responsibility drift: a technically plausible change belongs to another owner or authority path.
- Knowledge drift: rationale, terminology, examples, or source status become stale.
- Authority drift: local practice, stale memory, or an exception starts being treated as permission or policy.

## MVP Boundary

MVP v0.1 must not add Paperclip Teams, RAG, or Cloud Run deployment unless explicitly requested and passed through governance and scope review. Akeneo CE is approved only as optional local setup behind the product export/projection boundary. Live Shopify sync is approved only as an optional `shopify-admin-target` adapter behind ADR-006. Hydrogen is approved only as an optional storefront boundary behind ADR-007, with hosted checkout and standard account routes governed by ADR-008. Making any optional integration a default dependency requires review.
