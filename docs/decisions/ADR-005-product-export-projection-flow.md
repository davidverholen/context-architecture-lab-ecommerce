# ADR-005: Product Export Projection Flow

## Status

Accepted

## Context

The lab currently models product governance with `mock-pim` and sample rug product data. The intended real-world direction is to introduce Akeneo CE as an optional local PIM source, then export governed product data toward Shopify.

Adding Akeneo directly to the runtime without first defining the boundary would let a tool shape the architecture by accident.

## Decision

Akeneo CE may be introduced as an optional real PIM source after the product export boundary is specified.

The product export and projection flow is separate from the order fulfillment flow:

- Akeneo/PIM owns governed product data.
- `akeneo-event-bridge` adapts local Akeneo webhook payloads to the repo's product export contract.
- n8n owns visible orchestration, retries, and operator visibility.
- `product-projection-service` owns validation, mapping, idempotency, auditability, and projection decisions.
- `mock-shopify` remains the default local target for product projection dumps.
- `shopify-admin-target` may be used as an optional live Shopify target after official Shopify documentation is verified and credentials are intentionally configured outside the repository.

## Consequences

- `mock-pim` remains the stable test double for service tests and schema examples.
- Akeneo CE is introduced through an optional local setup under ignored `.local/akeneo/pim/`, not as a default dependency.
- Product export contracts are specified before implementation.
- The local flow now uses Akeneo CE webhook events plus a local bridge. Official Akeneo Event Platform support is still not assumed for Community Edition.
- The bridge ignores non-rug product events because the lab projection contract currently models only rug products.
- The default projection target is a mock dump target.
- Live Shopify projection is opt-in through ADR-006 and must keep credentials outside source control.
- Product projection changes require product projection review.
- n8n workflows must remain orchestration and must not own durable mapping rules.

## Contract Artifacts

- [Product Export Flow](../commerce/product-export-flow.md)
- [Akeneo Local Setup](../commerce/akeneo-local-setup.md)
- [Akeneo Integration Boundary](../../integrations/akeneo/README.md)
- [Akeneo webhook product event schema](../../schemas/akeneo-webhook-product-event.schema.json)
- [Mock Shopify Projection Target](../commerce/mock-shopify-target.md)
- [Shopify Live Sync](../commerce/shopify-live-sync.md)
- [Shopify Live Target Adapter ADR](ADR-006-shopify-live-target-adapter.md)
- [Akeneo product export schema](../../schemas/akeneo-product-export.schema.json)
- [Product projection job schema](../../schemas/product-projection-job.schema.json)
- [Product projection result schema](../../schemas/product-projection-result.schema.json)
- [Akeneo rug export sample](../../examples/products/akeneo-rug-export.sample.json)
- [Product projection job sample](../../examples/products/product-projection-job.sample.json)
- [Product projection result sample](../../examples/products/product-projection-result.sample.json)

## Follow-Up

- Decide whether the local bridge should persist processed event IDs before any production-like replay or retry testing.
- Decide whether to verify Akeneo webhook signatures in the bridge before using it outside local development.
- Verify official Akeneo and Shopify docs before implementation-specific behavior is added.
