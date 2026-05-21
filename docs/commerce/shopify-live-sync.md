# Shopify Live Sync

This page describes the optional live Shopify target for the Akeneo product projection flow.

Live Shopify sync is a development-store projection target. It does not make Shopify the product master.

Hydrogen storefront work, governed by [Hydrogen Storefront](hydrogen-storefront.md) and [ADR-007](../decisions/ADR-007-hydrogen-storefront-boundary.md), consumes the Shopify projection through Storefront API patterns. It must not bypass this adapter for Admin API product writes.

Repo-local operator access to Shopify Admin GraphQL is governed separately by [Shopify Admin Agent Access](shopify-admin-agent-access.md). It is not the runtime sync path and must not become autonomous product projection.

## Runtime Path

```mermaid
flowchart LR
  Akeneo["Akeneo CE"]
  Bridge["akeneo-event-bridge"]
  N8N["n8n product workflow"]
  Projection["product-projection-service"]
  Mock["mock-shopify"]
  ShopifyTarget["shopify-admin-target"]
  Shopify["Shopify Basic / Dev Shop"]

  Akeneo -->|"product create/update/remove"| Bridge
  Bridge -->|"normalized export contract"| N8N
  N8N -->|"POST /products/akeneo-events"| Projection
  Projection -->|"default local target"| Mock
  Projection -. "opt-in live target" .-> ShopifyTarget
  ShopifyTarget -->|"Admin GraphQL"| Shopify
```

## Target Modes

Default local mode:

- `PRODUCT_PROJECTION_TARGET=mock-shopify`
- `PRODUCT_TARGET_URL=http://mock-shopify:8087`

Live Shopify mode:

- `PRODUCT_PROJECTION_TARGET=shopify-dev-store`
- `PRODUCT_TARGET_URL=http://shopify-admin-target:8088`
- Compose profile: `shopify-live`

Local adapter auth modes:

- `SHOPIFY_ADMIN_AUTH_MODE=token`: default runtime mode using `SHOPIFY_ADMIN_ACCESS_TOKEN`.
- `SHOPIFY_ADMIN_AUTH_MODE=cli`: local development mode using a prior `shopify store auth` session on the developer machine. Use this only for local operator-approved smoke tests; do not treat CLI login as production runtime credentials.

## Shopify Credentials

Put real values only in a private `.env` file:

```sh
SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
SHOPIFY_ADMIN_AUTH_MODE=token
SHOPIFY_ADMIN_ACCESS_TOKEN=<private-shopify-admin-token>
SHOPIFY_API_VERSION=2026-04
SHOPIFY_DELETE_MODE=archive
```

Do not commit credentials, generated tokens, screenshots containing tokens, or n8n credential exports.

## Agent / Architect Access

Agent or operator Shopify access is separate from runtime sync credentials.

Use [Shopify Admin Agent Access](shopify-admin-agent-access.md) with ignored `.env.agent`:

```sh
SHOPIFY_AGENT_SHOP_DOMAIN=your-shop.myshopify.com
SHOPIFY_AGENT_ADMIN_ACCESS_TOKEN=<private-shopify-agent-token>
SHOPIFY_AGENT_API_VERSION=2026-04
```

This lets an agent inspect or prepare the shop through explicit tools without putting personal admin login credentials in the project or reusing the runtime pipeline token.

## Create / Update Behavior

Create and update events are treated as upserts.

The live adapter uses Shopify Admin GraphQL `productSet` and identifies projected products by the PIM product ID stored as a custom metafield:

- namespace: `pim`
- key: `external_id`
- value: the repo projection `pim_product_id`

This custom ID metafield uses Shopify metafield type `id` with unique values enabled. Additional projection metadata is written after the product upsert with `metafieldsSet`, including a human-readable `pim.product_id` metafield, `context_architecture.projection_id`, `context_architecture.metaobjects_json`, and simple detail metafields.

Native Shopify fields are populated from the governed projection:

- title
- handle
- vendor
- product type
- description
- status
- product options for size and color
- variants for sellable SKU differences

Simple product attributes are sent as metafields. Reusable concepts that are modeled as local `metaobjects` are preserved as JSON in the first live adapter pass. Real Shopify metaobject definition setup is a separate design step.

## Delete Behavior

Akeneo removal events become Shopify removal commands.

Default behavior is archive:

```sh
SHOPIFY_DELETE_MODE=archive
```

Permanent deletion is available only by explicit opt-in:

```sh
SHOPIFY_DELETE_MODE=permanent
```

Use permanent deletion only for disposable development data. Product deletion is irreversible in Shopify.

## Run Locally

After filling private `.env` values:

```sh
PRODUCT_PROJECTION_TARGET=shopify-dev-store \
PRODUCT_TARGET_URL=http://shopify-admin-target:8088 \
docker compose --profile shopify-live up -d --build shopify-admin-target product-projection-service
```

Then trigger an Akeneo product update:

```sh
npm run akeneo:seed-rug
```

The active n8n workflow continues to call `product-projection-service`; the projection service chooses the target through environment configuration.

For a host-local smoke test that uses the Akeneo sample event, the projection service, the live adapter, and Shopify CLI store auth without starting Docker Compose:

```sh
npm run shopify:project-sample
```

The command reads private `.env` values first and can fall back to ignored `.env.agent` store/auth settings for local CLI mode.

## Required Review

Live Shopify changes require product projection review because they affect customer-facing commerce data. Deletion behavior also requires explicit review because it can remove products from the shop.
