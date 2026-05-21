# Mock PIM

## Responsibility

Represent PIM/Akeneo product governance and enrichment through local mock product data.

## Inputs and Outputs

- Input: product query through `GET /products` or `GET /products/:sku`.
- Output: governed rug PIM product sample.

## Belongs Here

- PIM product fixtures.
- Product completeness status.
- Product family and attribute vocabulary.

## Does Not Belong Here

- Shopify as source of product truth.
- Real Akeneo CE setup in MVP v0.1.
- Customer-facing merchandising behavior.

## Future MVP Step

Add more product fixtures and completeness-state examples.

## Local Docker

Run through Docker Compose as `mock-pim`. The service listens on `process.env.PORT` and exposes `GET /health`.

The service owns `services/mock-pim/Dockerfile`, which sets the image default command for this service.

## Future Cloud Run Notes

This service is container-ready, but deployment is deferred. Before Cloud Run deployment, decide whether mock PIM belongs in a hosted environment or should remain local-only, and do not add real Akeneo credentials in this repository.
