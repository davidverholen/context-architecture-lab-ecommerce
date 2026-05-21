# Mock Shopify

This service is the local projection dump target. It is not Shopify and does not call Shopify APIs.

## Responsibility

- Accept Shopify-style product projection payloads.
- Validate payloads with Zod.
- Write projection dumps for local inspection.
- Remove projection dumps for product removal commands.
- Return deterministic local responses.

## Inputs And Outputs

- `GET /health`
- `POST /products/projections`
- `POST /products/removals`
- `GET /products/projections/:projection_id`

Input contracts are [Shopify product projection](../../schemas/shopify-product-projection.schema.json) and [Shopify product removal](../../schemas/shopify-product-removal.schema.json).

## Belongs Here

- Local projection dump storage.
- Contract validation.
- Deterministic mock target behavior.

## Does Not Belong Here

- Real Shopify Admin API calls.
- Shopify credentials.
- Product mapping logic.
- Product governance decisions.

## Local And Future Cloud Run Readiness

The service listens on `process.env.PORT`, binds to `0.0.0.0`, exposes `GET /health`, and has a service-specific Dockerfile. Dump files are a local development convenience; a future Cloud Run deployment would need an approved durable storage strategy.
