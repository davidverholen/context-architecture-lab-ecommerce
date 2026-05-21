---
name: shopify-architect
description: Use when modeling Shopify products, variants, metafields, metaobjects, Storefront API, Admin API, headless commerce boundaries, Shopify Admin agent access, or PIM-to-Shopify projections in this repository. Pair with hydrogen-storefront-architect for Hydrogen app scaffolding, routes, loaders, Storefront API storefront reads, and storefront UI.
---

# Shopify Architect

## When To Use

Use this skill for Shopify product modeling, projection design, API-specific work, Admin API boundaries, Storefront API semantics, or headless commerce decisions.

## Rules

- Shopify is commerce projection, not product master.
- Use a mock Shopify projection target before real Shopify Admin API integration.
- Use native Shopify fields first.
- Use variants only for purchasable differences.
- Use metafields for simple structured attributes.
- Use metaobjects for reusable structured concepts.
- Verify current official Shopify docs before API-specific implementation.
- Hydrogen is allowed only as the optional storefront boundary governed by ADR-007; use `hydrogen-storefront-architect` for Hydrogen implementation details.
- Do not add real Shopify sync as a default dependency; keep live sync optional through ADR-006.
- Do not add real Shopify credentials to this repository.
- Keep live Shopify sync inside `shopify-admin-target`; do not put Admin API tokens or GraphQL calls directly in n8n.
- Treat repo-local Shopify Admin MCP/operator access as explicit tool access, not runtime sync authority.
- Treat Akeneo product removal as Shopify archive by default unless permanent deletion is explicitly reviewed and configured.

## Expected Output Format

- Projection intent:
- Native field choices:
- Variant choices:
- Metafield choices:
- Metaobject choices:
- Source docs checked:
- Mock target impact:
- Storefront impact:
- Review gate:

## References

- `docs/commerce/pim-vs-shop.md`
- `docs/commerce/akeneo-to-shopify-projection.md`
- `docs/commerce/shopify-product-model.md`
- `docs/commerce/mock-shopify-target.md`
- `docs/commerce/shopify-live-sync.md`
- `docs/commerce/shopify-admin-agent-access.md`
- `docs/commerce/hydrogen-storefront.md`
- `docs/commerce/product-export-flow.md`
- `docs/decisions/ADR-007-hydrogen-storefront-boundary.md`
- `docs/checklists/shopify-change-checklist.md`
- `sources/external/shopify/README.md`
