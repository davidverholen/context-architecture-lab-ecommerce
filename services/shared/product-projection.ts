import type {
  AkeneoProductExport,
  PimProduct,
  ProductProjectionJob,
  ProductProjectionResult,
  ShopifyProductRemoval,
  ShopifyProductProjection
} from "./schemas.js";

export type ProjectionTarget = "mock-shopify" | "shopify-dev-store";

const DEFAULT_TARGET: ProjectionTarget = "mock-shopify";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function rugIdentityFromSku(sku: string): { productId: string; collectionName: string; color: string } {
  const parts = sku.split("-").filter(Boolean);
  const family = parts[0]?.toLowerCase() || "rug";
  const collection = parts[1] || "rug";
  const color = parts.at(-1) || "natural";

  return {
    productId: `pim-${family}-${slugify(collection)}-${slugify(color)}`,
    collectionName: titleCase(collection),
    color: color.toLowerCase()
  };
}

function projectionIdFromPimProductId(pimProductId: string): string {
  return `shopify-projection-${slugify(pimProductId.replace(/^pim-/, ""))}`;
}

export function isProductRemovalExport(
  productExport: AkeneoProductExport
): productExport is Extract<AkeneoProductExport, { event_type: "product.removed" }> {
  return productExport.event_type === "product.removed";
}

function assertProductUpsertExport(
  productExport: AkeneoProductExport
): asserts productExport is Exclude<AkeneoProductExport, { event_type: "product.removed" }> {
  if (isProductRemovalExport(productExport)) {
    throw new Error("Product removal events do not contain enough data to build a Shopify projection.");
  }
}

function statusForExport(product: AkeneoProductExport["product"]): PimProduct["status"] {
  if (!("completeness" in product)) {
    return "draft";
  }

  if (!product.enabled) {
    return "draft";
  }

  return product.completeness.ratio >= 100 ? "approved" : "enriched";
}

export function transformAkeneoExportToProjectionJob(
  productExport: AkeneoProductExport,
  requestedAt: string,
  target: ProjectionTarget = DEFAULT_TARGET
): ProductProjectionJob {
  assertProductUpsertExport(productExport);
  const identity = rugIdentityFromSku(productExport.product.identifier);

  return {
    job_id: `projection-job-${slugify(productExport.export_id)}`,
    source_export_id: productExport.export_id,
    idempotency_key: `${productExport.export_id}:${productExport.product.identifier}:${target}`,
    requested_at: requestedAt,
    source: productExport.source,
    target,
    pim_product: {
      pim_product_id: identity.productId,
      family: productExport.product.family,
      sku: productExport.product.identifier,
      status: statusForExport(productExport.product),
      attributes: productExport.product.values
    }
  };
}

export function transformAkeneoRemovalToShopifyRemoval(
  productExport: AkeneoProductExport,
  requestedAt: string,
  target: ProjectionTarget = DEFAULT_TARGET
): ShopifyProductRemoval {
  if (!isProductRemovalExport(productExport)) {
    throw new Error("Only Akeneo product removal events can become Shopify removal commands.");
  }

  const identity = rugIdentityFromSku(productExport.product.identifier);
  const projectionId = projectionIdFromPimProductId(identity.productId);

  return {
    removal_id: `projection-removal-${slugify(productExport.export_id)}`,
    source_export_id: productExport.export_id,
    idempotency_key: `${productExport.export_id}:${productExport.product.identifier}:${target}:remove`,
    requested_at: requestedAt,
    source: productExport.source,
    target,
    pim_product_id: identity.productId,
    sku: productExport.product.identifier,
    projection_id: projectionId,
    reason: "akeneo_product_removed"
  };
}

export function transformProjectionJobToShopifyProjection(
  job: ProductProjectionJob
): ShopifyProductProjection {
  const { pim_product: product } = job;
  const { attributes } = product;
  const identity = rugIdentityFromSku(product.sku);
  const material = attributes.material.toLowerCase();
  const color = attributes.color.toLowerCase();
  const title = attributes.merchandising_name ?? `${identity.collectionName} ${titleCase(material)} Rug`;
  const handle = slugify(`${title} ${color}`);
  const careHandle = slugify(attributes.care_instruction.slice(0, 42)) || "care-profile";
  const media = attributes.image_assets
    ? [
      {
        role: "primary" as const,
        filename: attributes.image_assets.primary,
        alt: `${title} in ${titleCase(color)}`
      },
      ...(attributes.image_assets.lifestyle
        ? [
          {
            role: "lifestyle" as const,
            filename: attributes.image_assets.lifestyle,
            alt: `${title} styled in a room`
          }
        ]
        : [])
    ]
    : undefined;

  return {
    projection_id: projectionIdFromPimProductId(product.pim_product_id),
    pim_product_id: product.pim_product_id,
    shopify_status: product.status === "approved" ? "active" : "draft",
    title,
    handle,
    vendor: "Context Home",
    product_type: "Rug",
    description: attributes.description ?? `A ${material} rug projected from governed PIM product data.`,
    variants: [
      {
        sku: product.sku,
        price: attributes.price ?? 349,
        option_values: {
          size: attributes.size,
          color: attributes.color
        }
      }
    ],
    ...(media ? { media } : {}),
    metafields: [
      {
        namespace: "details",
        key: "material",
        type: "single_line_text_field",
        value: attributes.material
      },
      {
        namespace: "details",
        key: "shape",
        type: "single_line_text_field",
        value: attributes.shape
      },
      {
        namespace: "details",
        key: "pile_height_mm",
        type: "number_integer",
        value: attributes.pile_height_mm
      },
      {
        namespace: "details",
        key: "suitable_rooms",
        type: "list.single_line_text_field",
        value: attributes.suitable_rooms
      },
      {
        namespace: "details",
        key: "origin_country",
        type: "single_line_text_field",
        value: attributes.origin_country
      },
      {
        namespace: "details",
        key: "style",
        type: "single_line_text_field",
        value: attributes.style
      }
    ],
    metaobjects: [
      {
        type: "care_profile",
        handle: careHandle,
        fields: {
          care_instruction: attributes.care_instruction
        }
      },
      {
        type: "material_definition",
        handle: slugify(attributes.material),
        fields: {
          name: attributes.material,
          style: attributes.style
        }
      }
    ]
  };
}

export function buildRemovalResult(
  removal: ShopifyProductRemoval,
  projectedAt: string,
  operation: ProductProjectionResult["operation"] = "archive",
  targetReference?: string
): ProductProjectionResult {
  return {
    result_id: `projection-result-${slugify(removal.removal_id)}`,
    job_id: removal.removal_id,
    status: "accepted",
    operation,
    target: removal.target,
    projected_at: projectedAt,
    projection: null,
    errors: [],
    ...(targetReference ? { target_reference: targetReference } : {})
  };
}

export function buildRemovalTargetUnavailableResult(
  removal: ShopifyProductRemoval,
  projectedAt: string,
  message: string
): ProductProjectionResult {
  return {
    result_id: `projection-result-${slugify(removal.removal_id)}`,
    job_id: removal.removal_id,
    status: "rejected",
    operation: "archive",
    target: removal.target,
    projected_at: projectedAt,
    projection: null,
    errors: [
      {
        code: "TARGET_UNAVAILABLE",
        message
      }
    ]
  };
}

export function buildProjectionResult(
  job: ProductProjectionJob,
  projectedAt: string,
  dumpPath?: string
): ProductProjectionResult {
  if (job.pim_product.status !== "approved") {
    return {
    result_id: `projection-result-${slugify(job.job_id)}`,
    job_id: job.job_id,
    status: "review_required",
    operation: "upsert",
    target: job.target,
      projected_at: projectedAt,
      projection: null,
      errors: [
        {
          code: "PIM_PRODUCT_INCOMPLETE",
          message: `Product ${job.pim_product.sku} is not approved for commerce projection.`
        }
      ]
    };
  }

  return {
    result_id: `projection-result-${slugify(job.job_id)}`,
    job_id: job.job_id,
    status: "accepted",
    operation: "upsert",
    target: job.target,
    projected_at: projectedAt,
    projection: transformProjectionJobToShopifyProjection(job),
    errors: [],
    ...(dumpPath ? { dump_path: dumpPath } : {})
  };
}

export function buildTargetUnavailableResult(
  job: ProductProjectionJob,
  projectedAt: string,
  message: string
): ProductProjectionResult {
  return {
    result_id: `projection-result-${slugify(job.job_id)}`,
    job_id: job.job_id,
    status: "rejected",
    operation: "upsert",
    target: job.target,
    projected_at: projectedAt,
    projection: transformProjectionJobToShopifyProjection(job),
    errors: [
      {
        code: "TARGET_UNAVAILABLE",
        message
      }
    ]
  };
}
