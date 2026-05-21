import type {
  ShopifyProductProjection,
  ShopifyProductRemoval
} from "./schemas.js";

export const DEFAULT_SHOPIFY_API_VERSION = "2026-04";
export const PIM_PRODUCT_ID_METAFIELD = {
  namespace: "pim",
  key: "product_id"
} as const;

export type ShopifyDeleteMode = "archive" | "permanent";

export const PRODUCT_SET_MUTATION = `
mutation UpsertProductByPimId($input: ProductSetInput!, $identifier: ProductSetIdentifiers, $synchronous: Boolean!) {
  productSet(input: $input, identifier: $identifier, synchronous: $synchronous) {
    product {
      id
      handle
      title
      status
    }
    productSetOperation {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const PRODUCT_BY_IDENTIFIER_QUERY = `
query ProductByPimId($identifier: ProductIdentifierInput!) {
  productByIdentifier(identifier: $identifier) {
    id
    handle
    title
    status
  }
}
`;

export const PRODUCT_DELETE_MUTATION = `
mutation DeleteProduct($input: ProductDeleteInput!, $synchronous: Boolean!) {
  productDelete(input: $input, synchronous: $synchronous) {
    deletedProductId
    productDeleteOperation {
      id
      status
      deletedProductId
    }
    userErrors {
      field
      message
    }
  }
}
`;

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function metafieldValue(value: string | number | string[]): string {
  return Array.isArray(value) ? JSON.stringify(value) : String(value);
}

function shopifyStatus(status: ShopifyProductProjection["shopify_status"]): "ACTIVE" | "ARCHIVED" | "DRAFT" {
  if (status === "active") {
    return "ACTIVE";
  }

  if (status === "archived") {
    return "ARCHIVED";
  }

  return "DRAFT";
}

export function normalizeShopDomain(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
}

export function shopifyGraphqlEndpoint(shopDomain: string, apiVersion = DEFAULT_SHOPIFY_API_VERSION): string {
  return `https://${normalizeShopDomain(shopDomain)}/admin/api/${apiVersion}/graphql.json`;
}

export function pimProductIdentifier(pimProductId: string) {
  return {
    customId: {
      namespace: PIM_PRODUCT_ID_METAFIELD.namespace,
      key: PIM_PRODUCT_ID_METAFIELD.key,
      value: pimProductId
    }
  };
}

export function buildProductSetVariables(projection: ShopifyProductProjection) {
  const sizeValues = unique(projection.variants.map((variant) => variant.option_values.size));
  const colorValues = unique(projection.variants.map((variant) => variant.option_values.color));

  return {
    synchronous: true,
    identifier: pimProductIdentifier(projection.pim_product_id),
    input: {
      title: projection.title,
      handle: projection.handle,
      vendor: projection.vendor,
      productType: projection.product_type,
      descriptionHtml: projection.description,
      status: shopifyStatus(projection.shopify_status),
      tags: ["context-architecture-lab", "akeneo-projection", projection.product_type.toLowerCase()],
      productOptions: [
        {
          name: "Size",
          position: 1,
          values: sizeValues.map((name) => ({ name }))
        },
        {
          name: "Color",
          position: 2,
          values: colorValues.map((name) => ({ name }))
        }
      ],
      variants: projection.variants.map((variant) => ({
        sku: variant.sku,
        price: String(variant.price),
        optionValues: [
          {
            optionName: "Size",
            name: variant.option_values.size
          },
          {
            optionName: "Color",
            name: variant.option_values.color
          }
        ]
      })),
      metafields: [
        {
          namespace: PIM_PRODUCT_ID_METAFIELD.namespace,
          key: PIM_PRODUCT_ID_METAFIELD.key,
          type: "single_line_text_field",
          value: projection.pim_product_id
        },
        {
          namespace: "context_architecture",
          key: "projection_id",
          type: "single_line_text_field",
          value: projection.projection_id
        },
        {
          namespace: "context_architecture",
          key: "metaobjects_json",
          type: "json",
          value: JSON.stringify(projection.metaobjects)
        },
        ...projection.metafields.map((metafield) => ({
          namespace: metafield.namespace,
          key: metafield.key,
          type: metafield.type,
          value: metafieldValue(metafield.value)
        }))
      ]
    }
  };
}

export function buildProductLookupVariables(removal: ShopifyProductRemoval) {
  return {
    identifier: pimProductIdentifier(removal.pim_product_id)
  };
}

export function buildProductArchiveVariables(removal: ShopifyProductRemoval) {
  return {
    synchronous: true,
    identifier: pimProductIdentifier(removal.pim_product_id),
    input: {
      status: "ARCHIVED"
    }
  };
}

export function buildProductDeleteVariables(productId: string) {
  return {
    synchronous: true,
    input: {
      id: productId
    }
  };
}
