# Shopify Admin Target

Adapter for sending governed product projections to a Shopify shop through the Admin GraphQL API.

## Responsibility

- Receive the repo-owned Shopify projection contract.
- Upsert products into a configured Shopify shop using Admin GraphQL.
- Receive product removal commands from Akeneo-driven events.
- Archive products by default when Akeneo removes a product.
- Permanently delete products only when explicitly configured with `SHOPIFY_DELETE_MODE=permanent`.

## Inputs / Outputs

- `POST /products/projections`: accepts `shopify-product-projection` payloads from `product-projection-service`.
- `POST /products/removals`: accepts removal commands for Akeneo product removal events.
- `GET /health`: reports service health and whether Shopify credentials are configured without exposing secrets.

## What Belongs Here

- Shopify Admin GraphQL endpoint construction.
- Shopify access token usage from environment variables.
- Product upsert and removal calls.
- Shopify user error normalization.

## What Does Not Belong Here

- PIM product governance.
- Projection mapping rules.
- n8n workflow orchestration.
- Real credentials in the repository.
- Storefront or Hydrogen behavior.

## Local Docker

The service is opt-in through the `shopify-live` Compose profile:

```sh
docker compose --profile shopify-live up -d shopify-admin-target
```

Set these in a private `.env` file:

```sh
SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=<private-shopify-admin-token>
SHOPIFY_API_VERSION=2026-04
SHOPIFY_DELETE_MODE=archive
```

Then point `product-projection-service` at this service:

```sh
PRODUCT_PROJECTION_TARGET=shopify-dev-store
PRODUCT_TARGET_URL=http://shopify-admin-target:8088
```

## Future MVP Step

Add a small operator script that verifies credentials with a read-only `shop { name }` query before enabling live writes.
