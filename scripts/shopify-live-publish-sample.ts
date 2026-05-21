import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

import {
  DEFAULT_SHOPIFY_API_VERSION,
  normalizeShopDomain,
  normalizeShopifyAdminAuthMode,
  pimProductIdentifier,
  shopifyAdminGraphql,
  type ShopifyAdminAuthMode
} from "../services/shared/shopify-admin-target.js";

type EnvValues = Record<string, string>;

const DEFAULT_PIM_PRODUCT_ID = "pim-rug-atlas-sand";
const DEFAULT_QUANTITY = 10;
const DEFAULT_PUBLICATION_PATTERN = "Headless|Hydrogen|Online Store";
const STOREFRONT_ENV_PATH = "apps/storefront/.env";

const REQUIRED_SCOPE_HINT = [
  "read_products",
  "write_products",
  "read_publications",
  "write_publications",
  "read_inventory",
  "write_inventory",
  "read_locations",
  "unauthenticated_read_product_listings",
  "unauthenticated_read_product_inventory",
  "unauthenticated_read_content",
  "unauthenticated_read_checkouts",
  "unauthenticated_write_checkouts"
].join(",");

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

type Quantity = {
  name: string;
  quantity: number;
};

type Location = {
  id: string;
  name: string;
  isActive: boolean;
  fulfillsOnlineOrders?: boolean | null;
};

type Publication = {
  id: string;
  name: string;
  app?: {
    title?: string | null;
  } | null;
};

type InventoryLevel = {
  location: Location;
  quantities: Quantity[];
};

type ProductVariant = {
  id: string;
  sku: string | null;
  inventoryQuantity: number;
  inventoryPolicy: "CONTINUE" | "DENY";
  inventoryItem: {
    id: string;
    tracked: boolean;
    inventoryLevels: {
      nodes: InventoryLevel[];
    };
  };
};

type Product = {
  id: string;
  title: string;
  handle: string;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  onlineStoreUrl: string | null;
  publishedAt: string | null;
  availablePublicationsCount: {
    count: number;
  };
  resourcePublicationsCount: {
    count: number;
  };
  variants: {
    nodes: ProductVariant[];
  };
};

type StateQueryData = {
  publications: {
    nodes: Publication[];
  };
  locations: {
    nodes: Location[];
  };
  productByIdentifier: Product | null;
};

const STATE_QUERY = `
query SamplePublicationState($identifier: ProductIdentifierInput!) {
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
  productByIdentifier(identifier: $identifier) {
    id
    title
    handle
    status
    onlineStoreUrl
    publishedAt
    availablePublicationsCount {
      count
    }
    resourcePublicationsCount {
      count
    }
    variants(first: 10) {
      nodes {
        id
        sku
        inventoryQuantity
        inventoryPolicy
        inventoryItem {
          id
          tracked
          inventoryLevels(first: 10) {
            nodes {
              quantities(names: ["available", "on_hand"]) {
                name
                quantity
              }
              location {
                id
                name
                isActive
                fulfillsOnlineOrders
              }
            }
          }
        }
      }
    }
  }
}
`;

const PRODUCT_UPDATE_MUTATION = `
mutation ActivateSampleProduct($product: ProductUpdateInput!) {
  productUpdate(product: $product) {
    product {
      id
      title
      handle
      status
    }
    userErrors {
      field
      message
    }
  }
}
`;

const INVENTORY_ITEM_UPDATE_MUTATION = `
mutation TrackInventoryItem($id: ID!, $input: InventoryItemInput!) {
  inventoryItemUpdate(id: $id, input: $input) {
    inventoryItem {
      id
      tracked
    }
    userErrors {
      field
      message
    }
  }
}
`;

const INVENTORY_ACTIVATE_MUTATION = `
mutation ActivateInventoryItem($inventoryItemId: ID!, $locationId: ID!, $available: Int) {
  inventoryActivate(inventoryItemId: $inventoryItemId, locationId: $locationId, available: $available) {
    inventoryLevel {
      id
      quantities(names: ["available"]) {
        name
        quantity
      }
      location {
        id
        name
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

const INVENTORY_SET_MUTATION = `
mutation SetSampleInventory($input: InventorySetQuantitiesInput!) {
  inventorySetQuantities(input: $input) {
    inventoryAdjustmentGroup {
      createdAt
      reason
      referenceDocumentUri
      changes {
        name
        delta
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

const PUBLISH_MUTATION = `
mutation PublishSampleProduct($id: ID!, $input: [PublicationInput!]!) {
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

const STOREFRONT_TOKEN_CREATE_MUTATION = `
mutation CreateContextLabStorefrontToken($input: StorefrontAccessTokenInput!) {
  storefrontAccessTokenCreate(input: $input) {
    storefrontAccessToken {
      id
      title
      accessToken
      accessScopes {
        handle
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

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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
  if (errors.length === 0) {
    return;
  }

  throw new Error(`${operation} failed: ${errors.map((error) => error.message).join("; ")}`);
}

function pickPublication(publications: Publication[], pattern: string): Publication {
  const matcher = new RegExp(pattern, "i");
  const matched = publications.find((publication) => {
    const appTitle = publication.app?.title ?? "";
    return matcher.test(publication.name) || matcher.test(appTitle);
  });

  if (matched) {
    return matched;
  }

  throw new Error(
    `No publication matched /${pattern}/. Available publications: ` +
    publications.map((publication) => `${publication.name}${publication.app?.title ? ` (${publication.app.title})` : ""}`).join(", ")
  );
}

function pickLocation(locations: Location[], variant: ProductVariant, preferredLocationId: string | undefined): Location {
  if (preferredLocationId) {
    const preferred = locations.find((location) => location.id === preferredLocationId);

    if (!preferred) {
      throw new Error(`SHOPIFY_PUBLISH_LOCATION_ID did not match any active location: ${preferredLocationId}`);
    }

    return preferred;
  }

  const activeInventoryLocation = variant.inventoryItem.inventoryLevels.nodes
    .map((level) => level.location)
    .find((location) => location.isActive && location.fulfillsOnlineOrders);

  if (activeInventoryLocation) {
    return activeInventoryLocation;
  }

  const activeLocation = locations.find((location) => location.isActive && location.fulfillsOnlineOrders)
    ?? locations.find((location) => location.isActive);

  if (!activeLocation) {
    throw new Error("No active Shopify location was available for test inventory.");
  }

  return activeLocation;
}

function pickVariant(product: Product, sku: string | undefined): ProductVariant {
  if (sku) {
    const matched = product.variants.nodes.find((variant) => variant.sku === sku);

    if (!matched) {
      throw new Error(`SHOPIFY_PUBLISH_VARIANT_SKU did not match a product variant: ${sku}`);
    }

    return matched;
  }

  const [variant] = product.variants.nodes;

  if (!variant) {
    throw new Error(`Product ${product.id} has no variants.`);
  }

  return variant;
}

function upsertEnvValue(lines: string[], key: string, value: string): string[] {
  const assignment = `${key}=${value}`;
  const existingIndex = lines.findIndex((line) => line.startsWith(`${key}=`));

  if (existingIndex >= 0) {
    lines[existingIndex] = assignment;
    return lines;
  }

  return [...lines, assignment];
}

async function writeStorefrontEnv(values: {
  shopDomain: string;
  apiVersion: string;
  storefrontToken: string;
}) {
  let lines: string[] = [];

  try {
    lines = (await readFile(STOREFRONT_ENV_PATH, "utf8")).split(/\r?\n/).filter(Boolean);
  } catch {
    lines = [];
  }

  if (!lines.some((line) => line.startsWith("SESSION_SECRET="))) {
    lines = upsertEnvValue(lines, "SESSION_SECRET", randomBytes(16).toString("hex"));
  }

  lines = upsertEnvValue(lines, "PUBLIC_STORE_DOMAIN", values.shopDomain);
  lines = upsertEnvValue(lines, "PUBLIC_STOREFRONT_API_TOKEN", values.storefrontToken);
  lines = upsertEnvValue(lines, "PUBLIC_STOREFRONT_API_VERSION", values.apiVersion);
  lines = upsertEnvValue(lines, "PUBLIC_CHECKOUT_DOMAIN", values.shopDomain);

  await writeFile(STOREFRONT_ENV_PATH, `${lines.join("\n")}\n`);
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
const pimProductId = firstNonBlank(process.env.SHOPIFY_PUBLISH_PIM_PRODUCT_ID) ?? DEFAULT_PIM_PRODUCT_ID;
const variantSku = firstNonBlank(process.env.SHOPIFY_PUBLISH_VARIANT_SKU);
const locationId = firstNonBlank(process.env.SHOPIFY_PUBLISH_LOCATION_ID);
const publicationPattern = firstNonBlank(process.env.SHOPIFY_PUBLISH_PUBLICATION_PATTERN) ?? DEFAULT_PUBLICATION_PATTERN;
const quantity = parsePositiveInteger(process.env.SHOPIFY_PUBLISH_QUANTITY, DEFAULT_QUANTITY);
const shouldCreateStorefrontToken = parseBoolean(process.env.SHOPIFY_CREATE_STOREFRONT_TOKEN);

if (!shopDomain) {
  console.error("SHOPIFY_SHOP_DOMAIN is required. For local CLI mode, .env.agent SHOPIFY_AGENT_SHOP_DOMAIN can be used as a fallback.");
  process.exit(1);
}

if (authMode === "token" && !accessToken) {
  console.error("SHOPIFY_ADMIN_ACCESS_TOKEN is required when SHOPIFY_ADMIN_AUTH_MODE=token. Use SHOPIFY_ADMIN_AUTH_MODE=cli for local Shopify CLI store auth.");
  process.exit(1);
}

try {
  const state = assertNoGraphqlErrors<StateQueryData>(
    await shopifyAdminGraphql(
      STATE_QUERY,
      { identifier: pimProductIdentifier(pimProductId) },
      { shopDomain, accessToken, apiVersion, authMode }
    ),
    "Read product publication state"
  );
  const product = state.productByIdentifier;

  if (!product) {
    throw new Error(`No Shopify product found for PIM product ID ${pimProductId}. Run npm run shopify:project-sample first.`);
  }

  const publication = pickPublication(state.publications.nodes, publicationPattern);
  const variant = pickVariant(product, variantSku);
  const location = pickLocation(state.locations.nodes, variant, locationId);

  const productUpdate = assertNoGraphqlErrors<{
    productUpdate: {
      product: Pick<Product, "id" | "title" | "handle" | "status"> | null;
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    await shopifyAdminGraphql(
      PRODUCT_UPDATE_MUTATION,
      { product: { id: product.id, status: "ACTIVE" } },
      { shopDomain, accessToken, apiVersion, authMode }
    ),
    "Activate sample product"
  );
  assertNoUserErrors(productUpdate.productUpdate.userErrors, "Activate sample product");

  if (!variant.inventoryItem.tracked) {
    const trackingUpdate = assertNoGraphqlErrors<{
      inventoryItemUpdate: {
        userErrors: Array<{ field?: string[] | null; message: string }>;
      };
    }>(
      await shopifyAdminGraphql(
        INVENTORY_ITEM_UPDATE_MUTATION,
        { id: variant.inventoryItem.id, input: { tracked: true } },
        { shopDomain, accessToken, apiVersion, authMode }
      ),
      "Enable inventory tracking"
    );
    assertNoUserErrors(trackingUpdate.inventoryItemUpdate.userErrors, "Enable inventory tracking");
  }

  const existingLevel = variant.inventoryItem.inventoryLevels.nodes
    .find((level) => level.location.id === location.id);

  if (!existingLevel) {
    const inventoryActivation = assertNoGraphqlErrors<{
      inventoryActivate: {
        userErrors: Array<{ field?: string[] | null; message: string }>;
      };
    }>(
      await shopifyAdminGraphql(
        INVENTORY_ACTIVATE_MUTATION,
        { inventoryItemId: variant.inventoryItem.id, locationId: location.id, available: quantity },
        { shopDomain, accessToken, apiVersion, authMode }
      ),
      "Activate inventory at location"
    );
    assertNoUserErrors(inventoryActivation.inventoryActivate.userErrors, "Activate inventory at location");
  } else {
    const inventorySet = assertNoGraphqlErrors<{
      inventorySetQuantities: {
        userErrors: Array<{ field?: string[] | null; message: string }>;
      };
    }>(
      await shopifyAdminGraphql(
        INVENTORY_SET_MUTATION,
        {
          input: {
            name: "available",
            reason: "correction",
            ignoreCompareQuantity: true,
            referenceDocumentUri: `gid://context-architecture-lab/ShopifyPublishSmoke/${pimProductId}`,
            quantities: [
              {
                inventoryItemId: variant.inventoryItem.id,
                locationId: location.id,
                quantity
              }
            ]
          }
        },
        { shopDomain, accessToken, apiVersion, authMode }
      ),
      "Set test inventory"
    );
    assertNoUserErrors(inventorySet.inventorySetQuantities.userErrors, "Set test inventory");
  }

  const publish = assertNoGraphqlErrors<{
    publishablePublish: {
      publishable: {
        availablePublicationsCount?: { count: number };
        resourcePublicationsCount?: { count: number };
      } | null;
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    await shopifyAdminGraphql(
      PUBLISH_MUTATION,
      { id: product.id, input: [{ publicationId: publication.id }] },
      { shopDomain, accessToken, apiVersion, authMode }
    ),
    "Publish sample product"
  );
  assertNoUserErrors(publish.publishablePublish.userErrors, "Publish sample product");

  let storefrontTokenSummary: { created: boolean; scopes: string[] } | undefined;

  if (shouldCreateStorefrontToken) {
    const tokenResult = assertNoGraphqlErrors<{
      storefrontAccessTokenCreate: {
        storefrontAccessToken: {
          accessToken: string;
          accessScopes: Array<{ handle: string }>;
        } | null;
        userErrors: Array<{ field?: string[] | null; message: string }>;
      };
    }>(
      await shopifyAdminGraphql(
        STOREFRONT_TOKEN_CREATE_MUTATION,
        { input: { title: "Context Lab Hydrogen Local" } },
        { shopDomain, accessToken, apiVersion, authMode }
      ),
      "Create Storefront API token"
    );
    assertNoUserErrors(tokenResult.storefrontAccessTokenCreate.userErrors, "Create Storefront API token");

    const token = tokenResult.storefrontAccessTokenCreate.storefrontAccessToken;

    if (!token) {
      throw new Error("Storefront token creation did not return a token.");
    }

    await writeStorefrontEnv({
      shopDomain,
      apiVersion,
      storefrontToken: token.accessToken
    });

    storefrontTokenSummary = {
      created: true,
      scopes: token.accessScopes.map((scope) => scope.handle)
    };
  }

  console.log(JSON.stringify({
    status: "ok",
    shop_domain: shopDomain,
    auth_mode: authMode,
    api_version: apiVersion,
    product: {
      id: product.id,
      title: product.title,
      handle: product.handle,
      status: productUpdate.productUpdate.product?.status ?? "ACTIVE"
    },
    variant: {
      id: variant.id,
      sku: variant.sku,
      inventory_item_id: variant.inventoryItem.id
    },
    test_inventory: {
      location_id: location.id,
      location_name: location.name,
      quantity
    },
    publication: {
      id: publication.id,
      name: publication.name,
      app_title: publication.app?.title ?? null
    },
    storefront_env: storefrontTokenSummary
      ? {
          path: STOREFRONT_ENV_PATH,
          token_written: true,
          token_length: 32,
          scopes: storefrontTokenSummary.scopes
        }
      : {
          path: STOREFRONT_ENV_PATH,
          token_written: false,
          hint: "Set SHOPIFY_CREATE_STOREFRONT_TOKEN=true after granting unauthenticated Storefront scopes, or copy Headless channel values manually."
        }
  }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
