# Commerce Architecture Index

This lab models enterprise commerce integration boundaries, not enterprise scale.

Core interpretation:

- Akeneo/PIM is the product data governance and enrichment source.
- Shopify is the customer-facing commerce projection.
- `akeneo-event-bridge` adapts local Akeneo webhook events to the repo product export contract.
- n8n is the visible local workflow and iPaaS learning layer.
- Custom services own validation, domain logic, idempotency, auditability, and complex error handling.
- Mock WMS represents fulfillment integration.
- Markdown docs, ADRs, schemas, and examples govern agentic development.

Read:

- [Domain Model](domain-model.md)
- [PIM vs Shop](pim-vs-shop.md)
- [Akeneo Local Setup](akeneo-local-setup.md)
- [Akeneo to Shopify Projection](akeneo-to-shopify-projection.md)
- [Product Export Flow](product-export-flow.md)
- [Shopify Product Model](shopify-product-model.md)
- [Mock Shopify Projection Target](mock-shopify-target.md)
- [Shopify Live Sync](shopify-live-sync.md)
- [Shopify Admin Agent Access](shopify-admin-agent-access.md)
- [Hydrogen Storefront](hydrogen-storefront.md)
- [n8n as Integration Layer](n8n-as-integration-layer.md)
- [Custom Services Boundaries](custom-services-boundaries.md)
- [Order Fulfillment Flow](order-fulfillment-flow.md)
