import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { promisify } from "node:util";

import { normalizeAkeneoWebhookToExports } from "../services/shared/akeneo-event-bridge.js";
import {
  buildProjectionResult,
  isProductRemovalExport,
  transformAkeneoExportToProjectionJob
} from "../services/shared/product-projection.js";
import {
  akeneoProductExportSchema,
  shopifyProductProjectionSchema,
  type AkeneoProductExport,
  type ShopifyProductProjection
} from "../services/shared/schemas.js";
import {
  DEFAULT_SHOPIFY_API_VERSION,
  PIM_PRODUCT_ID_METAFIELD,
  buildPimProductIdDefinitionCreateVariables,
  buildPimProductIdDefinitionLookupVariables,
  normalizeShopDomain,
  normalizeShopifyAdminAuthMode,
  pimProductIdentifier,
  shopifyAdminGraphql,
  type ShopifyAdminAuthMode
} from "../services/shared/shopify-admin-target.js";

type EnvValues = Record<string, string>;

type AkeneoCatalogSource = "catalog" | "api";

type AkeneoApiProductResource = {
  identifier: string;
  enabled?: boolean;
  family?: string | null;
  values?: Record<string, unknown>;
};

type AkeneoApiConfig = {
  baseUrl: string;
  username: string;
  password: string;
  clientId?: string;
  clientSecret?: string;
  akeneoDir: string;
  scope: string;
  locale: string;
};

type GraphqlBody<T> = {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: {
      code?: string;
      requiredAccess?: string;
    };
  }>;
};

type Publication = {
  id: string;
  name: string;
  app?: {
    title?: string | null;
  } | null;
};

type Location = {
  id: string;
  name: string;
  isActive: boolean;
  fulfillsOnlineOrders?: boolean | null;
};

type MetafieldDefinition = {
  id: string;
  namespace: string;
  key: string;
  name: string;
  type: {
    name: string;
  };
  access?: {
    admin?: string | null;
    storefront?: string | null;
  } | null;
  capabilities?: {
    uniqueValues?: {
      enabled?: boolean | null;
    } | null;
  } | null;
};

type StagedUploadTarget = {
  url: string;
  resourceUrl: string;
  parameters: Array<{
    name: string;
    value: string;
  }>;
};

type UploadedAsset = {
  role: "primary" | "lifestyle";
  originalSource: string;
  filename: string;
  alt: string;
};

const REQUIRED_SCOPE_HINT = [
  "read_products",
  "write_products",
  "read_publications",
  "write_publications",
  "read_inventory",
  "write_inventory",
  "read_locations",
  "write_files"
].join(",");

const DEFAULT_AKENEO_CATALOG_PATH = "examples/products/akeneo-context-home-catalog.json";
const DEFAULT_AKENEO_BASE_URL = "http://localhost:8080";
const DEFAULT_AKENEO_DIR = ".local/akeneo/pim";
const DEFAULT_PUBLICATION_PATTERN = "Headless|Hydrogen|Online Store|Storefront";
const DEFAULT_QUANTITY = 10;
const execFileAsync = promisify(execFile);

const DETAILS_DEFINITIONS: Array<{
  key: string;
  name: string;
  type: string;
  description: string;
}> = [
  {
    key: "material",
    name: "Material",
    type: "single_line_text_field",
    description: "Customer-facing rug material projected from governed PIM data."
  },
  {
    key: "shape",
    name: "Shape",
    type: "single_line_text_field",
    description: "Customer-facing rug shape projected from governed PIM data."
  },
  {
    key: "pile_height_mm",
    name: "Pile height in millimeters",
    type: "number_integer",
    description: "Customer-facing rug pile height projected from governed PIM data."
  },
  {
    key: "suitable_rooms",
    name: "Suitable rooms",
    type: "list.single_line_text_field",
    description: "Customer-facing room fit list projected from governed PIM data."
  },
  {
    key: "origin_country",
    name: "Origin country",
    type: "single_line_text_field",
    description: "Country code projected from governed PIM data."
  },
  {
    key: "style",
    name: "Style",
    type: "single_line_text_field",
    description: "Customer-facing rug style projected from governed PIM data."
  }
];

const STATE_QUERY = `
query DemoCatalogSeedState {
  publications(first: 50) {
    nodes {
      id
      name
      app {
        title
      }
    }
  }
  locations(first: 20) {
    nodes {
      id
      name
      isActive
      fulfillsOnlineOrders
    }
  }
  metafieldDefinitions(first: 100, ownerType: PRODUCT) {
    nodes {
      id
      namespace
      key
      name
      type {
        name
      }
      access {
        admin
        storefront
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

const PIM_PRODUCT_ID_DEFINITION_QUERY = `
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

const METAFIELD_DEFINITION_CREATE_MUTATION = `
mutation CreateDemoMetafieldDefinition($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition {
      id
      namespace
      key
      name
      type {
        name
      }
      access {
        storefront
      }
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

const METAFIELD_DEFINITION_UPDATE_MUTATION = `
mutation UpdateDemoMetafieldDefinition($id: ID!, $definition: MetafieldDefinitionUpdateInput!) {
  metafieldDefinitionUpdate(id: $id, definition: $definition) {
    updatedDefinition {
      id
      namespace
      key
      name
      type {
        name
      }
      access {
        storefront
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

const STAGED_UPLOADS_CREATE_MUTATION = `
mutation CreateDemoCatalogUploads($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets {
      url
      resourceUrl
      parameters {
        name
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

const PRODUCT_SET_MUTATION = `
mutation UpsertDemoCatalogProduct($input: ProductSetInput!, $identifier: ProductSetIdentifiers, $synchronous: Boolean!) {
  productSet(input: $input, identifier: $identifier, synchronous: $synchronous) {
    product {
      id
      handle
      title
      status
      variants(first: 10) {
        nodes {
          id
          sku
        }
      }
      media(first: 10) {
        nodes {
          id
          alt
          mediaContentType
        }
      }
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

const PRODUCT_LOOKUP_QUERY = `
query DemoCatalogProductLookup($identifier: ProductIdentifierInput!, $query: String!) {
  productByIdentifier(identifier: $identifier) {
    id
    handle
    title
  }
  products(first: 1, query: $query) {
    nodes {
      id
      handle
      title
    }
  }
}
`;

const METAFIELDS_SET_MUTATION = `
mutation SetDemoProductMetafields($metafields: [MetafieldsSetInput!]!) {
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

const PUBLISH_MUTATION = `
mutation PublishDemoCatalogProduct($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    publishable {
      ... on Product {
        id
        title
        status
        availablePublicationsCount {
          count
        }
        resourcePublicationsCount {
          count
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

async function readEnvFile(path: string): Promise<EnvValues> {
  try {
    const content = await readFile(path, "utf8");
    return Object.fromEntries(
      content
        .split(/\r?\n/)
        .map((rawLine) => rawLine.trim())
        .filter((line) => line !== "" && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const [key, ...parts] = line.split("=");
          return [key.trim(), parts.join("=").trim().replace(/^["']|["']$/g, "")];
        })
    );
  } catch {
    return {};
  }
}

function firstNonBlank(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value !== undefined && value.trim() !== "");
}

function parseBoolean(value: string | undefined): boolean {
  return value === "1" || value === "true" || value === "yes";
}

function parseAkeneoCatalogSource(value: string | undefined): AkeneoCatalogSource {
  if (!value || value === "catalog") return "catalog";
  if (value === "api") return "api";
  throw new Error(`Unsupported SHOPIFY_DEMO_AKENEO_SOURCE=${value}. Use "catalog" or "api".`);
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseDelimitedList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");
}

function assertNoGraphqlErrors<T>(body: unknown, operation: string): T {
  const graphqlBody = body as GraphqlBody<T>;

  if (graphqlBody.errors?.length) {
    const accessErrors = graphqlBody.errors
      .map((error) => error.extensions?.requiredAccess ?? error.message)
      .join("; ");

    throw new Error(
      `${operation} failed: ${accessErrors}\n\n` +
      `Refresh Shopify CLI auth with:\n` +
      `shopify store auth --store your-shop.myshopify.com --scopes ${REQUIRED_SCOPE_HINT}`
    );
  }

  if (!graphqlBody.data) {
    throw new Error(`${operation} did not return data.`);
  }

  return graphqlBody.data;
}

function assertNoUserErrors(errors: Array<{ field?: string[] | null; message: string }>, operation: string): void {
  if (errors.length === 0) return;
  throw new Error(`${operation} failed: ${errors.map((error) => error.message).join("; ")}`);
}

function publicationLabel(publication: Publication): string {
  return `${publication.name}${publication.app?.title ? ` (${publication.app.title})` : ""}`;
}

function publicationPriority(publication: Publication): number {
  const label = publicationLabel(publication).toLowerCase();
  if (label.includes("hydrogen") || label.includes("headless") || label.includes("storefront")) {
    return 0;
  }
  if (label.includes("online store")) {
    return 1;
  }
  return 2;
}

function pickPublications(publications: Publication[], pattern: string): Publication[] {
  const matcher = new RegExp(pattern, "i");
  const matched = publications
    .filter((publication) => {
      const appTitle = publication.app?.title ?? "";
      return matcher.test(publication.name) || matcher.test(appTitle);
    })
    .sort((left, right) => publicationPriority(left) - publicationPriority(right));

  if (matched.length > 0) return matched;

  throw new Error(
    `No publication matched /${pattern}/. Available publications: ` +
    publications.map(publicationLabel).join(", ")
  );
}

function pickLocation(locations: Location[]): Location {
  const location = locations.find((candidate) => candidate.isActive && candidate.fulfillsOnlineOrders)
    ?? locations.find((candidate) => candidate.isActive);

  if (!location) {
    throw new Error("No active Shopify location was available for demo inventory.");
  }

  return location;
}

function definitionKey(definition: Pick<MetafieldDefinition, "namespace" | "key">) {
  return `${definition.namespace}.${definition.key}`;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function metafieldValue(value: string | number | string[]) {
  return Array.isArray(value) ? JSON.stringify(value) : String(value);
}

function shopifyStatus(status: ShopifyProductProjection["shopify_status"]): "ACTIVE" | "ARCHIVED" | "DRAFT" {
  if (status === "active") return "ACTIVE";
  if (status === "archived") return "ARCHIVED";
  return "DRAFT";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function descriptionHtml(projection: ShopifyProductProjection) {
  return `<p>${escapeHtml(projection.description)}</p>`;
}

function projectionMetafields(projection: ShopifyProductProjection) {
  return [
    {
      namespace: PIM_PRODUCT_ID_METAFIELD.namespace,
      key: PIM_PRODUCT_ID_METAFIELD.key,
      type: "id",
      value: projection.pim_product_id
    },
    {
      namespace: "pim",
      key: "product_id",
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
    ...projection.metafields
  ];
}

function detailValue(projection: ShopifyProductProjection, key: string) {
  const metafield = projection.metafields.find((entry) => (
    entry.namespace === "details" && entry.key === key
  ));
  return metafield?.value;
}

function demoAssetPathFromFile(filename: string) {
  return `apps/storefront/public/demo-catalog/${filename}`;
}

function productSetVariables(
  projection: ShopifyProductProjection,
  assets: UploadedAsset[],
  location: Location,
  quantity: number,
  identifier: { id: string } | { handle: string }
) {
  const sizeValues = unique(projection.variants.map((variant) => variant.option_values.size));
  const colorValues = unique(projection.variants.map((variant) => variant.option_values.color));
  const primaryAsset = assets.find((asset) => asset.role === "primary");
  const material = detailValue(projection, "material");
  const color = projection.variants[0]?.option_values.color;
  const originCountry = detailValue(projection, "origin_country");
  const files = assets.map((asset) => ({
    originalSource: asset.originalSource,
    filename: asset.filename,
    contentType: "IMAGE",
    alt: asset.alt,
    duplicateResolutionMode: "REPLACE"
  }));

  return {
    synchronous: true,
    identifier,
    input: {
      title: projection.title,
      handle: projection.handle,
      vendor: projection.vendor,
      productType: projection.product_type,
      descriptionHtml: descriptionHtml(projection),
      status: shopifyStatus(projection.shopify_status),
      tags: [
        "context-architecture-lab",
        "context-home-demo",
        "akeneo-projection",
        projection.product_type.toLowerCase(),
        ...(typeof material === "string" ? [material] : []),
        ...(typeof color === "string" ? [color] : [])
      ],
      seo: {
        title: projection.title,
        description: projection.description.slice(0, 320)
      },
      ...(files.length > 0 ? { files } : {}),
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
        inventoryPolicy: "DENY",
        inventoryItem: {
          tracked: true,
          requiresShipping: true,
          ...(typeof originCountry === "string" ? { countryCodeOfOrigin: originCountry } : {})
        },
        inventoryQuantities: [
          {
            locationId: location.id,
            name: "available",
            quantity
          }
        ],
        ...(primaryAsset
          ? {
            file: {
              originalSource: primaryAsset.originalSource,
              filename: primaryAsset.filename,
              contentType: "IMAGE",
              alt: primaryAsset.alt,
              duplicateResolutionMode: "REPLACE"
            }
          }
          : {}),
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

async function graphql<T>(
  operation: string,
  query: string,
  variables: unknown,
  options: {
    shopDomain: string;
    accessToken?: string;
    apiVersion: string;
    authMode: ShopifyAdminAuthMode;
  }
) {
  return assertNoGraphqlErrors<T>(
    await shopifyAdminGraphql(query, variables, options),
    operation
  );
}

async function ensurePimIdentifierDefinition(options: {
  shopDomain: string;
  accessToken?: string;
  apiVersion: string;
  authMode: ShopifyAdminAuthMode;
}) {
  const lookup = await graphql<{
    metafieldDefinitions: {
      nodes: MetafieldDefinition[];
    };
  }>(
    "Read PIM product ID metafield definition",
    PIM_PRODUCT_ID_DEFINITION_QUERY,
    buildPimProductIdDefinitionLookupVariables(),
    options
  );
  const existing = lookup.metafieldDefinitions.nodes[0];

  if (existing) {
    if (existing.type.name !== "id" || existing.capabilities?.uniqueValues?.enabled !== true) {
      throw new Error(
        `${definitionKey(existing)} exists but is not an id metafield with unique values enabled.`
      );
    }
    return existing;
  }

  const created = await graphql<{
    metafieldDefinitionCreate: {
      createdDefinition: MetafieldDefinition | null;
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    "Create PIM product ID metafield definition",
    METAFIELD_DEFINITION_CREATE_MUTATION,
    buildPimProductIdDefinitionCreateVariables(),
    options
  );
  assertNoUserErrors(
    created.metafieldDefinitionCreate.userErrors,
    "Create PIM product ID metafield definition"
  );

  if (!created.metafieldDefinitionCreate.createdDefinition) {
    throw new Error("PIM product ID metafield definition creation did not return a definition.");
  }

  return created.metafieldDefinitionCreate.createdDefinition;
}

async function ensureDemoDetailDefinitions(
  definitions: MetafieldDefinition[],
  options: {
    shopDomain: string;
    accessToken?: string;
    apiVersion: string;
    authMode: ShopifyAdminAuthMode;
  }
) {
  const byKey = new Map(definitions.map((definition) => [definitionKey(definition), definition]));
  const ensured: MetafieldDefinition[] = [];

  for (const detailDefinition of DETAILS_DEFINITIONS) {
    const key = `details.${detailDefinition.key}`;
    const existing = byKey.get(key);

    if (existing && existing.type.name !== detailDefinition.type) {
      throw new Error(
        `${key} exists as type ${existing.type.name}, expected ${detailDefinition.type}.`
      );
    }

    if (!existing) {
      const created = await graphql<{
        metafieldDefinitionCreate: {
          createdDefinition: MetafieldDefinition | null;
          userErrors: Array<{ field?: string[] | null; message: string }>;
        };
      }>(
        `Create ${key} metafield definition`,
        METAFIELD_DEFINITION_CREATE_MUTATION,
        {
          definition: {
            namespace: "details",
            key: detailDefinition.key,
            name: detailDefinition.name,
            description: detailDefinition.description,
            ownerType: "PRODUCT",
            type: detailDefinition.type,
            access: {
              storefront: "PUBLIC_READ"
            }
          }
        },
        options
      );
      assertNoUserErrors(
        created.metafieldDefinitionCreate.userErrors,
        `Create ${key} metafield definition`
      );

      if (!created.metafieldDefinitionCreate.createdDefinition) {
        throw new Error(`${key} metafield definition creation did not return a definition.`);
      }

      ensured.push(created.metafieldDefinitionCreate.createdDefinition);
      continue;
    }

    if (existing.access?.storefront !== "PUBLIC_READ") {
      const updated = await graphql<{
        metafieldDefinitionUpdate: {
          updatedDefinition: MetafieldDefinition | null;
          userErrors: Array<{ field?: string[] | null; message: string }>;
        };
      }>(
        `Update ${key} Storefront API access`,
        METAFIELD_DEFINITION_UPDATE_MUTATION,
        {
          id: existing.id,
          definition: {
            namespace: "details",
            key: detailDefinition.key,
            ownerType: "PRODUCT",
            access: {
              storefront: "PUBLIC_READ"
            }
          }
        },
        options
      );
      assertNoUserErrors(
        updated.metafieldDefinitionUpdate.userErrors,
        `Update ${key} Storefront API access`
      );

      if (!updated.metafieldDefinitionUpdate.updatedDefinition) {
        throw new Error(`${key} metafield definition update did not return a definition.`);
      }

      ensured.push(updated.metafieldDefinitionUpdate.updatedDefinition);
      continue;
    }

    ensured.push(existing);
  }

  return ensured;
}

async function createStagedUploads(
  inputs: Array<{
    filename: string;
    mimeType: string;
    fileSize: number;
  }>,
  options: {
    shopDomain: string;
    accessToken?: string;
    apiVersion: string;
    authMode: ShopifyAdminAuthMode;
  }
) {
  const result = await graphql<{
    stagedUploadsCreate: {
      stagedTargets: StagedUploadTarget[];
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    "Create staged upload targets",
    STAGED_UPLOADS_CREATE_MUTATION,
    {
      input: inputs.map((input) => ({
        resource: "IMAGE",
        filename: input.filename,
        mimeType: input.mimeType,
        fileSize: String(input.fileSize),
        httpMethod: "POST"
      }))
    },
    options
  );
  assertNoUserErrors(result.stagedUploadsCreate.userErrors, "Create staged upload targets");

  return result.stagedUploadsCreate.stagedTargets;
}

async function uploadToStagedTarget(target: StagedUploadTarget, filePath: string, mimeType: string) {
  const formData = new FormData();
  for (const parameter of target.parameters) {
    formData.append(parameter.name, parameter.value);
  }
  const buffer = await readFile(filePath);
  formData.append("file", new Blob([buffer], { type: mimeType }), basename(filePath));

  const response = await fetch(target.url, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload ${filePath} failed with HTTP ${response.status}.`);
  }
}

async function uploadProjectionAssets(
  projection: ShopifyProductProjection,
  options: {
    shopDomain: string;
    accessToken?: string;
    apiVersion: string;
    authMode: ShopifyAdminAuthMode;
  }
): Promise<UploadedAsset[]> {
  const media = projection.media ?? [];
  if (media.length === 0) return [];

  const assets = media.map((asset) => ({
    role: asset.role,
    filePath: demoAssetPathFromFile(asset.filename),
    filename: asset.filename,
    mimeType: "image/jpeg",
    alt: asset.alt ?? projection.title
  }));

  const targets = await createStagedUploads(
    await Promise.all(
      assets.map(async (asset) => ({
        filename: asset.filename,
        mimeType: asset.mimeType,
        fileSize: (await readFile(asset.filePath)).byteLength
      }))
    ),
    options
  );

  if (targets.length !== assets.length) {
    throw new Error(`Expected ${assets.length} staged upload targets, received ${targets.length}.`);
  }

  const uploaded: UploadedAsset[] = [];

  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index];
    const target = targets[index];
    await uploadToStagedTarget(target, asset.filePath, asset.mimeType);
    uploaded.push({
      role: asset.role,
      originalSource: target.resourceUrl,
      filename: asset.filename,
      alt: asset.alt
    });
  }

  return uploaded;
}

async function findExistingProduct(
  projection: ShopifyProductProjection,
  options: {
    shopDomain: string;
    accessToken?: string;
    apiVersion: string;
    authMode: ShopifyAdminAuthMode;
  }
) {
  const result = await graphql<{
    productByIdentifier: { id: string; handle: string; title: string } | null;
    products: {
      nodes: Array<{ id: string; handle: string; title: string }>;
    };
  }>(
    `Find ${projection.title}`,
    PRODUCT_LOOKUP_QUERY,
    {
      identifier: pimProductIdentifier(projection.pim_product_id),
      query: `handle:${projection.handle}`
    },
    options
  );

  return result.productByIdentifier ?? result.products.nodes[0] ?? null;
}

async function upsertProduct(
  projection: ShopifyProductProjection,
  assets: UploadedAsset[],
  location: Location,
  quantity: number,
  options: {
    shopDomain: string;
    accessToken?: string;
    apiVersion: string;
    authMode: ShopifyAdminAuthMode;
  }
) {
  const existingProduct = await findExistingProduct(projection, options);
  const identifier = existingProduct
    ? { id: existingProduct.id }
    : { handle: projection.handle };
  const result = await graphql<{
    productSet: {
      product: {
        id: string;
        handle: string;
        title: string;
        status: string;
        variants: {
          nodes: Array<{ id: string; sku: string | null }>;
        };
        media: {
          nodes: Array<{ id: string; alt: string | null; mediaContentType: string }>;
        };
      } | null;
      productSetOperation: {
        id: string;
        status: string;
      } | null;
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    `Upsert ${projection.title}`,
    PRODUCT_SET_MUTATION,
    productSetVariables(projection, assets, location, quantity, identifier),
    options
  );
  assertNoUserErrors(result.productSet.userErrors, `Upsert ${projection.title}`);

  if (!result.productSet.product) {
    throw new Error(`Product upsert for ${projection.title} did not return a product.`);
  }

  return result.productSet.product;
}

async function setProductMetafields(
  productId: string,
  projection: ShopifyProductProjection,
  options: {
    shopDomain: string;
    accessToken?: string;
    apiVersion: string;
    authMode: ShopifyAdminAuthMode;
  }
) {
  const result = await graphql<{
    metafieldsSet: {
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    `Set ${projection.title} metafields`,
    METAFIELDS_SET_MUTATION,
    {
      metafields: projectionMetafields(projection).map((metafield) => ({
        ownerId: productId,
        ...metafield,
        value: metafieldValue(metafield.value)
      }))
    },
    options
  );
  assertNoUserErrors(result.metafieldsSet.userErrors, `Set ${projection.title} metafields`);
}

async function publishProduct(
  productId: string,
  publications: Publication[],
  options: {
    shopDomain: string;
    accessToken?: string;
    apiVersion: string;
    authMode: ShopifyAdminAuthMode;
  }
) {
  const result = await graphql<{
    publishablePublish: {
      publishable: {
        id: string;
        title: string;
        status: string;
        availablePublicationsCount?: { count: number };
        resourcePublicationsCount?: { count: number };
      } | null;
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    "Publish demo product",
    PUBLISH_MUTATION,
    {
      id: productId,
      input: publications.map((publication) => ({
        publicationId: publication.id
      }))
    },
    options
  );
  assertNoUserErrors(result.publishablePublish.userErrors, "Publish demo product");
  return result.publishablePublish.publishable;
}

async function readAkeneoDemoCatalog(path: string): Promise<AkeneoProductExport[]> {
  const raw = JSON.parse(await readFile(path, "utf8"));
  const entries = Array.isArray(raw) ? raw : [raw];
  return entries.map((entry) => akeneoProductExportSchema.parse(entry));
}

async function runAkeneoConsole(akeneoDir: string, args: string[]) {
  if (!existsSync(akeneoDir)) {
    throw new Error(
      `No local Akeneo project found at ${akeneoDir}. ` +
      "Provide AKENEO_API_CLIENT_ID and AKENEO_API_CLIENT_SECRET, or run npm run akeneo:setup first."
    );
  }

  const command = `cd ${JSON.stringify(akeneoDir)} && docker compose run --rm php bin/console ${
    args.map((arg) => JSON.stringify(arg)).join(" ")
  }`;
  const result = await execFileAsync("bash", ["-lc", command], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024
  });

  return String(result.stdout);
}

async function findAkeneoApiClient(config: AkeneoApiConfig) {
  if (config.clientId && config.clientSecret) {
    return {
      clientId: config.clientId,
      clientSecret: config.clientSecret
    };
  }

  const output = await runAkeneoConsole(config.akeneoDir, [
    "pim:oauth-server:list-clients",
    "--no-ansi"
  ]);
  const row = output
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("|") && line.includes("_") && !line.includes("client id"));

  if (!row) {
    throw new Error("Could not find a local Akeneo API client. Run npm run akeneo:setup first.");
  }

  const columns = row
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    clientId: columns[0],
    clientSecret: columns[1]
  };
}

async function akeneoAccessToken(config: AkeneoApiConfig): Promise<string> {
  const { clientId, clientSecret } = await findAkeneoApiClient(config);
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${config.baseUrl}/api/oauth/v1/token`, {
    method: "POST",
    headers: {
      authorization: `Basic ${credentials}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      grant_type: "password",
      username: config.username,
      password: config.password
    })
  });

  if (!response.ok) {
    throw new Error(`Akeneo token request failed: HTTP ${response.status} ${await response.text()}`);
  }

  const body = await response.json() as { access_token?: unknown };
  if (typeof body.access_token !== "string" || body.access_token.trim() === "") {
    throw new Error("Akeneo token response did not include an access_token.");
  }

  return body.access_token;
}

async function akeneoGet<T>(accessToken: string, path: string, config: AkeneoApiConfig): Promise<T> {
  const response = await fetch(`${config.baseUrl}${path}`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed: HTTP ${response.status} ${await response.text()}`);
  }

  return await response.json() as T;
}

async function readAkeneoApiCatalog(
  identifiers: string[],
  config: AkeneoApiConfig
): Promise<AkeneoProductExport[]> {
  if (identifiers.length === 0) {
    throw new Error("At least one Akeneo identifier is required for SHOPIFY_DEMO_AKENEO_SOURCE=api.");
  }

  const accessToken = await akeneoAccessToken(config);
  const now = new Date().toISOString();
  const exports: AkeneoProductExport[] = [];

  for (const identifier of identifiers) {
    const query = new URLSearchParams({
      scope: config.scope,
      locales: config.locale
    });
    const resource = await akeneoGet<AkeneoApiProductResource>(
      accessToken,
      `/api/rest/v1/products/${encodeURIComponent(identifier)}?${query.toString()}`,
      config
    );
    const normalized = normalizeAkeneoWebhookToExports({
      events: [
        {
          event_id: `akeneo-api-${resource.identifier}-${now}`,
          event_datetime: now,
          action: "product.updated",
          data: {
            resource
          }
        }
      ]
    }, now);

    if (normalized.length !== 1) {
      throw new Error(`Akeneo product ${identifier} did not normalize to one rug export.`);
    }

    exports.push(normalized[0]);
  }

  return exports;
}

async function readAkeneoCatalogForSync(options: {
  source: AkeneoCatalogSource;
  catalogPath: string;
  identifiers: string[];
  apiConfig: AkeneoApiConfig;
}) {
  if (options.source === "catalog") {
    return await readAkeneoDemoCatalog(options.catalogPath);
  }

  const identifiers = options.identifiers.length > 0
    ? options.identifiers
    : (await readAkeneoDemoCatalog(options.catalogPath)).map((entry) => entry.product.identifier);
  return await readAkeneoApiCatalog(unique(identifiers), options.apiConfig);
}

function projectAkeneoExport(productExport: AkeneoProductExport): ShopifyProductProjection {
  if (isProductRemovalExport(productExport)) {
    throw new Error(`${productExport.export_id} is a removal event; demo catalog sync only accepts upsert exports.`);
  }

  const job = transformAkeneoExportToProjectionJob(
    productExport,
    new Date().toISOString(),
    "shopify-dev-store"
  );
  const result = buildProjectionResult(job, new Date().toISOString());

  if (result.status !== "accepted" || !result.projection) {
    throw new Error(
      `${productExport.export_id} did not produce an accepted Shopify projection: ` +
      result.errors.map((error) => `${error.code} ${error.message}`).join("; ")
    );
  }

  return shopifyProductProjectionSchema.parse(result.projection);
}

const runtimeEnv = await readEnvFile(".env");
const agentEnv = await readEnvFile(".env.agent");

const shopDomain = normalizeShopDomain(firstNonBlank(
  process.env.SHOPIFY_SHOP_DOMAIN,
  runtimeEnv.SHOPIFY_SHOP_DOMAIN,
  process.env.SHOPIFY_AGENT_SHOP_DOMAIN,
  agentEnv.SHOPIFY_AGENT_SHOP_DOMAIN
) ?? "");
const authMode: ShopifyAdminAuthMode = normalizeShopifyAdminAuthMode(firstNonBlank(
  process.env.SHOPIFY_ADMIN_AUTH_MODE,
  runtimeEnv.SHOPIFY_ADMIN_AUTH_MODE,
  process.env.SHOPIFY_AGENT_AUTH_MODE,
  agentEnv.SHOPIFY_AGENT_AUTH_MODE
));
const accessToken = firstNonBlank(
  process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  runtimeEnv.SHOPIFY_ADMIN_ACCESS_TOKEN
);
const apiVersion = firstNonBlank(
  process.env.SHOPIFY_API_VERSION,
  runtimeEnv.SHOPIFY_API_VERSION
) ?? DEFAULT_SHOPIFY_API_VERSION;
const publicationPattern = firstNonBlank(process.env.SHOPIFY_DEMO_PUBLICATION_PATTERN)
  ?? DEFAULT_PUBLICATION_PATTERN;
const catalogPath = firstNonBlank(
  process.env.SHOPIFY_DEMO_AKENEO_CATALOG,
  process.env.AKENEO_DEMO_CATALOG
) ?? DEFAULT_AKENEO_CATALOG_PATH;
const akeneoSource = parseAkeneoCatalogSource(firstNonBlank(
  process.env.SHOPIFY_DEMO_AKENEO_SOURCE,
  process.env.AKENEO_DEMO_SOURCE
));
const akeneoIdentifiers = parseDelimitedList(firstNonBlank(
  process.env.SHOPIFY_DEMO_AKENEO_SKUS,
  process.env.AKENEO_DEMO_SKUS,
  process.env.AKENEO_RUG_SKU
));
const akeneoApiConfig: AkeneoApiConfig = {
  baseUrl: (firstNonBlank(
    process.env.AKENEO_BASE_URL,
    runtimeEnv.AKENEO_BASE_URL
  ) ?? DEFAULT_AKENEO_BASE_URL).replace(/\/$/, ""),
  username: firstNonBlank(
    process.env.AKENEO_USERNAME,
    runtimeEnv.AKENEO_USERNAME
  ) ?? "admin",
  password: firstNonBlank(
    process.env.AKENEO_PASSWORD,
    runtimeEnv.AKENEO_PASSWORD
  ) ?? "admin",
  clientId: firstNonBlank(
    process.env.AKENEO_API_CLIENT_ID,
    runtimeEnv.AKENEO_API_CLIENT_ID
  ),
  clientSecret: firstNonBlank(
    process.env.AKENEO_API_CLIENT_SECRET,
    runtimeEnv.AKENEO_API_CLIENT_SECRET
  ),
  akeneoDir: firstNonBlank(
    process.env.AKENEO_DIR,
    runtimeEnv.AKENEO_DIR
  ) ?? DEFAULT_AKENEO_DIR,
  scope: firstNonBlank(
    process.env.AKENEO_SCOPE,
    runtimeEnv.AKENEO_SCOPE
  ) ?? "ecommerce",
  locale: firstNonBlank(
    process.env.AKENEO_LOCALE,
    runtimeEnv.AKENEO_LOCALE
  ) ?? "en_US"
};
const quantity = parsePositiveInteger(process.env.SHOPIFY_DEMO_QUANTITY, DEFAULT_QUANTITY);
const dryRun = parseBoolean(process.env.SHOPIFY_DEMO_DRY_RUN);

if (!shopDomain) {
  console.error("SHOPIFY_SHOP_DOMAIN is required. For local CLI mode, .env.agent SHOPIFY_AGENT_SHOP_DOMAIN can be used as a fallback.");
  process.exit(1);
}

if (authMode === "token" && !accessToken) {
  console.error("SHOPIFY_ADMIN_ACCESS_TOKEN is required when SHOPIFY_ADMIN_AUTH_MODE=token. Use SHOPIFY_ADMIN_AUTH_MODE=cli for local Shopify CLI store auth.");
  process.exit(1);
}

const options = {
  shopDomain,
  accessToken,
  apiVersion,
  authMode
};

try {
  const akeneoExports = await readAkeneoCatalogForSync({
    source: akeneoSource,
    catalogPath,
    identifiers: akeneoIdentifiers,
    apiConfig: akeneoApiConfig
  });
  const projections = akeneoExports.map((productExport) => ({
    source_export_id: productExport.export_id,
    projection: projectAkeneoExport(productExport)
  }));
  const state = await graphql<{
    publications: { nodes: Publication[] };
    locations: { nodes: Location[] };
    metafieldDefinitions: { nodes: MetafieldDefinition[] };
  }>(
    "Read demo catalog seed state",
    STATE_QUERY,
    {},
    options
  );
  const publications = pickPublications(state.publications.nodes, publicationPattern);
  const location = pickLocation(state.locations.nodes);

  if (dryRun) {
    console.log(JSON.stringify({
      status: "dry_run",
      shop_domain: shopDomain,
      api_version: apiVersion,
      auth_mode: authMode,
      akeneo_source: akeneoSource,
      akeneo_catalog: catalogPath,
      ...(akeneoSource === "api"
        ? {
          akeneo_base_url: akeneoApiConfig.baseUrl,
          akeneo_scope: akeneoApiConfig.scope,
          akeneo_locale: akeneoApiConfig.locale,
          akeneo_identifiers: akeneoIdentifiers.length > 0
            ? akeneoIdentifiers
            : akeneoExports.map((entry) => entry.product.identifier)
        }
        : {}),
      publications: publications.map((publication) => ({
        id: publication.id,
        name: publication.name,
        app_title: publication.app?.title ?? null
      })),
      inventory_location: {
        id: location.id,
        name: location.name,
        quantity
      },
      products: projections.map(({ source_export_id, projection }) => ({
        source_export_id,
        title: projection.title,
        handle: projection.handle,
        sku: projection.variants[0]?.sku,
        pim_product_id: projection.pim_product_id,
        projection_id: projection.projection_id,
        media: projection.media?.map((asset) => demoAssetPathFromFile(asset.filename)) ?? []
      })),
      mutations_skipped: true
    }, null, 2));
    process.exit(0);
  }

  await ensurePimIdentifierDefinition(options);
  const detailDefinitions = await ensureDemoDetailDefinitions(
    state.metafieldDefinitions.nodes,
    options
  );

  const products = [];
  for (const { source_export_id, projection } of projections) {
    const assets = await uploadProjectionAssets(projection, options);
    const product = await upsertProduct(projection, assets, location, quantity, options);
    await setProductMetafields(product.id, projection, options);
    const publicationResult = await publishProduct(product.id, publications, options);
    products.push({
      source_export_id,
      id: product.id,
      title: product.title,
      handle: product.handle,
      status: product.status,
      variant_skus: product.variants.nodes.map((variant) => variant.sku),
      media_count: product.media.nodes.length,
      publication_count: publicationResult?.resourcePublicationsCount?.count ?? null,
      publication_status: publicationResult?.status ?? null
    });
  }

  console.log(JSON.stringify({
    status: "ok",
    shop_domain: shopDomain,
    api_version: apiVersion,
    auth_mode: authMode,
    akeneo_source: akeneoSource,
    akeneo_catalog: catalogPath,
    ...(akeneoSource === "api"
      ? {
        akeneo_base_url: akeneoApiConfig.baseUrl,
        akeneo_scope: akeneoApiConfig.scope,
        akeneo_locale: akeneoApiConfig.locale,
        akeneo_identifiers: akeneoIdentifiers.length > 0
          ? akeneoIdentifiers
          : akeneoExports.map((entry) => entry.product.identifier)
      }
      : {}),
    publications: publications.map((publication) => ({
      id: publication.id,
      name: publication.name,
      app_title: publication.app?.title ?? null
    })),
    inventory_location: {
      id: location.id,
      name: location.name,
      quantity
    },
    storefront_metafields: detailDefinitions.map((definition) => ({
      namespace: definition.namespace,
      key: definition.key,
      type: definition.type.name,
      storefront_access: definition.access?.storefront ?? "PUBLIC_READ"
    })),
    products
  }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
