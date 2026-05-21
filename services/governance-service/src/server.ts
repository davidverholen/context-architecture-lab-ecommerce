import Fastify from "fastify";
import { classifyChangeRequest } from "../../shared/governance.js";
import { changeRequestSchema } from "../../shared/schemas.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({
    status: "ok",
    service: "governance-service"
  }));

  app.post("/changes/classify", async (request, reply) => {
    const parsed = changeRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: "rejected",
        errors: parsed.error.issues
      });
    }

    return classifyChangeRequest(parsed.data);
  });

  return app;
}

export async function start() {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 8085);
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen({ port, host });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
