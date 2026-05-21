# n8n

n8n is the local workflow layer for this lab. It represents iPaaS-like integration thinking through visible workflows while keeping domain logic in custom services.

Official n8n documentation is the source of truth. See `sources/external/n8n/README.md`.

Workflow import is manual in MVP v0.1. Workflow skeletons should stay thin and call the custom services instead of embedding durable business logic in n8n.

For agent-driven development, `n8n/workflows/*.json` is the reviewable source artifact. The local n8n instance is the visible runner/editor, not the durable source of truth.

Workflow skeletons:

- [Order Created to Mock WMS](workflows/order-created-to-wms.json)
- [Akeneo Product Updated to Product Target](workflows/akeneo-product-updated-to-mock-shopify.json)

## Import Notes

The workflow is export-style JSON and may need manual import adjustments depending on the local n8n version, especially in the HTTP Request and Respond to Webhook node parameters. It uses no credentials and calls only local Docker service names.

To try it locally:

1. Start the stack with `docker compose up --build`.
2. Open `http://localhost:5678`.
3. Import the tracked workflow JSON with `npm run n8n:import`, or import one file manually through the n8n UI.
4. Open the workflow and execute it in test mode.
5. Confirm HTTP Request node URLs use local Docker service names.

Validate workflow JSON before importing:

```sh
npm run n8n:validate
```

Import tracked workflows into the running local n8n instance:

```sh
npm run n8n:import
```

The import command waits for `http://localhost:5678/healthz` by default before running the n8n CLI import. Override this with `N8N_HEALTH_URL` only if the local port changes.

Export workflows from the running local n8n instance for review:

```sh
npm run n8n:export
```

Exports go to `.local/n8n-export/workflows/`. Review them before copying changes back into `n8n/workflows/`, because exported workflows may include instance-specific metadata or credential references.

Tracked workflow JSON files must keep a stable top-level `id`. Without one, repeated CLI imports can create duplicate local workflows instead of overwriting the intended workflow.

## Curl Testing

While the workflow is open in test mode:

```sh
curl -X POST http://localhost:5678/webhook-test/order-created-to-wms \
  -H 'content-type: application/json' \
  --data @examples/orders/shopify-order-created.sample.json
```

For the `SKU_MAPPING_MISSING` path, post the same sample after changing the first line item SKU to `UNKNOWN-SKU`.

When the workflow is activated, use the active webhook path:

```sh
curl -X POST http://localhost:5678/webhook/order-created-to-wms \
  -H 'content-type: application/json' \
  --data @examples/orders/shopify-order-created.sample.json
```

## Workflow Shape

1. Receive order-created event.
2. Call `commerce-integration-service` at `POST /orders/shopify-created`.
3. Inspect the returned `status`, `canonical_order`, `mock_wms_order`, and optional `wms_response`.
4. Route accepted responses to success logging.
5. Route `SKU_MAPPING_MISSING` to a structured `422` response.
6. Route generic integration failures to a structured `502` response.

Workflow exports will live in `n8n/workflows/`.

## Product Update Projection

The product workflow models the event-driven goal without embedding Shopify credentials or assuming official Akeneo Event Platform support for local Community Edition. In the runnable local flow, Akeneo CE sends product webhook events to `akeneo-event-bridge`, and the bridge forwards normalized rug product events to this n8n workflow.

While the workflow is open in test mode:

```sh
curl -X POST http://localhost:5678/webhook-test/akeneo-product-updated-to-mock-shopify \
  -H 'content-type: application/json' \
  --data @examples/products/akeneo-rug-updated-event.sample.json
```

The workflow calls `product-projection-service` at `POST /products/akeneo-events`. The projection service chooses the actual target from environment configuration:

- default: `mock-shopify`, writing to `.local/mock-shopify-dumps/`
- optional: `shopify-admin-target`, writing to a configured Shopify shop

n8n should not call Shopify Admin GraphQL directly. Keep that behavior in `shopify-admin-target`.

For the full local Akeneo event path, use:

```sh
npm run akeneo:demo-up
```

The review-required path is `PIM_PRODUCT_INCOMPLETE`. To test it, post the sample after changing `product.completeness.ratio` below `100`.

Product removal events can use [akeneo-rug-removed-event.sample.json](../examples/products/akeneo-rug-removed-event.sample.json). In mock mode this removes the local dump. In live Shopify mode this archives the product by default.
