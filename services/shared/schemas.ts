import { z } from "zod";

const addressSchema = z.object({
  name: z.string(),
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  postal_code: z.string(),
  country_code: z.string().length(2)
});

const rugAttributesSchema = z.object({
  material: z.string(),
  size: z.string(),
  color: z.string(),
  shape: z.string()
});

export const shopifyOrderCreatedSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string(),
  currency: z.string().length(3),
  customer: z.object({
    id: z.string(),
    email: z.string()
  }),
  shipping_address: addressSchema,
  line_items: z.array(z.object({
    id: z.string(),
    sku: z.string(),
    title: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(),
    product_family: z.literal("rug"),
    attributes: rugAttributesSchema
  })).min(1),
  total_price: z.number().nonnegative()
});

export const canonicalOrderSchema = z.object({
  order_id: z.string(),
  source: z.literal("shopify"),
  source_order_id: z.string(),
  created_at: z.string(),
  currency: z.string().length(3),
  customer: z.object({
    customer_id: z.string(),
    email: z.string()
  }),
  shipping_address: addressSchema,
  line_items: z.array(z.object({
    line_item_id: z.string(),
    sku: z.string(),
    title: z.string(),
    quantity: z.number().int().positive(),
    unit_price: z.number().nonnegative(),
    product_family: z.literal("rug"),
    attributes: rugAttributesSchema
  })).min(1),
  totals: z.object({
    subtotal: z.number().nonnegative(),
    shipping: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    grand_total: z.number().nonnegative()
  }),
  idempotency_key: z.string()
});

export const mockWmsOrderSchema = z.object({
  wms_order_id: z.string(),
  source_order_id: z.string(),
  ship_to: addressSchema,
  items: z.array(z.object({
    sku: z.string(),
    wms_sku: z.string().nullable(),
    quantity: z.number().int().positive(),
    description: z.string()
  })).min(1),
  integration_status: z.object({
    state: z.enum(["accepted", "rejected", "pending"]),
    errors: z.array(z.object({
      code: z.enum(["SKU_MAPPING_MISSING", "VALIDATION_FAILED", "WMS_UNAVAILABLE"]),
      message: z.string()
    }))
  })
});

export const changeRequestSchema = z.object({
  change_request_id: z.string(),
  title: z.string(),
  change_type: z.enum([
    "product_projection",
    "order_integration",
    "fulfillment",
    "customer_data",
    "cloud_run",
    "governance",
    "docs_only"
  ]),
  affected_domains: z.array(z.string()).min(1),
  risk_level: z.enum(["low", "medium", "high"]),
  summary: z.string(),
  proposed_by: z.string(),
  requires_review: z.boolean(),
  context_pack: z.array(z.string()).min(1),
  created_at: z.string()
});

export const pimProductSchema = z.object({
  pim_product_id: z.string(),
  family: z.literal("rug"),
  sku: z.string(),
  status: z.enum(["draft", "enriched", "approved"]),
  attributes: z.object({
    merchandising_name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().nonnegative().optional(),
    material: z.string(),
    size: z.string(),
    color: z.string(),
    shape: z.string(),
    pile_height_mm: z.number().nonnegative(),
    care_instruction: z.string(),
    suitable_rooms: z.array(z.string()).min(1),
    style: z.string(),
    origin_country: z.string().length(2),
    image_assets: z.object({
      primary: z.string(),
      lifestyle: z.string().optional()
    }).optional()
  })
});

const akeneoProductValuesSchema = z.object({
  merchandising_name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  material: z.string(),
  size: z.string(),
  color: z.string(),
  shape: z.string(),
  pile_height_mm: z.number().nonnegative(),
  care_instruction: z.string(),
  suitable_rooms: z.array(z.string()).min(1),
  style: z.string(),
  origin_country: z.string().length(2),
  image_assets: z.object({
    primary: z.string(),
    lifestyle: z.string().optional()
  }).optional()
});

const akeneoProductIdentitySchema = z.object({
  identifier: z.string().min(1),
  family: z.literal("rug")
});

const akeneoProductUpsertExportSchema = z.object({
  export_id: z.string().min(1),
  source: z.literal("akeneo-ce"),
  event_type: z.enum(["product.created", "product.updated", "product.exported"]),
  occurred_at: z.string(),
  product: akeneoProductIdentitySchema.extend({
    enabled: z.boolean(),
    completeness: z.object({
      scope: z.string(),
      locale: z.string(),
      ratio: z.number().int().min(0).max(100)
    }),
    values: akeneoProductValuesSchema
  })
});

const akeneoProductRemovedExportSchema = z.object({
  export_id: z.string().min(1),
  source: z.literal("akeneo-ce"),
  event_type: z.literal("product.removed"),
  occurred_at: z.string(),
  product: akeneoProductIdentitySchema.extend({
    enabled: z.literal(false).optional()
  })
});

export const akeneoProductExportSchema = z.union([
  akeneoProductUpsertExportSchema,
  akeneoProductRemovedExportSchema
]);

const akeneoWebhookValueSchema = z.object({
  locale: z.string().nullable().optional(),
  scope: z.string().nullable().optional(),
  data: z.unknown()
}).passthrough();

const akeneoWebhookProductResourceSchema = z.object({
  identifier: z.string().min(1),
  family: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  values: z.record(z.union([
    z.array(akeneoWebhookValueSchema),
    akeneoWebhookValueSchema,
    z.unknown()
  ])).optional()
}).passthrough();

export const akeneoWebhookEventSchema = z.object({
  event_id: z.string().optional(),
  action: z.string(),
  event_datetime: z.string().optional(),
  data: z.object({
    resource: akeneoWebhookProductResourceSchema.optional()
  }).passthrough().optional(),
  resource: akeneoWebhookProductResourceSchema.optional()
}).passthrough();

export const akeneoWebhookEnvelopeSchema = z.union([
  z.object({
    events: z.array(akeneoWebhookEventSchema).min(1)
  }).passthrough(),
  akeneoWebhookEventSchema
]);

export const productProjectionJobSchema = z.object({
  job_id: z.string().min(1),
  source_export_id: z.string().min(1),
  idempotency_key: z.string().min(1),
  requested_at: z.string(),
  source: z.literal("akeneo-ce"),
  target: z.enum(["mock-shopify", "shopify-dev-store"]),
  pim_product: pimProductSchema
});

const shopifyProjectionSchema = z.object({
  projection_id: z.string(),
  pim_product_id: z.string(),
  shopify_status: z.enum(["draft", "active", "archived"]),
  title: z.string(),
  handle: z.string(),
  vendor: z.string(),
  product_type: z.literal("Rug"),
  description: z.string(),
  variants: z.array(z.object({
    sku: z.string(),
    price: z.number().nonnegative(),
    option_values: z.object({
      size: z.string(),
      color: z.string()
    })
  })).min(1),
  media: z.array(z.object({
    role: z.enum(["primary", "lifestyle"]),
    filename: z.string(),
    alt: z.string().optional()
  })).optional(),
  metafields: z.array(z.object({
    namespace: z.string(),
    key: z.string(),
    type: z.string(),
    value: z.union([
      z.string(),
      z.number(),
      z.array(z.string())
    ])
  })),
  metaobjects: z.array(z.object({
    type: z.string(),
    handle: z.string(),
    fields: z.record(z.unknown())
  }))
});

export const shopifyProductProjectionSchema = shopifyProjectionSchema;

export const shopifyProductRemovalSchema = z.object({
  removal_id: z.string().min(1),
  source_export_id: z.string().min(1),
  idempotency_key: z.string().min(1),
  requested_at: z.string(),
  source: z.literal("akeneo-ce"),
  target: z.enum(["mock-shopify", "shopify-dev-store"]),
  pim_product_id: z.string(),
  sku: z.string(),
  projection_id: z.string(),
  reason: z.literal("akeneo_product_removed")
});

export const productProjectionResultSchema = z.object({
  result_id: z.string().min(1),
  job_id: z.string().min(1),
  status: z.enum(["accepted", "rejected", "review_required"]),
  operation: z.enum(["upsert", "archive", "delete", "noop"]).optional(),
  target: z.enum(["mock-shopify", "shopify-dev-store"]),
  projected_at: z.string(),
  projection: shopifyProjectionSchema.nullable(),
  errors: z.array(z.object({
    code: z.enum([
      "AKENEO_EXPORT_INVALID",
      "PIM_PRODUCT_INCOMPLETE",
      "PROJECTION_MAPPING_MISSING",
      "SHOPIFY_DOCS_VERIFICATION_REQUIRED",
      "TARGET_UNAVAILABLE"
    ]),
    message: z.string()
  })),
  dump_path: z.string().optional(),
  target_reference: z.string().optional()
});

export type ShopifyOrderCreated = z.infer<typeof shopifyOrderCreatedSchema>;
export type CanonicalOrder = z.infer<typeof canonicalOrderSchema>;
export type MockWmsOrder = z.infer<typeof mockWmsOrderSchema>;
export type ChangeRequest = z.infer<typeof changeRequestSchema>;
export type PimProduct = z.infer<typeof pimProductSchema>;
export type AkeneoProductExport = z.infer<typeof akeneoProductExportSchema>;
export type AkeneoWebhookEvent = z.infer<typeof akeneoWebhookEventSchema>;
export type AkeneoWebhookEnvelope = z.infer<typeof akeneoWebhookEnvelopeSchema>;
export type ProductProjectionJob = z.infer<typeof productProjectionJobSchema>;
export type ProjectionTarget = ProductProjectionJob["target"];
export type ShopifyProductProjection = z.infer<typeof shopifyProductProjectionSchema>;
export type ShopifyProductRemoval = z.infer<typeof shopifyProductRemovalSchema>;
export type ProductProjectionResult = z.infer<typeof productProjectionResultSchema>;
