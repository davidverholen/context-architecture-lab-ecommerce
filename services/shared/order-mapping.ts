import type { CanonicalOrder, MockWmsOrder, ShopifyOrderCreated } from "./schemas.js";

function money(value: number): number {
  return Math.round(value * 100) / 100;
}

function orderSuffix(order: ShopifyOrderCreated): string {
  const fromName = order.name.replace(/^#/, "").trim();
  return fromName || order.id.split("/").at(-1) || "unknown";
}

export function transformShopifyOrderToCanonical(order: ShopifyOrderCreated): CanonicalOrder {
  const subtotal = money(
    order.line_items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const grandTotal = money(order.total_price);
  const remainder = money(Math.max(grandTotal - subtotal, 0));

  return {
    order_id: `canonical-order-${orderSuffix(order)}`,
    source: "shopify",
    source_order_id: order.id,
    created_at: order.created_at,
    currency: order.currency,
    customer: {
      customer_id: order.customer.id,
      email: order.customer.email
    },
    shipping_address: order.shipping_address,
    line_items: order.line_items.map((item) => ({
      line_item_id: item.id,
      sku: item.sku,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.price,
      product_family: item.product_family,
      attributes: item.attributes
    })),
    totals: {
      subtotal,
      shipping: 0,
      tax: remainder,
      grand_total: grandTotal
    },
    idempotency_key: `shopify-order-${order.id}`
  };
}

export function transformCanonicalToMockWmsOrder(order: CanonicalOrder): MockWmsOrder {
  const missingSkuItems = order.line_items.filter((item) => item.sku === "UNKNOWN-SKU");

  return {
    wms_order_id: `wms-${order.order_id}`,
    source_order_id: order.source_order_id,
    ship_to: order.shipping_address,
    items: order.line_items.map((item) => ({
      sku: item.sku,
      wms_sku: item.sku === "UNKNOWN-SKU" ? null : `WMS-${item.sku}`,
      quantity: item.quantity,
      description: item.title
    })),
    integration_status: missingSkuItems.length > 0
      ? {
          state: "rejected",
          errors: missingSkuItems.map((item) => ({
            code: "SKU_MAPPING_MISSING",
            message: `No WMS SKU mapping exists for ${item.sku}.`
          }))
        }
      : {
          state: "accepted",
          errors: []
        }
  };
}
