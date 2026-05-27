# Domain Model

Core domains:

- Product: governed product information such as family, SKU, material, dimensions, color, origin, care, and enrichment status.
- Catalog Projection: commerce-facing product representation derived from PIM data for Shopify.
- Storefront: optional Hydrogen customer-facing boundary that consumes Shopify through Storefront API and Customer Account API patterns and redirects to Shopify-hosted checkout.
- Order: customer purchase event represented in canonical integration form.
- Fulfillment: downstream preparation to ship ordered items.
- WMS: warehouse system boundary represented by `mock-wms`.
- Integration Flow: workflow orchestration from event intake through validation, mapping, delivery, and failure handling.
- Agentic Change Request: proposed change to code, docs, schemas, workflows, or governance with risk classification and review gate.

The model is intentionally small so ownership boundaries remain visible.
