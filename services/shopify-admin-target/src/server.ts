import Fastify from "fastify";
import {
  shopifyProductProjectionSchema,
  shopifyProductRemovalSchema
} from "../../shared/schemas.js";
import {
  DEFAULT_SHOPIFY_API_VERSION,
  METAFIELDS_SET_MUTATION,
  METAFIELD_DEFINITION_CREATE_MUTATION,
  PIM_PRODUCT_ID_DEFINITION_QUERY,
  PRODUCT_BY_IDENTIFIER_QUERY,
  PRODUCT_DELETE_MUTATION,
  PRODUCT_SET_MUTATION,
  buildPimProductIdDefinitionCreateVariables,
  buildPimProductIdDefinitionLookupVariables,
  buildProductArchiveVariables,
  buildProductDeleteVariables,
  buildProductLookupVariables,
  buildProductMetafieldsSetVariables,
  buildProductSetVariables,
  normalizeShopifyAdminAuthMode,
  shopifyAdminGraphql,
  type ShopifyAdminAuthMode,
  type ShopifyDeleteMode
} from "../../shared/shopify-admin-target.js";

type BuildAppOptions = {
  shopDomain?: string;
  accessToken?: string;
  apiVersion?: string;
  authMode?: ShopifyAdminAuthMode;
  deleteMode?: ShopifyDeleteMode;
  graphql?: (query: string, variables: unknown) => Promise<unknown>;
};

type ShopifyUserError = {
  field?: string[] | null;
  message: string;
};

type ProductNode = {
  id: string;
  handle?: string;
  title?: string;
  status?: string;
};

type MetafieldDefinitionNode = {
  id: string;
  capabilities?: {
    uniqueValues?: {
      enabled?: boolean;
    };
  };
};

function configError() {
  return {
    status: "rejected",
    error: {
      code: "SHOPIFY_CONFIG_MISSING",
      message: "SHOPIFY_SHOP_DOMAIN is required. SHOPIFY_ADMIN_ACCESS_TOKEN is required when SHOPIFY_ADMIN_AUTH_MODE=token."
    }
  };
}

function userErrorsFrom(value: unknown): ShopifyUserError[] {
  if (
    value
    && typeof value === "object"
    && "userErrors" in value
    && Array.isArray(value.userErrors)
  ) {
    return value.userErrors.filter((error): error is ShopifyUserError => (
      Boolean(error) && typeof error === "object" && "message" in error
    ));
  }

  return [];
}

function productFrom(value: unknown): ProductNode | null {
  if (
    value
    && typeof value === "object"
    && "id" in value
    && typeof value.id === "string"
  ) {
    return value as ProductNode;
  }

  return null;
}

function definitionNodesFrom(value: unknown): MetafieldDefinitionNode[] {
  if (!value || typeof value !== "object" || !("data" in value)) {
    return [];
  }

  const data = (value as { data?: unknown }).data;
  if (!data || typeof data !== "object" || !("metafieldDefinitions" in data)) {
    return [];
  }

  const connection = (data as { metafieldDefinitions?: unknown }).metafieldDefinitions;
  if (!connection || typeof connection !== "object" || !("nodes" in connection)) {
    return [];
  }

  const nodes = (connection as { nodes?: unknown }).nodes;
  if (!Array.isArray(nodes)) {
    return [];
  }

  return nodes.filter((node): node is MetafieldDefinitionNode => (
    Boolean(node) && typeof node === "object" && "id" in node
  ));
}

function rootObject(value: unknown, key: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || !("data" in value)) {
    return {};
  }

  const data = (value as { data?: unknown }).data;
  if (!data || typeof data !== "object" || !(key in data)) {
    return {};
  }

  const root = (data as Record<string, unknown>)[key];
  return root && typeof root === "object" ? root as Record<string, unknown> : {};
}

function graphQLErrors(value: unknown): unknown[] {
  if (
    value
    && typeof value === "object"
    && "errors" in value
    && Array.isArray(value.errors)
  ) {
    return value.errors;
  }

  return [];
}

async function ensurePimProductIdDefinition(
  graphql: (query: string, variables: unknown) => Promise<unknown>
): Promise<ShopifyUserError[]> {
  const lookupBody = await graphql(
    PIM_PRODUCT_ID_DEFINITION_QUERY,
    buildPimProductIdDefinitionLookupVariables()
  );
  const existingDefinition = definitionNodesFrom(lookupBody)[0];

  if (existingDefinition) {
    if (existingDefinition.capabilities?.uniqueValues?.enabled) {
      return [];
    }

    return [
      {
        field: ["pim", "external_id"],
        message: "Existing Shopify metafield definition pim.external_id must enable unique values before productSet customId upserts can run."
      }
    ];
  }

  const createBody = await graphql(
    METAFIELD_DEFINITION_CREATE_MUTATION,
    buildPimProductIdDefinitionCreateVariables()
  );
  const createErrors = graphQLErrors(createBody);
  const userErrors = userErrorsFrom(rootObject(createBody, "metafieldDefinitionCreate"));

  return createErrors.length > 0
    ? [
      ...userErrors,
      ...createErrors.map((error) => ({
        message: JSON.stringify(error)
      }))
    ]
    : userErrors;
}

export function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: true });
  const shopDomain = options.shopDomain ?? process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = options.accessToken ?? process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const apiVersion = options.apiVersion ?? process.env.SHOPIFY_API_VERSION ?? DEFAULT_SHOPIFY_API_VERSION;
  const authMode = options.authMode ?? normalizeShopifyAdminAuthMode(process.env.SHOPIFY_ADMIN_AUTH_MODE);
  const deleteMode = options.deleteMode ?? (
    process.env.SHOPIFY_DELETE_MODE === "permanent" ? "permanent" : "archive"
  );

  const configured = Boolean(shopDomain && (authMode === "cli" || accessToken));
  let pimProductIdDefinitionEnsured = false;
  const graphql = options.graphql ?? (async (query: string, variables: unknown) => {
    if (!shopDomain || (authMode === "token" && !accessToken)) {
      throw new Error("Shopify target is not configured.");
    }

    return shopifyAdminGraphql(query, variables, {
      shopDomain,
      accessToken,
      apiVersion,
      authMode
    });
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "shopify-admin-target",
    configured,
    api_version: apiVersion,
    auth_mode: authMode,
    delete_mode: deleteMode
  }));

  app.post("/products/projections", async (request, reply) => {
    const parsed = shopifyProductProjectionSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: "rejected",
        errors: parsed.error.issues
      });
    }

    if (!configured) {
      return reply.code(503).send(configError());
    }

    if (!pimProductIdDefinitionEnsured) {
      const definitionErrors = await ensurePimProductIdDefinition(graphql);

      if (definitionErrors.length > 0) {
        return reply.code(502).send({
          status: "rejected",
          target: "shopify-dev-store",
          user_errors: definitionErrors
        });
      }

      pimProductIdDefinitionEnsured = true;
    }

    const body = await graphql(PRODUCT_SET_MUTATION, buildProductSetVariables(parsed.data));
    const errors = graphQLErrors(body);
    const productSet = rootObject(body, "productSet");
    const userErrors = userErrorsFrom(productSet);

    if (errors.length > 0 || userErrors.length > 0) {
      return reply.code(502).send({
        status: "rejected",
        target: "shopify-dev-store",
        errors,
        user_errors: userErrors
      });
    }

    const product = productFrom(productSet.product);

    if (product) {
      const metafieldsBody = await graphql(
        METAFIELDS_SET_MUTATION,
        buildProductMetafieldsSetVariables(parsed.data, product.id)
      );
      const metafieldsSet = rootObject(metafieldsBody, "metafieldsSet");
      const metafieldsUserErrors = userErrorsFrom(metafieldsSet);
      const metafieldsErrors = graphQLErrors(metafieldsBody);

      if (metafieldsErrors.length > 0 || metafieldsUserErrors.length > 0) {
        return reply.code(502).send({
          status: "rejected",
          target: "shopify-dev-store",
          errors: metafieldsErrors,
          user_errors: metafieldsUserErrors
        });
      }
    }

    return reply.code(200).send({
      status: "accepted",
      target: "shopify-dev-store",
      operation: "upsert",
      projection_id: parsed.data.projection_id,
      shopify_product_id: product?.id,
      handle: product?.handle
    });
  });

  app.post("/products/removals", async (request, reply) => {
    const parsed = shopifyProductRemovalSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: "rejected",
        errors: parsed.error.issues
      });
    }

    if (!configured) {
      return reply.code(503).send(configError());
    }

    const lookupBody = await graphql(PRODUCT_BY_IDENTIFIER_QUERY, buildProductLookupVariables(parsed.data));
    const lookupErrors = graphQLErrors(lookupBody);

    if (lookupErrors.length > 0) {
      return reply.code(502).send({
        status: "rejected",
        target: "shopify-dev-store",
        errors: lookupErrors
      });
    }

    const product = productFrom(rootObject(lookupBody, "productByIdentifier"));

    if (!product) {
      return reply.code(200).send({
        status: "accepted",
        target: "shopify-dev-store",
        operation: "noop",
        projection_id: parsed.data.projection_id
      });
    }

    if (deleteMode === "permanent") {
      const deleteBody = await graphql(PRODUCT_DELETE_MUTATION, buildProductDeleteVariables(product.id));
      const productDelete = rootObject(deleteBody, "productDelete");
      const userErrors = userErrorsFrom(productDelete);
      const errors = graphQLErrors(deleteBody);

      if (errors.length > 0 || userErrors.length > 0) {
        return reply.code(502).send({
          status: "rejected",
          target: "shopify-dev-store",
          errors,
          user_errors: userErrors
        });
      }

      return reply.code(200).send({
        status: "accepted",
        target: "shopify-dev-store",
        operation: "delete",
        projection_id: parsed.data.projection_id,
        shopify_product_id: product.id
      });
    }

    const archiveBody = await graphql(PRODUCT_SET_MUTATION, buildProductArchiveVariables(parsed.data));
    const productSet = rootObject(archiveBody, "productSet");
    const userErrors = userErrorsFrom(productSet);
    const errors = graphQLErrors(archiveBody);

    if (errors.length > 0 || userErrors.length > 0) {
      return reply.code(502).send({
        status: "rejected",
        target: "shopify-dev-store",
        errors,
        user_errors: userErrors
      });
    }

    return reply.code(200).send({
      status: "accepted",
      target: "shopify-dev-store",
      operation: "archive",
      projection_id: parsed.data.projection_id,
      shopify_product_id: product.id
    });
  });

  return app;
}

export async function start() {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 8088);
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen({ port, host });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
