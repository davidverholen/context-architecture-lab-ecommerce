import { describe, expect, it } from "vitest";
import { akeneoProductExportSchema } from "../../shared/schemas.js";
import {
  buildRemovalResult,
  buildProjectionResult,
  transformAkeneoExportToProjectionJob,
  transformAkeneoRemovalToShopifyRemoval
} from "../../shared/product-projection.js";
import sampleExport from "../../../examples/products/akeneo-rug-export.sample.json" with { type: "json" };

describe("product projection mapping", () => {
  it("maps an Akeneo rug update to a Shopify projection", () => {
    const productExport = akeneoProductExportSchema.parse({
      ...sampleExport,
      event_type: "product.updated"
    });
    const job = transformAkeneoExportToProjectionJob(
      productExport,
      "2026-05-18T12:31:00Z"
    );
    const result = buildProjectionResult(job, "2026-05-18T12:32:00Z");

    expect(job.pim_product.status).toBe("approved");
    expect(result.status).toBe("accepted");
    expect(result.projection?.title).toBe("Atlas Wool Rug");
    expect(result.projection?.handle).toBe("atlas-wool-rug-sand");
    expect(result.projection?.shopify_status).toBe("active");
    expect(result.projection?.variants[0]?.sku).toBe("RUG-ATLAS-170X240-SAND");
    expect(result.projection?.variants[0]?.price).toBe(349);
    expect(result.projection?.media?.[0]?.filename).toBe("atlas-wool-rug-primary.jpg");
    expect(result.projection?.metafields).toContainEqual(expect.objectContaining({
      namespace: "details",
      key: "style",
      value: "modern organic"
    }));
  });

  it("requires review when the PIM product is incomplete", () => {
    const productExport = akeneoProductExportSchema.parse({
      ...sampleExport,
      product: {
        ...sampleExport.product,
        completeness: {
          ...sampleExport.product.completeness,
          ratio: 80
        }
      }
    });
    const job = transformAkeneoExportToProjectionJob(
      productExport,
      "2026-05-18T12:31:00Z"
    );
    const result = buildProjectionResult(job, "2026-05-18T12:32:00Z");

    expect(job.pim_product.status).toBe("enriched");
    expect(result.status).toBe("review_required");
    expect(result.projection).toBeNull();
    expect(result.errors[0]?.code).toBe("PIM_PRODUCT_INCOMPLETE");
  });

  it("maps an Akeneo rug removal to a Shopify removal command", () => {
    const productExport = akeneoProductExportSchema.parse({
      export_id: "akeneo-event-rug-atlas-sand-removed",
      source: "akeneo-ce",
      event_type: "product.removed",
      occurred_at: "2026-05-21T08:00:00Z",
      product: {
        identifier: "RUG-ATLAS-170X240-SAND",
        family: "rug",
        enabled: false
      }
    });
    const removal = transformAkeneoRemovalToShopifyRemoval(
      productExport,
      "2026-05-21T08:00:30Z",
      "shopify-dev-store"
    );
    const result = buildRemovalResult(removal, "2026-05-21T08:00:31Z", "archive");

    expect(removal).toMatchObject({
      target: "shopify-dev-store",
      pim_product_id: "pim-rug-atlas-sand",
      projection_id: "shopify-projection-rug-atlas-sand"
    });
    expect(result).toMatchObject({
      status: "accepted",
      operation: "archive",
      projection: null
    });
  });
});
