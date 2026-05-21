import Fastify from "fastify";
import { normalizeAkeneoWebhookToExports } from "../../shared/akeneo-event-bridge.js";
import type { AkeneoProductExport } from "../../shared/schemas.js";

type ForwardResult = {
  export_id: string;
  event_type: AkeneoProductExport["event_type"];
  n8n_status_code: number;
  n8n_body: unknown;
};

type BuildAppOptions = {
  n8nWebhookUrl?: string;
  now?: () => string;
  postEvent?: (url: string, event: AkeneoProductExport) => Promise<{ statusCode: number; body: unknown }>;
};

async function defaultPostEvent(url: string, event: AkeneoProductExport) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(event)
  });

  let body: unknown = null;
  const text = await response.text();
  if (text.trim() !== "") {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return {
    statusCode: response.status,
    body
  };
}

export function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: true });
  const n8nWebhookUrl = options.n8nWebhookUrl ?? process.env.N8N_PRODUCT_WEBHOOK_URL;
  const now = options.now ?? (() => new Date().toISOString());
  const postEvent = options.postEvent ?? defaultPostEvent;

  app.get("/health", async () => ({
    status: "ok",
    service: "akeneo-event-bridge"
  }));

  app.post("/akeneo/events", async (request, reply) => {
    let events: AkeneoProductExport[];

    try {
      events = normalizeAkeneoWebhookToExports(request.body, now());
    } catch (error) {
      return reply.code(422).send({
        status: "rejected",
        error: {
          code: "AKENEO_EVENT_INVALID",
          message: error instanceof Error ? error.message : "Akeneo event payload could not be normalized."
        }
      });
    }

    if (!n8nWebhookUrl) {
      return reply.code(503).send({
        status: "rejected",
        error: {
          code: "N8N_WEBHOOK_NOT_CONFIGURED",
          message: "N8N_PRODUCT_WEBHOOK_URL is required to forward Akeneo events."
        },
        normalized_events: events
      });
    }

    const forwarded: ForwardResult[] = [];

    for (const event of events) {
      const result = await postEvent(n8nWebhookUrl, event);
      forwarded.push({
        export_id: event.export_id,
        event_type: event.event_type,
        n8n_status_code: result.statusCode,
        n8n_body: result.body
      });

      if (result.statusCode === 404 || result.statusCode >= 500) {
        return reply.code(502).send({
          status: "rejected",
          error: {
            code: "N8N_WEBHOOK_REJECTED",
            message: `n8n rejected Akeneo event ${event.export_id} with HTTP ${result.statusCode}.`
          },
          forwarded
        });
      }
    }

    return reply.code(202).send({
      status: "accepted",
      received_events: events.length,
      forwarded
    });
  });

  return app;
}

export async function start() {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 8090);
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen({ port, host });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
