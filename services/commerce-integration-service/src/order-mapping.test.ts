import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  transformCanonicalToMockWmsOrder,
  transformShopifyOrderToCanonical
} from "../../shared/order-mapping.js";
import { shopifyOrderCreatedSchema } from "../../shared/schemas.js";

function readFixture(relativePath: string) {
  const fullPath = path.join(process.cwd(), relativePath);
  return JSON.parse(readFileSync(fullPath, "utf8"));
}

describe("order transformation", () => {
  it("maps a Shopify order-created event to canonical and mock WMS orders", () => {
    const shopifyOrder = shopifyOrderCreatedSchema.parse(
      readFixture("examples/orders/shopify-order-created.sample.json")
    );

    const canonicalOrder = transformShopifyOrderToCanonical(shopifyOrder);
    const mockWmsOrder = transformCanonicalToMockWmsOrder(canonicalOrder);

    expect(canonicalOrder.order_id).toBe("canonical-order-1001");
    expect(canonicalOrder.source).toBe("shopify");
    expect(canonicalOrder.line_items[0]?.sku).toBe("RUG-ATLAS-170X240-SAND");
    expect(canonicalOrder.totals.subtotal).toBe(349);
    expect(mockWmsOrder.integration_status.state).toBe("accepted");
    expect(mockWmsOrder.items[0]?.wms_sku).toBe("WMS-RUG-ATLAS-170X240-SAND");
  });

  it("marks UNKNOWN-SKU as SKU_MAPPING_MISSING", () => {
    const shopifyOrder = shopifyOrderCreatedSchema.parse({
      ...readFixture("examples/orders/shopify-order-created.sample.json"),
      line_items: [
        {
          ...readFixture("examples/orders/shopify-order-created.sample.json").line_items[0],
          sku: "UNKNOWN-SKU"
        }
      ]
    });

    const canonicalOrder = transformShopifyOrderToCanonical(shopifyOrder);
    const mockWmsOrder = transformCanonicalToMockWmsOrder(canonicalOrder);

    expect(mockWmsOrder.integration_status.state).toBe("rejected");
    expect(mockWmsOrder.items[0]?.wms_sku).toBeNull();
    expect(mockWmsOrder.integration_status.errors[0]?.code).toBe("SKU_MAPPING_MISSING");
  });
});
