import { describe, expect, it } from "vitest";
import sampleProjection from "../../../examples/products/shopify-rug-projection.sample.json" with { type: "json" };
import {
  METAFIELDS_SET_MUTATION,
  METAFIELD_DEFINITION_CREATE_MUTATION,
  PIM_PRODUCT_ID_DEFINITION_QUERY,
  PRODUCT_SET_MUTATION,
  buildShopifyStoreExecuteArgs,
  buildProductMetafieldsSetVariables,
  buildProductSetVariables,
  normalizeShopDomain,
  normalizeShopifyAdminAuthMode,
  shopifyGraphqlEndpoint
} from "../../shared/shopify-admin-target.js";
import { shopifyProductProjectionSchema } from "../../shared/schemas.js";
import { buildApp } from "./server.js";

describe("Shopify Admin target", () => {
  it("maps a rug projection to a Shopify productSet input", () => {
    const projection = shopifyProductProjectionSchema.parse(sampleProjection);
    const variables = buildProductSetVariables(projection);

    expect(variables.identifier).toEqual({
      customId: {
        namespace: "pim",
        key: "external_id",
        value: "pim-rug-atlas-sand"
      }
    });
    expect(variables.input).toMatchObject({
      title: "Atlas Wool Rug",
      handle: "atlas-wool-rug-sand",
      vendor: "Context Home",
      productType: "Rug",
      status: "DRAFT"
    });
    expect(variables.input.productOptions).toHaveLength(2);
    expect(variables.input.variants[0]).toMatchObject({
      sku: "RUG-ATLAS-170X240-SAND",
      price: "349"
    });
    expect(variables.input).not.toHaveProperty("metafields");

    const metafieldsVariables = buildProductMetafieldsSetVariables(
      projection,
      "gid://shopify/Product/123"
    );
    expect(metafieldsVariables.metafields[0]).toMatchObject({
      ownerId: "gid://shopify/Product/123",
      namespace: "pim",
      key: "product_id",
      value: "pim-rug-atlas-sand"
    });
  });

  it("normalizes Shopify Admin GraphQL endpoint configuration", () => {
    expect(normalizeShopDomain("https://demo-shop.myshopify.com/admin")).toBe("demo-shop.myshopify.com");
    expect(shopifyGraphqlEndpoint("demo-shop.myshopify.com", "2026-04")).toBe(
      "https://demo-shop.myshopify.com/admin/api/2026-04/graphql.json"
    );
    expect(normalizeShopifyAdminAuthMode("cli")).toBe("cli");
    expect(normalizeShopifyAdminAuthMode(undefined)).toBe("token");
  });

  it("builds Shopify CLI store execute args for local development auth", () => {
    const args = buildShopifyStoreExecuteArgs(
      "https://demo-shop.myshopify.com/admin",
      "2026-04",
      PRODUCT_SET_MUTATION,
      { input: { title: "Atlas Wool Rug" } }
    );

    expect(args).toEqual(expect.arrayContaining([
      "store",
      "execute",
      "--store",
      "demo-shop.myshopify.com",
      "--json",
      "--no-color",
      "--version",
      "2026-04",
      "--allow-mutations"
    ]));
    expect(args).not.toContain("test-token");
  });

  it("upserts a projection through the injected GraphQL client", async () => {
    const calls: Array<{ query: string; variables: unknown }> = [];
    const app = buildApp({
      shopDomain: "demo-shop.myshopify.com",
      accessToken: "test-token",
      graphql: async (query, variables) => {
        calls.push({ query, variables });
        if (query === PIM_PRODUCT_ID_DEFINITION_QUERY) {
          return {
            data: {
              metafieldDefinitions: {
                nodes: []
              }
            }
          };
        }

        if (query === METAFIELD_DEFINITION_CREATE_MUTATION) {
          return {
            data: {
              metafieldDefinitionCreate: {
                createdDefinition: {
                  id: "gid://shopify/MetafieldDefinition/123"
                },
                userErrors: []
              }
            }
          };
        }

        if (query === METAFIELDS_SET_MUTATION) {
          return {
            data: {
              metafieldsSet: {
                metafields: [],
                userErrors: []
              }
            }
          };
        }

        return {
          data: {
            productSet: {
              product: {
                id: "gid://shopify/Product/123",
                handle: "atlas-wool-rug-sand",
                title: "Atlas Wool Rug",
                status: "DRAFT"
              },
              userErrors: []
            }
          }
        };
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/products/projections",
      payload: sampleProjection
    });

    expect(response.statusCode).toBe(200);
    expect(calls.map((call) => call.query)).toEqual([
      PIM_PRODUCT_ID_DEFINITION_QUERY,
      METAFIELD_DEFINITION_CREATE_MUTATION,
      PRODUCT_SET_MUTATION,
      METAFIELDS_SET_MUTATION
    ]);
    expect(JSON.parse(response.body)).toMatchObject({
      status: "accepted",
      operation: "upsert",
      shopify_product_id: "gid://shopify/Product/123"
    });
  });

  it("allows CLI auth mode without a runtime Admin token", async () => {
    const app = buildApp({
      shopDomain: "demo-shop.myshopify.com",
      authMode: "cli",
      graphql: async () => ({
        data: {
          productSet: {
            product: {
              id: "gid://shopify/Product/456",
              handle: "atlas-wool-rug-sand",
              title: "Atlas Wool Rug",
              status: "DRAFT"
            },
            userErrors: []
          }
        }
      })
    });

    const health = await app.inject({
      method: "GET",
      url: "/health"
    });

    expect(JSON.parse(health.body)).toMatchObject({
      configured: true,
      auth_mode: "cli"
    });
  });
});
