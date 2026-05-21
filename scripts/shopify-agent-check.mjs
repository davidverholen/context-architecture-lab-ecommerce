import { shopifyGraphql } from "../mcp/shopify-admin/lib.mjs";

try {
  const result = await shopifyGraphql(`
    query AgentConnectionCheck {
      shop {
        name
        myshopifyDomain
      }
    }
  `);

  if (!result.ok || result.body.errors) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({
    status: "ok",
    shop_domain: result.body.data.shop.myshopifyDomain,
    shop_name: result.body.data.shop.name,
    api_version: result.apiVersion
  }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
