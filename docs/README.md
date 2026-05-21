# Docs

Docs are curated durable memory for the lab.

- `overview/` is the human-readable architecture map. It summarizes the repo and links to source-of-truth docs.
- `context/` captures stable Context Architecture concepts and agentic operating rules.
- `commerce/` captures the local commerce integration interpretation.
- `decisions/` records architecture decisions.
- `deployment/` captures future deployment notes without deploying.
- `handoffs/` provides templates for cross-boundary work.
- `checklists/` provides review and readiness prompts.

Raw sources belong in `sources/`; implementation belongs in `services/`, `schemas/`, `examples/`, and `n8n/`.

## Reading Modes

- Start with [overview](overview/index.md) when you need orientation.
- Use [context](context/index.md), [commerce](commerce/index.md), [decisions](decisions/ADR-001-project-scope.md), [schemas](../schemas), [examples](../examples), and service READMEs when you need source-of-truth detail.
- Use [Hydrogen Storefront](commerce/hydrogen-storefront.md) before storefront work and [Shopify Sources](../sources/external/shopify/README.md) before API-specific Shopify claims.
- Use [sources](../sources/README.md) when you need raw source material or official external references.
