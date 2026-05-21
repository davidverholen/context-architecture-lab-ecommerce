# Shopify Admin MCP

This repo-local MCP server gives Codex an operator/architect interface to a Shopify shop without reusing the project runtime token.

It is intentionally separate from `.env`:

- Project runtime sync uses `SHOPIFY_ADMIN_ACCESS_TOKEN` in `.env`.
- Agent/operator access uses `SHOPIFY_AGENT_ADMIN_ACCESS_TOKEN` in ignored `.env.agent`.

## Credentials

Create a local file:

```sh
cp .env.agent.example .env.agent
```

Fill:

```sh
SHOPIFY_AGENT_SHOP_DOMAIN=your-shop.myshopify.com
SHOPIFY_AGENT_ADMIN_ACCESS_TOKEN=<private-shopify-agent-token>
SHOPIFY_AGENT_API_VERSION=2026-04
```

Do not commit `.env.agent`.

## Minimum Scopes

For inspection and product setup:

- `read_products`
- `write_products`

For later real metaobject lifecycle work:

- `read_metaobject_definitions`
- `write_metaobject_definitions`
- `read_metaobjects`
- `write_metaobjects`

Keep the token shop-scoped and rotate it if it is exposed.

## Codex MCP Registration

This server can be registered with Codex:

```sh
codex mcp add shopifyAdmin -- node /home/dave/src/context-architecture-lab-ecommerce/mcp/shopify-admin/server.mjs
```

Check:

```sh
codex mcp list
```

Restart the Codex session after adding the server so the tool list refreshes.

## Tools

- `shopify_check_connection`: verifies shop access without exposing the token.
- `shopify_list_products`: reads a small product sample.
- `shopify_graphql`: runs explicit Admin GraphQL queries or mutations.

Destructive writes must still go through review. Akeneo/PIM remains product master, and Shopify remains the commerce projection. See [Shopify Admin Agent Access](../../docs/commerce/shopify-admin-agent-access.md) for the durable boundary rules.

## Local Check Without MCP

```sh
npm run shopify:agent-check
```
