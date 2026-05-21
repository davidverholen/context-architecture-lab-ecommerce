# Mock WMS

## Responsibility

Represent a warehouse management system boundary for fulfillment integration tests.

## Inputs and Outputs

- Input: mock WMS order at `POST /orders`.
- Output: accepted response unless a line item SKU is `UNKNOWN-SKU`, which returns `SKU_MAPPING_MISSING`.

## Belongs Here

- WMS contract validation.
- Deterministic acceptance and rejection responses.
- Failure scenarios such as `SKU_MAPPING_MISSING`.
- Health endpoint.

## Does Not Belong Here

- Shopify product modeling.
- PIM enrichment.
- Agentic governance decisions.

## Future MVP Step

Add fixture-driven fulfillment states and retryable failure cases.

## Local Docker

Run through Docker Compose as `mock-wms`. The service listens on `process.env.PORT` and exposes `GET /health`.

The service owns `services/mock-wms/Dockerfile`, which sets the image default command for this service.

## Future Cloud Run Notes

This service is container-ready, but deployment is deferred. Before Cloud Run deployment, decide whether it remains a local/mock-only dependency, how access is restricted, and how deterministic fixture behavior is versioned.
