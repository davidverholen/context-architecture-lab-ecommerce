# ADR-003: n8n vs Custom Services

## Status

Accepted

## Context

The lab needs visible workflows and testable domain boundaries.

n8n is useful because it makes integration flows inspectable: a developer or reviewer can see the order and product projection paths without reading every service implementation first. That is valuable for local learning and for modeling iPaaS-style commerce integration patterns.

The same visibility creates a risk. If mapping rules, idempotency, audit policy, or error semantics live mainly inside n8n nodes, the workflow database becomes hidden business logic that is hard to test, review, and preserve as durable project memory.

Agent-driven development adds a second risk: agents need a clear file-based interface. A local n8n instance is a runner/editor, but its database is not a good source of truth for reviewable changes.

## Decision

n8n handles visible workflow orchestration. Custom Node.js/TypeScript services handle domain logic, schema validation, idempotency, auditability, and complex error handling.

Tracked workflow JSON under `n8n/workflows` is the reviewable source artifact for this repository. The local n8n instance is the visual runner/editor. Agents maintain workflows through the documented validate, import, and export commands, and workflow JSON keeps stable top-level IDs so repeated imports update known workflows instead of silently creating duplicates.

Official n8n documentation remains the source of truth for n8n runtime behavior, CLI behavior, API behavior, source-control features, and import/export semantics.

## Reasoning

- Reviewable files fit the repository's Context Architecture model better than relying on a local workflow database.
- n8n gives a clear visual orchestration layer without forcing the lab to build a custom integration UI.
- TypeScript services give normal code review, tests, schemas, and container boundaries for behavior that must be deterministic.
- Stable workflow IDs and validation scripts reduce the chance that an agent import creates drift in local n8n state.
- Keeping official n8n behavior out of local interpretation prevents the docs from becoming stale product documentation.

## Agent Workflow Lifecycle

- Validate tracked workflow JSON with `npm run n8n:validate`.
- Import tracked workflow JSON into a running local n8n instance with `npm run n8n:import`.
- Export local n8n workflows to ignored `.local/n8n-export/workflows/` with `npm run n8n:export`.
- Review exported JSON before promoting changes back into `n8n/workflows`.
- Keep credentials, secrets, and external production URLs out of tracked workflow JSON.

## Consequences

- n8n workflows should remain understandable.
- Business rules belong in services.
- Schemas define integration contracts.
- Tests target service behavior and schema examples.
- Workflow JSON becomes part of durable repo memory, while `.n8n-data` remains local runtime state.
- Repeated imports must preserve stable workflow IDs.
- Product projection and fulfillment workflow changes still require their existing review gates.

## Alternatives Considered

- Code-only orchestration: easier to test, but loses the visible workflow layer this lab intentionally models.
- n8n as the primary source of truth: easier for manual editing, but weak for agent-driven review, durable memory, and deterministic tests.
- Dedicated workflow engine or queue first: useful if flows become production-critical, but premature for the local architecture lab.

## References

- [n8n as Integration Layer](../commerce/n8n-as-integration-layer.md)
- [Custom Services Boundaries](../commerce/custom-services-boundaries.md)
- [Product Export Flow](../commerce/product-export-flow.md)
- [Order Fulfillment Flow](../commerce/order-fulfillment-flow.md)
- [Integration Flow Checklist](../checklists/integration-flow-checklist.md)
