# Commerce Integration Service

## Responsibility

Map commerce events into canonical integration models and downstream contracts.

## Inputs and Outputs

- Input: Shopify order-created sample at `POST /orders/shopify-created`.
- Output: canonical order, mock WMS order, optional mock WMS response, or mapping failure.

## Belongs Here

- Schema validation.
- Order mapping.
- SKU mapping.
- Idempotency.
- Auditability.
- Complex error handling.

## Does Not Belong Here

- Visual workflow orchestration.
- Product enrichment ownership.
- Real Shopify API calls in MVP v0.1.

## Future MVP Step

Add richer idempotency persistence, audit events, OpenAPI documentation, and retry/error classification.

## Local Docker

Run through Docker Compose as `commerce-integration-service`. The service listens on `process.env.PORT` and exposes `GET /health`.

The service owns `services/commerce-integration-service/Dockerfile`, which sets the image default command for this service.

## Future Cloud Run Notes

This service is container-ready, but deployment is deferred. Before Cloud Run deployment, decide service-to-service authentication for the mock WMS dependency, configure `MOCK_WMS_URL` outside the repository, and add durable idempotency and audit storage.
