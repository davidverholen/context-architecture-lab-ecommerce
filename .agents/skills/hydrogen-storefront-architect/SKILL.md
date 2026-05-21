---
name: hydrogen-storefront-architect
description: Use when designing, scaffolding, implementing, or reviewing the optional Hydrogen storefront boundary in this repository, including Hydrogen app placement, Storefront API data loading, route scope, storefront environment variables, customer-facing presentation, and ADR-007 review gates.
---

# Hydrogen Storefront Architect

## When To Use

Use this skill for Hydrogen-specific storefront work:

- Choosing where and how to scaffold a Hydrogen app.
- Implementing or reviewing Hydrogen routes, loaders, Storefront API queries, cart/product/collection/search/content reads, or storefront UI.
- Deciding storefront environment variables and secret handling.
- Reviewing whether a storefront change crosses into checkout, Customer Account API, analytics attribution, deployment, or customer data.

Pair this with `shopify-architect` for Shopify product model or API semantics, and with `change-reviewer` when the work affects storefront behavior, checkout, customer data, deployment, or governance gates.

## Rules

- Read `docs/context/index.md`, `docs/commerce/hydrogen-storefront.md`, and `docs/decisions/ADR-007-hydrogen-storefront-boundary.md` before Hydrogen changes.
- Treat official Shopify documentation as source of truth for Hydrogen, Oxygen, Storefront API, Customer Account API, environment variables, and deployment behavior.
- Keep Hydrogen as a customer-facing read boundary over Shopify Storefront API patterns.
- Do not put Shopify Admin API writes, Admin tokens, product projection mapping, Akeneo adaptation, or n8n orchestration inside Hydrogen.
- Keep real storefront tokens, Customer Account API values, Oxygen secrets, and generated Shopify CLI environment files out of source control.
- Keep the default product projection path mock-first; live Shopify remains opt-in through `shopify-admin-target`.
- Stop for review before Customer Account API, checkout, customer identity, analytics attribution, order-affecting behavior, Oxygen deployment, or self-hosted production deployment.
- Update `docs/overview` when adding a real storefront service/app changes runtime flows, service boundaries, or deployment topology.

## Workflow

1. Classify the storefront change: docs-only, scaffold, route/data query, UI behavior, environment, deployment, checkout/customer data, or governance.
2. Select the Hydrogen Storefront context pack from `docs/context/context-packs.md`.
3. Check official Shopify docs before API-specific implementation or version claims.
4. Keep app placement, package scripts, environment names, and route scope explicit.
5. Implement using Hydrogen and repo conventions without leaking product projection responsibilities into the storefront.
6. Validate with the relevant project checks plus Hydrogen build/dev checks once a storefront app exists.
7. Record docs, checklist, ADR, handoff, or open-question updates when the boundary changes.

## Stop Conditions

Stop and request review when the task would:

- Commit real storefront credentials or generated private environment files.
- Add Admin API calls or product writes to Hydrogen.
- Add checkout, Customer Account API, customer identity, analytics attribution, or order-affecting behavior.
- Change publication/sales-channel assumptions without official Shopify verification.
- Add Oxygen or production deployment behavior.
- Make Hydrogen a default runtime dependency without explicit governance review.

## Expected Output Format

- Storefront intent:
- Route/data impact:
- Environment and secrets impact:
- Source docs checked:
- Boundary preserved:
- Required review gate:
- Docs or ADR impact:

## References

- `docs/commerce/hydrogen-storefront.md`
- `docs/decisions/ADR-007-hydrogen-storefront-boundary.md`
- `docs/context/context-packs.md`
- `docs/context/agentic-change-governance.md`
- `docs/commerce/shopify-product-model.md`
- `docs/commerce/shopify-live-sync.md`
- `docs/checklists/shopify-change-checklist.md`
- `sources/external/shopify/README.md`
