import { describe, expect, it } from "vitest";
import { normalizeAkeneoWebhookToExports } from "../../shared/akeneo-event-bridge.js";
import { buildApp } from "./server.js";

const akeneoWebhookPayload = {
  events: [
    {
      event_id: "akeneo-webhook-rug-atlas-sand-001",
      action: "product.updated",
      event_datetime: "2026-05-19T10:00:00Z",
      data: {
        resource: {
          identifier: "RUG-ATLAS-170X240-SAND",
          family: "rug",
          enabled: true,
          values: {
            material: [{ locale: null, scope: null, data: "wool" }],
            size: [{ locale: null, scope: null, data: "170x240 cm" }],
            color: [{ locale: null, scope: null, data: "sand" }],
            shape: [{ locale: null, scope: null, data: "rectangle" }],
            pile_height_mm: [{ locale: null, scope: null, data: "12" }],
            care_instruction: [{ locale: "en_US", scope: null, data: "Vacuum regularly and spot clean with mild detergent." }],
            suitable_rooms: [{ locale: null, scope: null, data: ["living_room", "bedroom"] }],
            style: [{ locale: null, scope: null, data: "modern organic" }],
            origin_country: [{ locale: null, scope: null, data: "IN" }]
          }
        }
      }
    }
  ]
};

const akeneoWebhookRemovalPayload = {
  events: [
    {
      event_id: "akeneo-webhook-rug-atlas-sand-removed",
      action: "product.removed",
      event_datetime: "2026-05-21T08:00:00Z",
      data: {
        resource: {
          identifier: "RUG-ATLAS-170X240-SAND",
          family: "rug"
        }
      }
    }
  ]
};

describe("Akeneo event bridge", () => {
  it("normalizes Akeneo webhook events to the local product export contract", () => {
    const [event] = normalizeAkeneoWebhookToExports(akeneoWebhookPayload);

    expect(event).toMatchObject({
      export_id: "akeneo-webhook-rug-atlas-sand-001",
      source: "akeneo-ce",
      event_type: "product.updated",
      product: {
        identifier: "RUG-ATLAS-170X240-SAND",
        family: "rug",
        completeness: {
          scope: "ecommerce",
          locale: "en_US",
          ratio: 100
        },
        values: {
          material: "wool",
          pile_height_mm: 12,
          suitable_rooms: ["living_room", "bedroom"],
          origin_country: "IN"
        }
      }
    });
  });

  it("forwards normalized events to the configured n8n webhook", async () => {
    const forwarded: unknown[] = [];
    const app = buildApp({
      n8nWebhookUrl: "http://n8n:5678/webhook/akeneo-product-updated-to-mock-shopify",
      postEvent: async (_url, event) => {
        forwarded.push(event);
        return {
          statusCode: 200,
          body: {
            status: "accepted"
          }
        };
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/akeneo/events",
      payload: akeneoWebhookPayload
    });

    expect(response.statusCode).toBe(202);
    expect(forwarded).toHaveLength(1);
    expect(JSON.parse(response.body)).toMatchObject({
      status: "accepted",
      received_events: 1
    });
  });

  it("normalizes Akeneo product removal events to the local removal contract", () => {
    const [event] = normalizeAkeneoWebhookToExports(akeneoWebhookRemovalPayload);

    expect(event).toMatchObject({
      export_id: "akeneo-webhook-rug-atlas-sand-removed",
      source: "akeneo-ce",
      event_type: "product.removed",
      product: {
        identifier: "RUG-ATLAS-170X240-SAND",
        family: "rug",
        enabled: false
      }
    });
  });
});
