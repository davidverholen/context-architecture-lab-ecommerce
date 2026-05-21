import Fastify from "fastify";
import { sampleRugProduct } from "../../shared/pim-fixtures.js";
import { pimProductSchema } from "../../shared/schemas.js";

export function buildApp() {
  const app = Fastify({ logger: true });
  const product = pimProductSchema.parse(sampleRugProduct);

  app.get("/health", async () => ({
    status: "ok",
    service: "mock-pim"
  }));

  app.get("/products", async () => ({
    products: [product]
  }));

  app.get("/products/:sku", async (request, reply) => {
    const { sku } = request.params as { sku: string };

    if (sku !== product.sku) {
      return reply.code(404).send({
        error: "PRODUCT_NOT_FOUND",
        message: `No mock PIM product exists for ${sku}.`
      });
    }

    return { product };
  });

  return app;
}

export async function start() {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 8084);
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen({ port, host });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
