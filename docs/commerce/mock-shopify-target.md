# Mock Shopify Projection Target

The mock Shopify projection target is a local service that receives Shopify-style product projection payloads before a real Shopify Dev Store is introduced. It belongs to the [Product Export Flow](product-export-flow.md).

## Purpose

- Let the lab test product projection flow without Shopify credentials.
- Provide a visible dump of projected product data.
- Keep Shopify API-specific behavior out of MVP implementation until official docs are verified.

## Responsibilities

The mock target:

- Accept projected product payloads.
- Validate payloads against local schemas.
- Store or write projection dumps for inspection.
- Remove projection dumps when product removal commands arrive.
- Return deterministic success and failure responses.
- Preserves projected product identity through the projection payload.

The mock target should not:

- Pretend to enforce real Shopify limits.
- Replace official Shopify documentation.
- Become the product master.
- Generate product data that is not present in PIM or the projection service output.

## Endpoints

- `GET /health`
- `POST /products/projections`
- `POST /products/removals`
- `GET /products/projections/:projection_id`

Projection dumps are written to ignored `.local/mock-shopify-dumps/` through Docker Compose.

## Later Real Shopify Transition

When a Shopify Dev Store is introduced, the mock target remains useful for tests. Real Admin API calls should be added behind the same projection result contract after official Shopify docs are verified.
