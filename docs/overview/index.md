# Overview

This section is the human-readable map of the repository. It summarizes the architecture, links to the durable decision records, and uses compact diagrams to make the setup easy to understand.

It is intentionally not the source of truth for detailed rules. When detail matters, follow the links to ADRs, schemas, service READMEs, checklists, source references, and context docs.

## Read Path

1. [Architecture Overview](architecture-overview.md) for purpose, scope, constraints, and solution strategy.
2. [Runtime And Containers](runtime-and-containers.md) for C4-style context/container views and the main runtime flows.
3. [Deployment View](deployment-view.md) for local Docker and future Cloud Run posture.
4. [Decisions Map](decisions-map.md) for the ADR map.
5. [Glossary](glossary.md) for local terms.

## Source Of Detail

- Project operating rules: [AGENTS.md](../../AGENTS.md)
- Context Architecture memory: [docs/context](../context/index.md)
- Commerce interpretation: [docs/commerce](../commerce/index.md)
- Architecture decisions: [docs/decisions](../decisions/ADR-001-project-scope.md)
- Service boundaries: [commerce integration](../../services/commerce-integration-service/README.md), [mock WMS](../../services/mock-wms/README.md), [mock PIM](../../services/mock-pim/README.md), [product projection](../../services/product-projection-service/README.md), [mock Shopify](../../services/mock-shopify/README.md), [Shopify Admin target](../../services/shopify-admin-target/README.md), [Akeneo event bridge](../../services/akeneo-event-bridge/README.md), and [governance](../../services/governance-service/README.md)
- External integration boundaries: [integrations](../../integrations/README.md)
- Data contracts: [schemas](../../schemas)
- Examples: [examples](../../examples)
- Raw source material: [sources](../../sources/README.md)

## Process Check

Use this command to see open handoffs, curated learnings, and manual follow-up prompts:

```sh
npm run context:check
```
