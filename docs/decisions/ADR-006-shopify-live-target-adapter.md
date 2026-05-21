# ADR-006: Shopify Live Target Adapter

## Status

Accepted

## Context

The lab now has an optional local Akeneo CE event flow that can create, update, and remove rug products. The first target remains `mock-shopify`, but a Shopify Basic shop can now be used as a real customer-facing projection target.

The repo must not put Shopify credentials in source control, and Shopify must not become the product data master.

## Decision

Add `shopify-admin-target` as a separate adapter service behind the same target-facing projection boundary used by `mock-shopify`.

- Akeneo/PIM remains the product master.
- n8n remains visible orchestration.
- `product-projection-service` remains responsible for projection mapping and removal command creation.
- `shopify-admin-target` is the only MVP runtime service that knows Shopify Admin GraphQL endpoint and token details for product projection sync.
- Live Shopify sync is opt-in through Docker Compose profile `shopify-live`.
- Product create and update use Shopify Admin GraphQL `productSet` with a dedicated `pim.external_id` custom ID metafield as the identifier. The value is the repo `pim_product_id`.
- The `pim.external_id` metafield definition must use Shopify metafield type `id` with unique values enabled. Additional projection metadata is written with `metafieldsSet` after the product upsert.
- Local development may use `SHOPIFY_ADMIN_AUTH_MODE=cli` inside `shopify-admin-target` after explicit Shopify CLI store auth. Token auth remains the default runtime mode.
- Akeneo product removal archives the Shopify product by default.
- Permanent Shopify product deletion requires `SHOPIFY_DELETE_MODE=permanent`.

## Consequences

- Local development still works without Shopify credentials.
- Tests can keep using `mock-shopify`.
- Real Shopify writes require private `.env` configuration.
- CLI auth mode allows a local smoke test without committing or minting a separate runtime token, but it is not a production credential strategy.
- Product deletion is treated as a high-risk operation because Shopify product deletion is irreversible.
- Metaobjects are not created in the first live adapter pass; reusable concept data is preserved as projection JSON until metaobject definitions and lifecycle are designed.
- A review gate remains required before considering live Shopify projection approved beyond local/dev-store use.

## Contract Artifacts

- [Product Export Flow](../commerce/product-export-flow.md)
- [Shopify Live Sync](../commerce/shopify-live-sync.md)
- [Shopify Product Model](../commerce/shopify-product-model.md)
- [Shopify Admin Agent Access](../commerce/shopify-admin-agent-access.md)
- [Shopify Change Checklist](../checklists/shopify-change-checklist.md)
- [Shopify product projection schema](../../schemas/shopify-product-projection.schema.json)
- [Shopify product removal schema](../../schemas/shopify-product-removal.schema.json)

## Source Authority

Official Shopify documentation remains the source of truth for Admin GraphQL API behavior, scopes, versions, product limits, product lifecycle, metafields, and metaobjects. Local docs describe project interpretation only.
