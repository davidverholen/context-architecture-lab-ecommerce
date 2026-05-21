import Fastify from "fastify";
import { mockWmsOrderSchema } from "../../shared/schemas.js";
import { acceptMockWmsOrder } from "../../shared/wms.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({
    status: "ok",
    service: "mock-wms"
  }));

  app.post("/orders", async (request, reply) => {
    const parsed = mockWmsOrderSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: "rejected",
        errors: parsed.error.issues
      });
    }

    const result = acceptMockWmsOrder(parsed.data);
    return reply.code(result.accepted ? 200 : 422).send(result);
  });

  return app;
}

export async function start() {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 8083);
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen({ port, host });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
