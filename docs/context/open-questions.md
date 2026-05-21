# Open Questions

No source-copy failure was recorded during initial scaffold creation. The Context Architecture whitepaper source existed and was copied into `sources/paper/context-architecture-whitepaper.md`.

## Shopify

- Should the live Shopify adapter remain on Admin GraphQL `2026-04`, or should the repo pin a different supported version after shop/app verification?
- Which additional Admin API mutation shapes are needed after the first `productSet` upsert and archive-by-default removal adapter?
- Which current product taxonomy or category behavior should the rug projection use?
- How should product status, publication, and sales channel behavior be represented before a product becomes storefront-visible?
- Is the dedicated Shopify custom ID metafield (`pim.external_id`, type `id`) sufficient for all lookup and migration scenarios, while `pim.product_id` remains a human-readable source reference?
- How should handle uniqueness and update semantics be handled?
- Which metafield types should be used for numeric units, country codes, lists, and Storefront visibility?
- Which metaobject definitions, reference patterns, localization behavior, and Storefront access rules apply?
- Which current Shopify limits or constraints affect rug projection?
- Which Shopify app scopes are the minimum needed beyond `read_products` and `write_products` for the live adapter as it evolves?
- Should Akeneo product removal permanently delete Shopify products in any environment, or should archive remain the only allowed policy?

These questions require official Shopify documentation verification before expanding the live Shopify adapter. Detailed projection notes live in [pim-to-shopify-mapping.table.md](../../examples/products/pim-to-shopify-mapping.table.md) and [Shopify Live Sync](../commerce/shopify-live-sync.md).

## Hydrogen

- When should the Hydrogen scaffold switch from Mock.shop/default local data to the configured Shopify shop?
- Which Storefront API version should the future Hydrogen app pin after shop/channel verification?
- Should the local Hydrogen app use values copied from the Shopify Headless channel, or link to a Shopify Hydrogen storefront and pull environment values with the Shopify CLI?
- Which projected Shopify products should be made active and published for storefront smoke tests?
- Should the MVP use the Hydrogen channel and Oxygen preview deployments, or keep deployment deferred?
- What is the exact review gate and approval evidence for enabling checkout redirects, Customer Account API, analytics attribution, and customer data behavior?

These questions require official Shopify documentation verification before storefront implementation. The current boundary interpretation lives in [Hydrogen Storefront](../commerce/hydrogen-storefront.md).

## Local Infrastructure

- Which local Docker Compose topology should be used if n8n, Postgres, and services need production-like persistence or networking?
- Which idempotency store should MVP service implementations use?
- Which audit log format should governance and integration services share?
- Which local persistence strategy should the future mock Shopify projection target use for projection dumps?
- Should the optional Akeneo CE project remain under ignored `.local/akeneo/pim/`, or later move into a root Docker Compose profile?
- If a non-CE Akeneo edition is introduced later, should the official Akeneo Event Platform replace the local event-shaped adapter?
- What is the minimum review evidence needed to close [Product Projection Event Flow Review Handoff](../handoffs/product-projection-event-flow-review.md)?
- Which Akeneo fields and locales/scopes should be represented in the first seeded rug demo data?
- Should `akeneo-event-bridge` verify Akeneo webhook signatures before any non-local use?
- Should `akeneo-event-bridge` persist processed Akeneo `event_id` values before retry or replay testing?
- Should the lab add an automated local n8n reset or workflow reconciliation command to remove duplicate local workflow records after repeated imports?
- At what complexity threshold should a product or order workflow move from n8n orchestration into a code-first worker, queue, or workflow engine?

## Governance And Memory

- What minimum evidence and governance review should be required before adding RAG over project memory?
- Which accountable owner labels should the lab use for context ownership and decision rights?
- What lightweight metadata format should curated memory pages use for owner, scope, status, source basis, review state, and escalation path?
- Where should handoff records live once the repo has more than templates: Markdown under `docs/handoffs`, ADR-linked records, issue templates, or another lightweight format?
- Which handoff statuses are sufficient for MVP examples, and which require a future workflow tool?
- Which governance observability signals should remain manual checklist items, and which should become validation or review automation?
- What threshold promotes repeated review comments, schema failures, or handoff problems into shared memory rather than a local context note?

## Overview Docs

- Is `docs/overview/runtime-and-containers.md` still readable as one combined C4-style page, or should it split into container view, service detail, and runtime flow pages?
- Which diagrams should become generated artifacts later, if any, instead of hand-maintained Mermaid blocks?
