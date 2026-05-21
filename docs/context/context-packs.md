# Context Packs

A context pack is a small explicit bundle of task-relevant memory. It is selected context, not a broad prompt.

## Selection Categories

Classify context before acting:

- Required: the agent needs this before making the change.
- Allowed optional: the agent may inspect it if the task requires more evidence.
- Forbidden: the agent must not use it for this task because it belongs to another owner, abstraction level, conflicting model, or access boundary.
- Missing authority: the agent must stop, ask for a handoff, or escalate.

When in doubt, source authority and ownership beat convenience.

## Pack Shape

A good pack names:

- Task goal.
- Affected bounded context and neighboring contexts.
- Source authority and examples-only material.
- Required docs, ADRs, schemas, examples, and checklists.
- Required, optional, forbidden, and missing-authority context.
- Inputs, outputs, contracts, and published language.
- Known risks, review gate, and accountable owner.
- Stop conditions and handoff route.
- Open questions and durable memory follow-up.

## Example: Order Integration Pack

- `docs/commerce/order-fulfillment-flow.md`
- `docs/commerce/custom-services-boundaries.md`
- `schemas/canonical-order.schema.json`
- `schemas/mock-wms-order.schema.json`
- `docs/checklists/integration-flow-checklist.md`
- `docs/context/handoff-protocols.md`
- `docs/context/agentic-change-governance.md`

Stop conditions: fulfillment behavior, customer data handling, schema contract changes, unclear WMS authority, or missing idempotency/audit evidence.

## Example: Governance Change Pack

- `docs/context/index.md`
- `docs/context/context-architecture.md`
- `docs/context/agentic-change-governance.md`
- `docs/context/handoff-protocols.md`
- `docs/context/durable-memory.md`
- `docs/context/learning-loops.md`
- `docs/context/open-questions.md`
- `docs/decisions/ADR-004-agentic-change-governance.md`
- `docs/checklists/architecture-change-checklist.md`
- `docs/checklists/learning-loop-checklist.md`
- `AGENTS.md`

Stop conditions: changing project principles, changing review gates, accepting governance risk, promoting local exceptions to policy, or adding excluded MVP capabilities.

## Example: Product Projection Pack

- [Product Export Flow](../commerce/product-export-flow.md)
- [Akeneo to Shopify Projection](../commerce/akeneo-to-shopify-projection.md)
- [Shopify Product Model](../commerce/shopify-product-model.md)
- [Mock Shopify Projection Target](../commerce/mock-shopify-target.md)
- [Shopify Live Sync](../commerce/shopify-live-sync.md)
- [ADR-002: PIM Shop Projection](../decisions/ADR-002-pim-shop-projection.md)
- [ADR-005: Product Export Projection Flow](../decisions/ADR-005-product-export-projection-flow.md)
- [ADR-006: Shopify Live Target Adapter](../decisions/ADR-006-shopify-live-target-adapter.md)
- [Akeneo product export schema](../../schemas/akeneo-product-export.schema.json)
- [Shopify product projection schema](../../schemas/shopify-product-projection.schema.json)
- [Product projection result schema](../../schemas/product-projection-result.schema.json)
- [Akeneo rug updated event sample](../../examples/products/akeneo-rug-updated-event.sample.json)
- [Shopify rug projection sample](../../examples/products/shopify-rug-projection.sample.json)
- [Integration Flow Checklist](../checklists/integration-flow-checklist.md)
- [Shopify Change Checklist](../checklists/shopify-change-checklist.md)

Stop conditions: Shopify credentials in repo, unverified Shopify limits, unverified Akeneo Event Platform behavior, product completeness ambiguity, permanent Shopify deletion, or changing whether Shopify is a projection rather than product master.

## Example: Hydrogen Storefront Pack

- [Hydrogen Storefront](../commerce/hydrogen-storefront.md)
- [Shopify Product Model](../commerce/shopify-product-model.md)
- [Shopify Live Sync](../commerce/shopify-live-sync.md)
- [ADR-007: Hydrogen Storefront Boundary](../decisions/ADR-007-hydrogen-storefront-boundary.md)
- [ADR-002: PIM Shop Projection](../decisions/ADR-002-pim-shop-projection.md)
- [ADR-006: Shopify Live Target Adapter](../decisions/ADR-006-shopify-live-target-adapter.md)
- [Shopify Change Checklist](../checklists/shopify-change-checklist.md)
- [Shopify Sources](../../sources/external/shopify/README.md)

Stop conditions: Storefront tokens in repo, Admin API writes from Hydrogen, customer account or checkout behavior, unverified Storefront API behavior, deployment topology changes, or changing whether PIM/Akeneo remains product master.

## MVP Forbidden Context

For MVP v0.1, do not use context packs to smuggle in implementation of Paperclip Teams, RAG, Cloud Run deployment, or default production Shopify sync. Those require explicit scope and governance review. Akeneo CE is permitted only through the optional local setup and product export boundary from [ADR-005](../decisions/ADR-005-product-export-projection-flow.md). Live Shopify sync is permitted only through the optional adapter boundary from [ADR-006](../decisions/ADR-006-shopify-live-target-adapter.md). Hydrogen is permitted only through the optional storefront boundary from [ADR-007](../decisions/ADR-007-hydrogen-storefront-boundary.md).
