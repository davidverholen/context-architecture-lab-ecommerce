# Custom Services Boundaries

Custom Node.js/TypeScript services own behavior that must be testable, versioned, and reviewable.

Current MVP services:

- `commerce-integration-service`: validates Shopify order-created samples and maps them to canonical and mock WMS order contracts.
- `mock-wms`: validates mock WMS orders and returns deterministic acceptance or `SKU_MAPPING_MISSING`.
- `mock-pim`: returns governed rug product fixture data.
- `governance-service`: classifies change requests and returns review gate decisions.
- `akeneo-event-bridge`: receives local Akeneo webhook envelopes, ignores non-rug events, normalizes rug product events, and forwards them to n8n.
- `product-projection-service`: validate Akeneo export payloads, map governed PIM products to Shopify projection contracts, classify projection failures, and preserve idempotency/audit context.
- `mock-shopify`: receive Shopify projection payloads as local dumps and remove dumps for removal commands.
- `shopify-admin-target`: optional live Shopify Admin GraphQL adapter for create/update upserts and removal handling.

Belongs in services:

- Schema validation.
- Domain mapping.
- Idempotency.
- Audit records.
- Complex error handling.
- Stable API contracts.
- Credential boundary isolation.
- Health endpoints and container readiness.

Belongs in n8n:

- Workflow orchestration.
- Visual integration steps.
- Calls between systems.
- Simple failure paths.

When in doubt, put durable business logic in a service and keep n8n readable.

All custom services expose `GET /health`, listen on `process.env.PORT`, and own a service-specific Dockerfile so each deployable image has the correct default command.

`shopify-admin-target` is intentionally separate from `product-projection-service`: projection mapping remains a domain concern, while Shopify Admin GraphQL calls and token handling remain an adapter concern. Optional repo-local agent access in [Shopify Admin Agent Access](shopify-admin-agent-access.md) is an operator tool, not a runtime service boundary or product sync path.
