import Fastify from "fastify";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  shopifyProductProjectionSchema,
  shopifyProductRemovalSchema
} from "../../shared/schemas.js";

type BuildAppOptions = {
  dumpDir?: string;
};

function safeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: true });
  const dumpDir = options.dumpDir ?? process.env.PROJECTION_DUMP_DIR ?? ".local/mock-shopify-dumps";

  app.get("/health", async () => ({
    status: "ok",
    service: "mock-shopify"
  }));

  app.post("/products/projections", async (request, reply) => {
    const parsed = shopifyProductProjectionSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: "rejected",
        errors: parsed.error.issues
      });
    }

    await mkdir(dumpDir, { recursive: true });
    const fileName = `${safeFileName(parsed.data.projection_id)}.json`;
    const filePath = path.join(dumpDir, fileName);

    await writeFile(filePath, `${JSON.stringify(parsed.data, null, 2)}\n`, "utf8");

    return reply.code(200).send({
      status: "accepted",
      target: "mock-shopify",
      projection_id: parsed.data.projection_id,
      dump_path: filePath
    });
  });

  app.post("/products/removals", async (request, reply) => {
    const parsed = shopifyProductRemovalSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: "rejected",
        errors: parsed.error.issues
      });
    }

    const fileName = `${safeFileName(parsed.data.projection_id)}.json`;
    const filePath = path.join(dumpDir, fileName);
    let removed = false;

    try {
      await unlink(filePath);
      removed = true;
    } catch {
      removed = false;
    }

    return reply.code(200).send({
      status: "accepted",
      target: "mock-shopify",
      operation: "delete",
      projection_id: parsed.data.projection_id,
      target_reference: filePath,
      removed
    });
  });

  app.get("/products/projections/:projection_id", async (request, reply) => {
    const { projection_id } = request.params as { projection_id: string };
    const filePath = path.join(dumpDir, `${safeFileName(projection_id)}.json`);

    try {
      const content = await readFile(filePath, "utf8");
      return reply.code(200).send(JSON.parse(content));
    } catch {
      return reply.code(404).send({
        error: "PROJECTION_DUMP_NOT_FOUND",
        message: `No mock Shopify projection dump exists for ${projection_id}.`
      });
    }
  });

  return app;
}

export async function start() {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 8087);
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen({ port, host });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
