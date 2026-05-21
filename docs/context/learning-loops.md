# Learning Loops

Implementation should feed learning back into curated memory.

Use this loop for review findings, handoff outcomes, incidents, repeated mistakes, evaluation findings, schema validation failures, and implementation discoveries:

1. Observe a repeated mistake, integration failure, unclear boundary, useful pattern, or governance gap.
2. Classify the affected context and owner.
3. Identify the source signal: ADR, review note, handoff, incident, retrospective, evaluation, test, schema validation, or implementation result.
4. Interpret what the signal means and whether the lesson is local or shared.
5. Decide whether the learning belongs in docs, an ADR, a schema, an example, a checklist, a handoff protocol, or proposed `AGENTS.md` diff.
6. Preserve uncertainty if the evidence is incomplete.
7. Add or update tests when the learning affects executable behavior.
8. Review the memory update with the same care as code.
9. Add a later check when the change is meant to reduce repeated failures.

Learning is not a license to silently change project principles. Stable new rules should be proposed clearly.

Run `npm run context:check` after promoting a learning into durable memory. Use `npm run context:full` when the learning also touches schemas, examples, services, or workflows.

## Routing Outcomes

A learning signal may:

- Stay local to the owning context.
- Update curated docs.
- Create or revise an ADR.
- Change a schema, example, checklist, or validation script.
- Change a handoff protocol or review gate.
- Become an open question.
- Produce a proposed `AGENTS.md` diff for durable agent instructions.

## Current Curated Learnings

### Akeneo CE Event-Shaped Local Flow

Source signal: official Akeneo Event Platform source check plus local product projection implementation.

Learning: Akeneo CE is useful as a local PIM source, but local CE product update payloads must be documented as event-shaped project contracts. They must not be treated as official Akeneo Event Platform support unless official Akeneo docs for the target edition confirm it.

Routing outcome:

- Durable rule added to [AGENTS.md](../../AGENTS.md).
- Source authority recorded in [Akeneo Sources](../../sources/external/akeneo/README.md).
- Product export interpretation updated in [Product Export Flow](../commerce/product-export-flow.md).
- Open question preserved in [Open Questions](open-questions.md).

### Production Build Should Exclude Test Fixtures

Source signal: Docker build failed when TypeScript production build included test files that import sample JSON outside the Docker build context.

Learning: service images should compile runtime code only. Tests may use examples and fixtures, but production container builds should not depend on test-only imports.

Routing outcome:

- `tsconfig.json` excludes `*.test.ts` from the production build.
- Vitest remains the test runner for test files.
- Docker build validated for `product-projection-service` and `mock-shopify`.

### n8n Workflow JSON Needs A Repo Lifecycle

Source signal: agent-driven development question about whether n8n workflows can be created and maintained cleanly.

Learning: n8n is useful as a visible local workflow layer, but the repository should treat workflow JSON as the reviewable source artifact and provide commands for validation, import, and export.

Routing outcome:

- `npm run n8n:validate` validates tracked workflow JSON.
- `npm run n8n:import` waits for the local n8n health endpoint, then imports tracked workflows into the local instance.
- `npm run n8n:export` exports local workflows to ignored `.local/n8n-export/workflows/` for review.
- Repo workflow JSON keeps stable top-level workflow IDs to make repeated local imports deterministic.

### Akeneo CE Webhooks Need A Local Adapter

Source signal: introducing a real local Akeneo CE event flow produced all product events from the local PIM, including demo products outside the rug projection scope.

Learning: Akeneo should not call the projection workflow directly. A boundary adapter should receive Akeneo webhook envelopes, ignore out-of-scope product families, normalize in-scope rug events to the repo export contract, and then forward to n8n.

Routing outcome:

- `akeneo-event-bridge` owns webhook envelope adaptation.
- n8n remains visible orchestration.
- `product-projection-service` remains the durable mapping boundary.
- Non-rug Akeneo product events are acknowledged and ignored for this lab scope.

### Live Shopify Needs A Target Adapter

Source signal: adding a real Shopify shop to the Akeneo product projection path.

Learning: live Shopify writes should not be added directly to n8n or the projection mapping service. Shopify Admin GraphQL behavior, credentials, delete policy, and API versioning need their own adapter boundary so the rest of the flow remains testable with `mock-shopify`.

Routing outcome:

- `shopify-admin-target` owns live Admin GraphQL calls.
- `product-projection-service` targets either `mock-shopify` or `shopify-admin-target` through configuration.
- Akeneo removal events archive Shopify products by default.
- Official Shopify source references were expanded in [Shopify Sources](../../sources/external/shopify/README.md).
- Durable decision recorded in [ADR-006](../decisions/ADR-006-shopify-live-target-adapter.md).

### Hydrogen Needs A Storefront Boundary

Source signal: explicit request to include Hydrogen in MVP v0.1 after Shopify projection and optional live sync were introduced.

Learning: Hydrogen should enter as a customer-facing read boundary over Shopify Storefront API patterns. It should not receive Admin API credentials, own product projection writes, or make live Shopify sync a default dependency.

Routing outcome:

- Durable decision recorded in [ADR-007](../decisions/ADR-007-hydrogen-storefront-boundary.md).
- Storefront interpretation added in [Hydrogen Storefront](../commerce/hydrogen-storefront.md).
- MVP scope and context packs updated to allow Hydrogen only through the documented boundary.
- Open questions preserved for scaffold path, Storefront API version, route scope, Oxygen/deployment, and customer-account behavior.

### Shopify Admin Agent Access Needs A Runtime Split

Source signal: adding a repo-local MCP helper for explicit Shopify Admin inspection.

Learning: agent/operator Admin API access must be separated from runtime product projection sync. Tool access can help inspect or prepare a development/basic shop, but it is not delegated authority for autonomous writes, product deletion, checkout, or customer data behavior.

Routing outcome:

- Durable boundary added in [Shopify Admin Agent Access](../commerce/shopify-admin-agent-access.md).
- Runtime sync remains governed by [Shopify Live Sync](../commerce/shopify-live-sync.md) and [ADR-006](../decisions/ADR-006-shopify-live-target-adapter.md).
- Agent operating rules in [AGENTS.md](../../AGENTS.md) now distinguish MCP/operator access from permission to mutate Shopify.
- Real credentials remain in ignored `.env.agent`, private `.env`, or a real secret manager only.

## Shared Learning Stewardship

Shared learning must preserve origin, scope, owner, affected domains, rationale, review state, and action path. This prevents a local exception, repeated practice, or stale page from becoming global permission.

Agents may classify signals, summarize repeated patterns, and propose updates. People remain accountable for changing policy, review gates, autonomy thresholds, source-of-truth status, and durable operating rules.
