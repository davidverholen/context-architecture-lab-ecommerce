import type { MockWmsOrder } from "./schemas.js";

export function acceptMockWmsOrder(order: MockWmsOrder) {
  const unknownSku = order.items.find((item) => item.sku === "UNKNOWN-SKU");

  if (unknownSku) {
    return {
      accepted: false,
      status: "rejected",
      wms_order_id: order.wms_order_id,
      errors: [
        {
          code: "SKU_MAPPING_MISSING",
          message: `No WMS SKU mapping exists for ${unknownSku.sku}.`
        }
      ]
    };
  }

  return {
    accepted: true,
    status: "accepted",
    wms_order_id: order.wms_order_id,
    errors: []
  };
}
