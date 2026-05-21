# Context Architecture Commerce Lab

This repository is a local Codex-native architecture demo based on the Context Architecture whitepaper. It shows how agentic development can be governed in an enterprise commerce integration setting by making context, boundaries, durable memory, review gates, and source authority explicit.

This is not a full enterprise commerce platform. It does not implement Patchworks, Cloud Run deployment, Paperclip Teams, RAG, production Shopify sync, checkout customization, or customer account behavior in MVP v0.1. Akeneo CE, live Shopify sync, and Hydrogen are introduced only as optional local/dev-store boundaries behind documented review gates. The lab models enterprise decision boundaries with enough runnable structure to make those boundaries testable.

## MVP Scope

MVP v0.1 provides:

- Curated Markdown memory under `docs/`.
- Raw and external source references under `sources/`.
- `AGENTS.md` instructions for Codex and other agents.
- Repo-scoped Codex skills under `.agents/skills/`.
- ADRs for scope, projection, integration, and governance decisions.
- JSON Schemas and rug/home-textile examples validated with Ajv.
- Minimal Node.js/TypeScript service implementations with Fastify, Zod, Vitest, Docker readiness, and `/health`.
- A local Docker Compose stack with n8n, Postgres, and the MVP services.
- Local n8n workflow skeletons for order fulfillment and product projection.
- Optional local Akeneo CE webhook flow through `akeneo-event-bridge`, n8n, `product-projection-service`, and `mock-shopify`.
- Optional live Shopify Admin target adapter for a development/basic shop, configured only through private environment variables.
- Optional Shopify Admin MCP helper for explicit operator/agent inspection, configured only through ignored `.env.agent`.
- Optional Hydrogen storefront scaffold under [apps/storefront](apps/storefront/) for customer-facing Storefront API consumption, governed by [ADR-007](docs/decisions/ADR-007-hydrogen-storefront-boundary.md).

## Context Architecture Model

The lab applies stable whitepaper concepts without copying long passages into local docs:

- Use bounded contexts instead of one global prompt.
- Use minimum needed context for each task.
- Treat curated docs, ADRs, schemas, and examples as durable memory.
- Use handoff protocols when work crosses boundaries.
- Route implementation learnings back into docs and checklists.
- Keep review and governance gates visible for high-risk changes.

The copied whitepaper lives at [sources/paper/context-architecture-whitepaper.md](sources/paper/context-architecture-whitepaper.md).

## Commerce Architecture Model

The commerce model is intentionally small:

- Shopify is the customer-facing commerce projection, not the product data master.
- Hydrogen is the optional customer-facing storefront read boundary over Shopify; it does not own Admin API writes.
- Akeneo/PIM represents product data governance and enrichment through mock data and optional local Akeneo CE setup.
- n8n is a visible local workflow layer and learning stand-in for commerce iPaaS patterns.
- Custom Node.js/TypeScript services own domain logic, validation, idempotency, auditability, and testable boundaries.
- Product projection flows move Akeneo product changes through `akeneo-event-bridge`, n8n, and `product-projection-service` into either a local `mock-shopify` dump target or optional `shopify-admin-target`.
- Mock WMS represents fulfillment integration.
- Google Cloud Run is deferred, but services should be container-ready and expose health endpoints.
- GitHub Markdown docs act as curated durable memory for agentic development.

## Local Development

The local setup is Docker-based and intentionally does not require Shopify credentials or real secrets.

For an architecture map of the repository, start with [docs/overview/index.md](docs/overview/index.md).

Install dependencies and run checks:

```sh
npm install
npm run validate:schemas
npm test
docker compose config
```

Start the local stack:

```sh
docker compose up --build
```

Local services:

- n8n: `http://localhost:5678`
- Commerce integration service: `http://localhost:8082`
- Mock WMS: `http://localhost:8083`
- Mock PIM: `http://localhost:8084`
- Governance service: `http://localhost:8085`
- Product projection service: `http://localhost:8086`
- Mock Shopify dump target: `http://localhost:8087`
- Shopify Admin target adapter: `http://localhost:8088` when profile `shopify-live` is enabled
- Akeneo event bridge: `http://localhost:8090`

Implemented MVP endpoints:

- `GET /health` on each custom service.
- `POST /orders/shopify-created` on `commerce-integration-service`.
- `POST /orders` on `mock-wms`.
- `GET /products` and `GET /products/:sku` on `mock-pim`.
- `POST /changes/classify` on `governance-service`.
- `POST /products/akeneo-events` on `product-projection-service`.
- `POST /products/projections` on `mock-shopify`.
- `POST /products/removals` on `mock-shopify`.
- `POST /products/projections` and `POST /products/removals` on `shopify-admin-target`.
- `POST /akeneo/events` on `akeneo-event-bridge`.

The custom services listen on `process.env.PORT` and use local Docker Compose ports for development. They are container-ready and Cloud-Run-ready, but this repository does not deploy them to Cloud Run in MVP v0.1.

Example local request:

```sh
curl -X POST http://localhost:8082/orders/shopify-created \
  -H 'content-type: application/json' \
  --data @examples/orders/shopify-order-created.sample.json
```

Optional Akeneo CE local setup is documented in [docs/commerce/akeneo-local-setup.md](docs/commerce/akeneo-local-setup.md) and the [Akeneo integration boundary](integrations/akeneo/README.md). It creates a generated Akeneo project under ignored `.local/akeneo/pim/` and is not part of the default stack.

Start the optional Akeneo-to-mock-Shopify event flow:

```sh
npm run akeneo:demo-up
```

This starts Akeneo CE, activates the n8n product workflow, configures the local Akeneo webhook subscription to `akeneo-event-bridge`, starts the Akeneo webhook worker, seeds/updates the rug product, and writes the resulting mock Shopify projection under `.local/mock-shopify-dumps/`.

Optional live Shopify sync is documented in [docs/commerce/shopify-live-sync.md](docs/commerce/shopify-live-sync.md). Keep `mock-shopify` as the default target unless you intentionally set private Shopify credentials and enable the `shopify-live` Compose profile.

Optional operator access to Shopify Admin GraphQL is documented in [docs/commerce/shopify-admin-agent-access.md](docs/commerce/shopify-admin-agent-access.md). Use `.env.agent`, not `.env`, and treat mutations as review-gated product projection work.

Optional Hydrogen storefront scope is documented in [docs/commerce/hydrogen-storefront.md](docs/commerce/hydrogen-storefront.md). The local scaffold lives in [apps/storefront](apps/storefront/), keeps Storefront API tokens outside source control, and must not perform Shopify Admin API product writes.

Run the optional local Hydrogen storefront:

```sh
npm run storefront:dev
```

Run the approved dev-shop sample publication smoke path after expanded Shopify CLI scopes are granted:

```sh
npm run shopify:publish-sample
```

Example local product projection request:

```sh
curl -X POST http://localhost:8086/products/akeneo-events \
  -H 'content-type: application/json' \
  --data @examples/products/akeneo-rug-updated-event.sample.json
```

## Cloud Run Readiness

Cloud Run deployment is deferred. Readiness notes and future deployment TODOs live in [docs/deployment/cloud-run-notes.md](docs/deployment/cloud-run-notes.md).

Current readiness means each custom service owns a service-specific Dockerfile, builds as a container, runs without committed secrets, listens on `process.env.PORT`, binds to `0.0.0.0`, exposes `GET /health`, and logs to stdout/stderr. It does not mean a GCP project, Artifact Registry, service account, secret strategy, or Cloud Run service has been created.

## Future Extensions

- Shopify Dev Store integration hardening: credential check script, idempotency store, metaobject lifecycle, and safer operator controls.
- Hydrogen storefront hardening behind ADR-007, including real Storefront token setup, publication behavior, and checkout/customer-data review.
- Google Cloud Run deployment.
- More complete Akeneo rug catalog seed data and webhook reconciliation.
- Paperclip Teams as an optional governance and coordination layer.
- RAG over curated project memory after boundaries and source authority are stable.
