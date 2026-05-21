---
name: integration-architect
description: Use when designing n8n flows, middleware, order mapping, product export/projection flows, WMS integration, retries, idempotency, auditability, and integration error handling in this repository.
---

# Integration Architect

## When To Use

Use this skill for order flows, product export/projection flows, n8n workflows, service contracts, WMS integration, and failure handling.

## Rules

- Keep n8n focused on visible workflow orchestration.
- Use `akeneo-event-bridge` for local Akeneo webhook envelope adaptation before n8n.
- Put domain logic, validation, idempotency, auditability, and complex errors in services.
- Keep live Shopify Admin API calls in `shopify-admin-target`; n8n should call the projection service, not Shopify directly.
- Keep product export/projection separate from order fulfillment unless an explicit ADR changes the boundary.
- Validate examples against JSON Schemas.
- Make failure routing explicit.
- Require review for fulfillment-impacting changes.
- Require product projection review for Akeneo-to-Shopify projection changes.

## Expected Output Format

- n8n workflow concern:
- Custom service concern:
- Schema concern:
- Operational monitoring concern:
- Idempotency approach:
- Failure handling:
- Review gate:

## References

- `docs/commerce/n8n-as-integration-layer.md`
- `docs/commerce/custom-services-boundaries.md`
- `docs/commerce/order-fulfillment-flow.md`
- `docs/commerce/product-export-flow.md`
- `docs/commerce/mock-shopify-target.md`
- `docs/checklists/integration-flow-checklist.md`
- `sources/external/n8n/README.md`
