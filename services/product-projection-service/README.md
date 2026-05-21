# Product Projection Service

This service owns the local Akeneo-to-Shopify projection boundary.

## Responsibility

- Accept local Akeneo product event/export payloads.
- Validate runtime payloads with Zod.
- Convert Akeneo rug product data into a projection job.
- Map approved rug products to the local Shopify product projection contract.
- Send accepted projections to the configured target.
- Convert Akeneo product removals into target removal commands.
- Return structured projection failures.

## Inputs And Outputs

- `GET /health`
- `POST /products/akeneo-events`
- `POST /products/projection-jobs`

Input contracts are [Akeneo product export](../../schemas/akeneo-product-export.schema.json) and [product projection job](../../schemas/product-projection-job.schema.json).

Output contract is [product projection result](../../schemas/product-projection-result.schema.json). Removal commands use [Shopify product removal](../../schemas/shopify-product-removal.schema.json).

## Belongs Here

- Mapping rules.
- Completeness checks.
- Idempotency-key construction.
- Projection failure classification.
- Target-call behavior for mock or live Shopify projection targets.

## Does Not Belong Here

- n8n workflow orchestration.
- Real Shopify Admin API calls; those belong in `shopify-admin-target`.
- Akeneo credential handling.
- Long-lived production queue behavior.

## Local And Future Cloud Run Readiness

The service listens on `process.env.PORT`, binds to `0.0.0.0`, exposes `GET /health`, and has a service-specific Dockerfile. Future Cloud Run deployment remains out of scope until explicitly requested.
