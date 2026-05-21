import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type {
  ShopifyProductProjection,
  ShopifyProductRemoval
} from "./schemas.js";

export const DEFAULT_SHOPIFY_API_VERSION = "2026-04";
const execFileAsync = promisify(execFile);

export const PIM_PRODUCT_ID_METAFIELD = {
  namespace: "pim",
  key: "external_id"
} as const;

export type ShopifyDeleteMode = "archive" | "permanent";
export type ShopifyAdminAuthMode = "token" | "cli";

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

export const PIM_PRODUCT_ID_DEFINITION_QUERY = `
query PimProductIdDefinition($ownerType: MetafieldOwnerType!, $namespace: String!, $key: String!) {
  metafieldDefinitions(ownerType: $ownerType, namespace: $namespace, key: $key, first: 1) {
    nodes {
      id
      name
      namespace
      key
      type {
        name
      }
      capabilities {
        uniqueValues {
          enabled
        }
      }
    }
  }
}
`;

export const METAFIELD_DEFINITION_CREATE_MUTATION = `
mutation CreatePimProductIdDefinition($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition {
      id
      name
      namespace
      key
      capabilities {
        uniqueValues {
          enabled
        }
      }
    }
    userErrors {
      field
      message
      code
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

export const METAFIELDS_SET_MUTATION = `
mutation SetProductProjectionMetafields($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      id
      namespace
      key
      value
      type
    }
    userErrors {
      field
      message
      code
    }
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

function isMutation(query: string): boolean {
  return /^\s*mutation\b/i.test(query);
}

function normalizeCliGraphqlBody(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  const maybeBody = "body" in value
    ? (value as { body?: unknown }).body
    : value;

  if (
    maybeBody
    && typeof maybeBody === "object"
    && !Array.isArray(maybeBody)
    && !Object.hasOwn(maybeBody, "data")
    && !Object.hasOwn(maybeBody, "errors")
  ) {
    return { data: maybeBody };
  }

  return maybeBody;
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

export function normalizeShopifyAdminAuthMode(value: string | undefined): ShopifyAdminAuthMode {
  if (value === "cli") {
    return "cli";
  }

  return "token";
}

export function buildShopifyStoreExecuteArgs(
  shopDomain: string,
  apiVersion: string,
  query: string,
  variables: unknown
): string[] {
  const args = [
    "store",
    "execute",
    "--store",
    normalizeShopDomain(shopDomain),
    "--query",
    query,
    "--json",
    "--no-color",
    "--version",
    apiVersion
  ];

  if (variables && typeof variables === "object" && Object.keys(variables).length > 0) {
    args.push("--variables", JSON.stringify(variables));
  }

  if (isMutation(query)) {
    args.push("--allow-mutations");
  }

  return args;
}

export async function shopifyAdminGraphql(
  query: string,
  variables: unknown,
  options: {
    shopDomain: string;
    accessToken?: string;
    apiVersion?: string;
    authMode?: ShopifyAdminAuthMode;
  }
) {
  const apiVersion = options.apiVersion ?? DEFAULT_SHOPIFY_API_VERSION;
  const authMode = options.authMode ?? "token";

  if (authMode === "cli") {
    const { stdout } = await execFileAsync(
      "shopify",
      buildShopifyStoreExecuteArgs(options.shopDomain, apiVersion, query, variables),
      { maxBuffer: 1024 * 1024 * 10 }
    );

    return normalizeCliGraphqlBody(JSON.parse(stdout));
  }

  if (!options.accessToken) {
    throw new Error("SHOPIFY_ADMIN_ACCESS_TOKEN is required when SHOPIFY_ADMIN_AUTH_MODE=token.");
  }

  const response = await fetch(shopifyGraphqlEndpoint(options.shopDomain, apiVersion), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-access-token": options.accessToken
    },
    body: JSON.stringify({
      query,
      variables
    })
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(`Shopify Admin API returned HTTP ${response.status}.`);
  }

  return body;
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

export function buildPimProductIdDefinitionLookupVariables() {
  return {
    ownerType: "PRODUCT",
    namespace: PIM_PRODUCT_ID_METAFIELD.namespace,
    key: PIM_PRODUCT_ID_METAFIELD.key
  };
}

export function buildPimProductIdDefinitionCreateVariables() {
  return {
    definition: {
      name: "PIM product ID",
      namespace: PIM_PRODUCT_ID_METAFIELD.namespace,
      key: PIM_PRODUCT_ID_METAFIELD.key,
      description: "Stable PIM identifier used by the Context Architecture lab product projection.",
      type: "id",
      ownerType: "PRODUCT",
      capabilities: {
        uniqueValues: {
          enabled: true
        }
      }
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
      }))
    }
  };
}

export function buildProductMetafieldsSetVariables(projection: ShopifyProductProjection, productId: string) {
  return {
    metafields: [
      {
        ownerId: productId,
        namespace: "pim",
        key: "product_id",
        type: "single_line_text_field",
        value: projection.pim_product_id
      },
      {
        ownerId: productId,
        namespace: "context_architecture",
        key: "projection_id",
        type: "single_line_text_field",
        value: projection.projection_id
      },
      {
        ownerId: productId,
        namespace: "context_architecture",
        key: "metaobjects_json",
        type: "json",
        value: JSON.stringify(projection.metaobjects)
      },
      ...projection.metafields.map((metafield) => ({
        ownerId: productId,
        namespace: metafield.namespace,
        key: metafield.key,
        type: metafield.type,
        value: metafieldValue(metafield.value)
      }))
    ]
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
