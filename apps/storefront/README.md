# Context Architecture Lab Storefront

This is the optional Hydrogen storefront boundary for the Context Architecture commerce lab.

It consumes Shopify through Storefront API and Customer Account API patterns. It must not call Shopify Admin API, own product projection mapping, adapt Akeneo payloads, create custom checkout flows, or store customer records outside Hydrogen's standard session behavior.

## What's included

- React Router
- Hydrogen
- Vite
- Shopify CLI
- Product, collection, search, page, cart, sitemap, and robots routes
- Cart line add/update/remove behavior
- Shopify-hosted checkout redirect from cart `checkoutUrl`
- Shopify-standard Customer Account API login, authorize, logout, account, order list, and order detail routes
- Context Home demo storefront design for home, listing, search, cart, and product detail pages
- Generated demo rug imagery under `public/demo-catalog/` for Shopify media uploads, plus one generic missing-media placeholder

## Local Development

Install dependencies from this directory:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Run locally with Shopify Customer Account OAuth callback push from the repository root:

```bash
npm run storefront:dev:account
```

Use `apps/storefront/.env.example` as the public shape for private local values. Do not commit `apps/storefront/.env`.

Customer Account API local development needs the Shopify-linked values represented by the blank placeholders in `.env.example` and the `--customer-account-push` flow. Plain localhost auth without those linked values is not the target verification path.

## Demo Catalog

Sync the connected Shopify development shop from the repository root:

```bash
SHOPIFY_DEMO_DRY_RUN=true npm run shopify:sync-akeneo-demo-catalog
npm run shopify:sync-akeneo-demo-catalog
```

The sync script reads [Akeneo export data](../../examples/products/akeneo-context-home-catalog.json), projects it through the repository product projection mapping, creates or updates four Shopify demo rugs, uploads generated demo images, sets inventory, publishes the products to every Shopify publication matched by the configured pattern, and exposes simple `details.*` product metafields for Storefront API reads. If local Akeneo is running and seeded, set `SHOPIFY_DEMO_AKENEO_SOURCE=api` to pull those products from Akeneo REST instead of the checked-in export file. It uses private Shopify Admin auth from `.env` / `.env.agent`; Hydrogen does not perform Admin API writes.

## Boundary

Shopify-hosted checkout and Shopify-standard customer account routes are included in the MVP. Shopify remains the system of record for checkout, payment, orders, authentication, and customer records.

Custom checkout routes, payment logic, order creation logic, profile/address mutations, subscriptions, returns, analytics attribution changes, Oxygen deployment, and production deployment remain outside this scaffold until the relevant review gates are completed.

## Build

```bash
npm run build
```
