import {
  akeneoProductExportSchema,
  akeneoWebhookEnvelopeSchema,
  type AkeneoProductExport,
  type AkeneoWebhookEvent
} from "./schemas.js";

type AkeneoWebhookProductResource = NonNullable<AkeneoWebhookEvent["data"]>["resource"];

const REQUIRED_RUG_ATTRIBUTES = [
  "material",
  "size",
  "color",
  "shape",
  "pile_height_mm",
  "care_instruction",
  "suitable_rooms",
  "style",
  "origin_country"
] as const;

function eventTypeFromAction(action: string): AkeneoProductExport["event_type"] {
  if (action.includes("deleted") || action.includes("removed")) {
    return "product.removed";
  }

  if (action.includes("created")) {
    return "product.created";
  }

  if (action.includes("exported")) {
    return "product.exported";
  }

  return "product.updated";
}

function productResourceFromEvent(event: AkeneoWebhookEvent): AkeneoWebhookProductResource {
  return event.data?.resource ?? event.resource;
}

function valueEntries(value: unknown): Array<{ locale?: string | null; scope?: string | null; data: unknown }> {
  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is { locale?: string | null; scope?: string | null; data: unknown } => (
        Boolean(entry) && typeof entry === "object" && "data" in entry
      ));
  }

  if (value && typeof value === "object" && "data" in value) {
    return [value as { locale?: string | null; scope?: string | null; data: unknown }];
  }

  return [{ data: value }];
}

function pickValue(
  resource: NonNullable<AkeneoWebhookProductResource>,
  code: string,
  scope = "ecommerce",
  locale = "en_US"
): unknown {
  const values = resource.values ?? {};
  const entries = valueEntries(values[code]);
  const preferred = entries.find((entry) => {
    const scopeMatches = entry.scope === scope || entry.scope === null || entry.scope === undefined;
    const localeMatches = entry.locale === locale || entry.locale === null || entry.locale === undefined;
    return scopeMatches && localeMatches;
  });

  return (preferred ?? entries[0])?.data;
}

function stringValue(resource: NonNullable<AkeneoWebhookProductResource>, code: string): string {
  const value = pickValue(resource, code);

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function displayStringValue(resource: NonNullable<AkeneoWebhookProductResource>, code: string): string {
  return stringValue(resource, code).replace(/_/g, " ");
}

function numberValue(resource: NonNullable<AkeneoWebhookProductResource>, code: string): number {
  const value = pickValue(resource, code);

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function stringArrayValue(resource: NonNullable<AkeneoWebhookProductResource>, code: string): string[] {
  const value = pickValue(resource, code);

  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  if (typeof value === "string" && value.trim() !== "") {
    return [value];
  }

  return [];
}

function optionalStringValue(
  resource: NonNullable<AkeneoWebhookProductResource>,
  code: string
): string | undefined {
  const value = stringValue(resource, code);
  return value.trim() === "" ? undefined : value;
}

function optionalNumberValue(
  resource: NonNullable<AkeneoWebhookProductResource>,
  code: string
): number | undefined {
  const value = pickValue(resource, code);

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function hasRequiredValues(resource: NonNullable<AkeneoWebhookProductResource>): boolean {
  return REQUIRED_RUG_ATTRIBUTES.every((code) => {
    const value = pickValue(resource, code);

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== null && value !== undefined && value !== "";
  });
}

function isRugResource(resource: NonNullable<AkeneoWebhookProductResource>): boolean {
  return resource.family === "rug" || resource.identifier.toUpperCase().startsWith("RUG-");
}

export function normalizeAkeneoWebhookToExports(
  payload: unknown,
  now = new Date().toISOString()
): AkeneoProductExport[] {
  const localPayload = akeneoProductExportSchema.safeParse(payload);
  if (localPayload.success) {
    return [localPayload.data];
  }

  const envelope = akeneoWebhookEnvelopeSchema.parse(payload);
  const events: AkeneoWebhookEvent[] = (
    "events" in envelope && Array.isArray(envelope.events)
      ? envelope.events
      : [envelope as AkeneoWebhookEvent]
  );
  const exports = events
    .filter((event) => event.action.includes("product."))
    .flatMap((event) => {
      const resource = productResourceFromEvent(event);

      if (!resource) {
        throw new Error(`Akeneo event ${event.event_id ?? event.action} did not include a product resource.`);
      }

      if (!isRugResource(resource)) {
        return [];
      }

      const eventType = eventTypeFromAction(event.action);
      if (eventType === "product.removed") {
        const removalPayload = {
          export_id: event.event_id ?? `akeneo-event-${resource.identifier}-${now}`,
          source: "akeneo-ce",
          event_type: eventType,
          occurred_at: event.event_datetime ?? now,
          product: {
            identifier: resource.identifier,
            family: "rug",
            enabled: false
          }
        } satisfies AkeneoProductExport;

        return [akeneoProductExportSchema.parse(removalPayload)];
      }

      const productFamily = resource.family ?? "rug";
      const upsertEventType = eventType;
      const complete = resource.enabled !== false && productFamily === "rug" && hasRequiredValues(resource);
      const primaryImage = optionalStringValue(resource, "primary_image");
      const lifestyleImage = optionalStringValue(resource, "lifestyle_image");
      const exportPayload = {
        export_id: event.event_id ?? `akeneo-event-${resource.identifier}-${now}`,
        source: "akeneo-ce",
        event_type: upsertEventType,
        occurred_at: event.event_datetime ?? now,
        product: {
          identifier: resource.identifier,
          family: "rug",
          enabled: resource.enabled ?? true,
          completeness: {
            scope: "ecommerce",
            locale: "en_US",
            ratio: complete ? 100 : 0
          },
          values: {
            ...(optionalStringValue(resource, "merchandising_name")
              ? { merchandising_name: optionalStringValue(resource, "merchandising_name") }
              : {}),
            ...(optionalStringValue(resource, "description")
              ? { description: optionalStringValue(resource, "description") }
              : {}),
            ...(optionalNumberValue(resource, "price") !== undefined
              ? { price: optionalNumberValue(resource, "price") }
              : {}),
            material: displayStringValue(resource, "material"),
            size: displayStringValue(resource, "size"),
            color: displayStringValue(resource, "color"),
            shape: displayStringValue(resource, "shape"),
            pile_height_mm: numberValue(resource, "pile_height_mm"),
            care_instruction: stringValue(resource, "care_instruction"),
            suitable_rooms: stringArrayValue(resource, "suitable_rooms"),
            style: displayStringValue(resource, "style"),
            origin_country: stringValue(resource, "origin_country").toUpperCase(),
            ...(primaryImage
              ? {
                image_assets: {
                  primary: primaryImage,
                  ...(lifestyleImage ? { lifestyle: lifestyleImage } : {})
                }
              }
              : {})
          }
        }
      } satisfies AkeneoProductExport;

      return [akeneoProductExportSchema.parse(exportPayload)];
    });

  return exports;
}
