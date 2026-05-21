import { describe, expect, it } from "vitest";
import sampleProjection from "../../../examples/products/shopify-rug-projection.sample.json" with { type: "json" };
import {
  PRODUCT_SET_MUTATION,
  buildProductSetVariables,
  normalizeShopDomain,
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
        key: "product_id",
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
  });

  it("normalizes Shopify Admin GraphQL endpoint configuration", () => {
    expect(normalizeShopDomain("https://demo-shop.myshopify.com/admin")).toBe("demo-shop.myshopify.com");
    expect(shopifyGraphqlEndpoint("demo-shop.myshopify.com", "2026-04")).toBe(
      "https://demo-shop.myshopify.com/admin/api/2026-04/graphql.json"
    );
  });

  it("upserts a projection through the injected GraphQL client", async () => {
    const calls: Array<{ query: string; variables: unknown }> = [];
    const app = buildApp({
      shopDomain: "demo-shop.myshopify.com",
      accessToken: "test-token",
      graphql: async (query, variables) => {
        calls.push({ query, variables });
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
    expect(calls[0]?.query).toBe(PRODUCT_SET_MUTATION);
    expect(JSON.parse(response.body)).toMatchObject({
      status: "accepted",
      operation: "upsert",
      shopify_product_id: "gid://shopify/Product/123"
    });
  });
});
