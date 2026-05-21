---
name: shopify-architect
description: Use when modeling Shopify products, variants, metafields, metaobjects, Storefront API, Admin API, Hydrogen/headless, or PIM-to-Shopify projections in this repository.
---

# Shopify Architect

## When To Use

Use this skill for Shopify product modeling, projection design, API-specific work, or headless commerce decisions.

## Rules

- Shopify is commerce projection, not product master.
- Use a mock Shopify projection target before real Shopify Admin API integration.
- Use native Shopify fields first.
- Use variants only for purchasable differences.
- Use metafields for simple structured attributes.
- Use metaobjects for reusable structured concepts.
- Verify current official Shopify docs before API-specific implementation.
- Do not add Hydrogen or real Shopify sync in MVP v0.1 unless explicitly requested.
- Do not add real Shopify credentials to this repository.
- Keep live Shopify sync inside `shopify-admin-target`; do not put Admin API tokens or GraphQL calls directly in n8n.
- Treat Akeneo product removal as Shopify archive by default unless permanent deletion is explicitly reviewed and configured.

## Expected Output Format

- Projection intent:
- Native field choices:
- Variant choices:
- Metafield choices:
- Metaobject choices:
- Source docs checked:
- Mock target impact:
- Review gate:

## References

- `docs/commerce/pim-vs-shop.md`
- `docs/commerce/akeneo-to-shopify-projection.md`
- `docs/commerce/shopify-product-model.md`
- `docs/commerce/mock-shopify-target.md`
- `docs/commerce/shopify-live-sync.md`
- `docs/commerce/product-export-flow.md`
- `docs/checklists/shopify-change-checklist.md`
- `sources/external/shopify/README.md`
