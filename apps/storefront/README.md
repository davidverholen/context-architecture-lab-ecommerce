# Context Architecture Lab Storefront

This is the optional Hydrogen storefront boundary for the Context Architecture commerce lab.

It consumes Shopify through Storefront API patterns. It must not call Shopify Admin API, own product projection mapping, adapt Akeneo payloads, or store customer-account credentials.

## What's included

- React Router
- Hydrogen
- Vite
- Shopify CLI
- Product, collection, search, page, cart, sitemap, and robots routes
- Cart line add/update/remove behavior

## Local Development

Install dependencies from this directory:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Use `apps/storefront/.env.example` as the public shape for private local values. Do not commit `apps/storefront/.env`.

## Boundary

Checkout redirects, Customer Account API, customer identity, customer data, analytics attribution changes, Oxygen deployment, and production deployment remain outside this scaffold until the relevant review gates are completed.

## Build

```bash
npm run build
```
