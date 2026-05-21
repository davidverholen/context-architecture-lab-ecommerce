# Order Fulfillment Flow

MVP flow:

1. n8n receives a Shopify order-created sample at the local webhook path `order-created-to-wms`.
2. n8n calls `commerce-integration-service` at `POST /orders/shopify-created` using the local Docker service name.
3. The service validates the event with Zod at the runtime boundary.
4. The service maps the event to a canonical order.
5. The canonical order is mapped to a mock WMS order.
6. The service posts the mock WMS order to `mock-wms` when `MOCK_WMS_URL` is configured.
7. `mock-wms` accepts `POST /orders` unless an item SKU is `UNKNOWN-SKU`.
8. `UNKNOWN-SKU` returns `SKU_MAPPING_MISSING` and a rejected integration status.
9. n8n returns either a success response, a structured `SKU_MAPPING_MISSING` response, or a generic integration failure response.

The flow should preserve source order identity, SKU mapping decisions, idempotency keys, and failure details. It should not hide fulfillment failures inside a successful workflow status.

The n8n skeleton lives at `n8n/workflows/order-created-to-wms.json`. It is intentionally thin: n8n owns visible orchestration and HTTP response routing, while transformation, validation, SKU mapping, and WMS failure details remain inside custom services.
