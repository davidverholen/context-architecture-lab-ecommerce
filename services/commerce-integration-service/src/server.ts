import Fastify from "fastify";
import {
  canonicalOrderSchema,
  mockWmsOrderSchema,
  shopifyOrderCreatedSchema
} from "../../shared/schemas.js";
import {
  transformCanonicalToMockWmsOrder,
  transformShopifyOrderToCanonical
} from "../../shared/order-mapping.js";

type BuildAppOptions = {
  mockWmsUrl?: string;
};

async function sendToMockWms(mockWmsUrl: string, order: unknown) {
  const response = await fetch(`${mockWmsUrl.replace(/\/$/, "")}/orders`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(order)
  });
  const body = await response.json();

  return {
    status_code: response.status,
    body
  };
}

export function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: true });
  const mockWmsUrl = options.mockWmsUrl ?? process.env.MOCK_WMS_URL;

  app.get("/health", async () => ({
    status: "ok",
    service: "commerce-integration-service"
  }));

  app.post("/orders/shopify-created", async (request, reply) => {
    const parsed = shopifyOrderCreatedSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: "rejected",
        errors: parsed.error.issues
      });
    }

    const canonicalOrder = canonicalOrderSchema.parse(
      transformShopifyOrderToCanonical(parsed.data)
    );
    const mockWmsOrder = mockWmsOrderSchema.parse(
      transformCanonicalToMockWmsOrder(canonicalOrder)
    );
    const wmsResponse = mockWmsUrl
      ? await sendToMockWms(mockWmsUrl, mockWmsOrder)
      : null;
    const rejected =
      mockWmsOrder.integration_status.state === "rejected" ||
      (wmsResponse !== null && wmsResponse.status_code >= 400);

    return reply.code(rejected ? 422 : 200).send({
      status: rejected ? "rejected" : "accepted",
      canonical_order: canonicalOrder,
      mock_wms_order: mockWmsOrder,
      wms_response: wmsResponse
    });
  });

  return app;
}

export async function start() {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 8082);
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen({ port, host });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
