# Agent Instructions

1. This lab models enterprise decision boundaries, not enterprise scale.
2. Before architectural changes, read `docs/context/index.md` and `docs/commerce/index.md`.
3. Treat `docs/context` and `docs/commerce` as curated durable memory.
4. Treat `sources` as raw or external source material.
5. Do not invent claims from missing sources.
6. Official Shopify documentation is the source of truth for Shopify API behavior, API versions, limits, metafields, metaobjects, Admin API, Storefront API, and Hydrogen/headless details.
7. Official n8n documentation is the source of truth for n8n behavior. Community `llms.txt` files may be used as convenience references but are not authoritative.
8. Official Akeneo documentation and repositories are the source of truth for Akeneo installation, API behavior, and Event Platform support. Local CE event-shaped payloads are project contracts, not claims about official Event Platform support.
9. Local docs summarize stable architectural interpretation only.
10. Any change touching product projection, storefront behavior, order integration, fulfillment, customer data, Cloud Run deployment, or governance boundaries must update or explicitly confirm relevant docs, checklists, and ADRs.
11. Prefer small explicit context packs over large implicit prompts.
12. For medium/high risk work, classify context as required, optional, forbidden, or missing authority before acting.
13. Agents may propose changes, but review gates are required for fulfillment, checkout, customer data, storefront, product projection, and governance changes.
14. Visible knowledge, source access, or tool access is not permission; medium/high risk work must record delegated authority, accountable owner, required evidence, and required handoff or review gate.
15. Hydrogen has been explicitly requested for MVP v0.1 and is allowed only as the optional storefront boundary governed by ADR-007. Do not add Paperclip Teams, RAG, or Cloud Run deployment in MVP v0.1 unless explicitly requested. Akeneo CE is allowed only as the optional local setup governed by ADR-005. Live Shopify sync is allowed only through the optional `shopify-admin-target` boundary governed by ADR-006, with credentials outside the repository and product projection review required.
16. Repo-local Shopify Admin MCP or agent access is operator access only; it is not permission for autonomous writes, routine sync, product deletion, checkout, or customer data work.
17. For Node.js services, prefer TypeScript, Fastify, Zod, Vitest, OpenAPI-friendly APIs, Docker readiness, and explicit health endpoints.
18. For schemas, use JSON Schema and validate examples with Ajv.
19. For recurring mistakes or stable new learnings, propose updates to `AGENTS.md` and `docs/context`, but do not silently rewrite project principles.
20. Keep `docs/overview` as the human-readable architecture map; update it when service boundaries, runtime flows, deployment topology, ADRs, or durable project rules change.
21. In human-readable docs, use direct Markdown links for referenced documents instead of bare file names or "read this file" instructions.
22. For n8n workflows, treat tracked JSON under `n8n/workflows` as the reviewable source artifact; keep stable workflow IDs, validate before import, and do not treat the local n8n database as durable project memory.
23. Local Akeneo CE product events must pass through `akeneo-event-bridge` before n8n; do not put Akeneo webhook envelope adaptation or non-rug filtering inside n8n.
