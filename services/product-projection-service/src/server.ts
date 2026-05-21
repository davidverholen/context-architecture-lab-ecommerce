import Fastify, { type FastifyReply } from "fastify";
import {
  akeneoProductExportSchema,
  productProjectionJobSchema,
  productProjectionResultSchema,
  shopifyProductRemovalSchema,
  type ProductProjectionJob,
  type ProjectionTarget,
  type ShopifyProductProjection,
  type ShopifyProductRemoval
} from "../../shared/schemas.js";
import {
  buildProjectionResult,
  buildRemovalResult,
  buildRemovalTargetUnavailableResult,
  buildTargetUnavailableResult,
  isProductRemovalExport,
  transformAkeneoExportToProjectionJob,
  transformAkeneoRemovalToShopifyRemoval
} from "../../shared/product-projection.js";

type BuildAppOptions = {
  productTargetUrl?: string;
  productTarget?: ProjectionTarget;
  now?: () => string;
};

type TargetBody = {
  dump_path?: unknown;
  operation?: unknown;
  shopify_product_id?: unknown;
  target_reference?: unknown;
};

async function sendToTarget(
  productTargetUrl: string,
  path: "/products/projections" | "/products/removals",
  payload: ShopifyProductProjection | ShopifyProductRemoval
) {
  const response = await fetch(`${productTargetUrl.replace(/\/$/, "")}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  const body = text.trim() === "" ? null : JSON.parse(text);

  return {
    status_code: response.status,
    body
  };
}

function targetBody(value: unknown): TargetBody {
  return typeof value === "object" && value !== null ? value as TargetBody : {};
}

function targetReference(body: TargetBody): string | undefined {
  if (typeof body.shopify_product_id === "string") {
    return body.shopify_product_id;
  }

  if (typeof body.target_reference === "string") {
    return body.target_reference;
  }

  return undefined;
}

export function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: true });
  const productTargetUrl = options.productTargetUrl
    ?? process.env.PRODUCT_TARGET_URL
    ?? process.env.MOCK_SHOPIFY_URL;
  const productTarget = options.productTarget
    ?? (process.env.PRODUCT_PROJECTION_TARGET as ProjectionTarget | undefined)
    ?? "mock-shopify";
  const now = options.now ?? (() => new Date().toISOString());

  app.get("/health", async () => ({
    status: "ok",
    service: "product-projection-service",
    target: productTarget,
    target_configured: Boolean(productTargetUrl)
  }));

  app.post("/products/akeneo-events", async (request, reply) => {
    const parsed = akeneoProductExportSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: "rejected",
        errors: [
          {
            code: "AKENEO_EXPORT_INVALID",
            message: "Akeneo product event/export payload did not match the local contract."
          }
        ],
        validation_errors: parsed.error.issues
      });
    }

    if (isProductRemovalExport(parsed.data)) {
      const removal = shopifyProductRemovalSchema.parse(
        transformAkeneoRemovalToShopifyRemoval(parsed.data, now(), productTarget)
      );

      return handleRemoval(removal, reply, productTargetUrl, now);
    }

    const job = productProjectionJobSchema.parse(
      transformAkeneoExportToProjectionJob(parsed.data, now(), productTarget)
    );

    return handleProjectionJob(job, reply, productTargetUrl, now);
  });

  app.post("/products/projection-jobs", async (request, reply) => {
    const parsed = productProjectionJobSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: "rejected",
        errors: [
          {
            code: "AKENEO_EXPORT_INVALID",
            message: "Product projection job did not match the local contract."
          }
        ],
        validation_errors: parsed.error.issues
      });
    }

    return handleProjectionJob(parsed.data, reply, productTargetUrl, now);
  });

  return app;
}

async function handleProjectionJob(
  job: ProductProjectionJob,
  reply: FastifyReply,
  productTargetUrl: string | undefined,
  now: () => string
) {
  const pendingResult = productProjectionResultSchema.parse(
    buildProjectionResult(job, now())
  );

  if (pendingResult.status !== "accepted" || pendingResult.projection === null) {
    return reply.code(422).send(pendingResult);
  }

  if (!productTargetUrl) {
    return reply.code(200).send(pendingResult);
  }

  try {
    const targetResponse = await sendToTarget(
      productTargetUrl,
      "/products/projections",
      pendingResult.projection
    );

    if (targetResponse.status_code >= 400) {
      const rejected = productProjectionResultSchema.parse(
        buildTargetUnavailableResult(
          job,
          now(),
          `Product projection target rejected projection with HTTP ${targetResponse.status_code}.`
        )
      );

      return reply.code(502).send(rejected);
    }

    const body = targetBody(targetResponse.body);
    const accepted = productProjectionResultSchema.parse({
      ...buildProjectionResult(
        job,
        now(),
        typeof body.dump_path === "string" ? body.dump_path : undefined
      ),
      target_reference: targetReference(body)
    });

    return reply.code(200).send(accepted);
  } catch (error) {
    const rejected = productProjectionResultSchema.parse(
      buildTargetUnavailableResult(
        job,
        now(),
        error instanceof Error ? error.message : "Product projection target unavailable."
      )
    );

    return reply.code(502).send(rejected);
  }
}

async function handleRemoval(
  removal: ShopifyProductRemoval,
  reply: FastifyReply,
  productTargetUrl: string | undefined,
  now: () => string
) {
  if (!productTargetUrl) {
    const accepted = productProjectionResultSchema.parse(
      buildRemovalResult(removal, now(), "noop")
    );
    return reply.code(200).send(accepted);
  }

  try {
    const targetResponse = await sendToTarget(
      productTargetUrl,
      "/products/removals",
      removal
    );

    if (targetResponse.status_code >= 400) {
      const rejected = productProjectionResultSchema.parse(
        buildRemovalTargetUnavailableResult(
          removal,
          now(),
          `Product projection target rejected removal with HTTP ${targetResponse.status_code}.`
        )
      );

      return reply.code(502).send(rejected);
    }

    const body = targetBody(targetResponse.body);
    const operation = body.operation === "delete" || body.operation === "archive" || body.operation === "noop"
      ? body.operation
      : "archive";
    const accepted = productProjectionResultSchema.parse(
      buildRemovalResult(removal, now(), operation, targetReference(body))
    );

    return reply.code(200).send(accepted);
  } catch (error) {
    const rejected = productProjectionResultSchema.parse(
      buildRemovalTargetUnavailableResult(
        removal,
        now(),
        error instanceof Error ? error.message : "Product projection target unavailable."
      )
    );

    return reply.code(502).send(rejected);
  }
}

export async function start() {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 8086);
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen({ port, host });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
