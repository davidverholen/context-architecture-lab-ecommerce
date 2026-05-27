# Context Memory Index

Read this before architectural changes.

This directory is curated memory. Keep it concise, owned by the project, and grounded in sources or observed implementation learning.

## Pages

- `context-architecture.md`: project-specific Context Architecture model, operating rules, failure modes, and MVP boundary.
- `context-packs.md`: small explicit context bundles, selection categories, and stop conditions.
- `handoff-protocols.md`: how work crosses ownership boundaries while preserving authority.
- `durable-memory.md`: how docs, ADRs, schemas, examples, checklists, and handoffs compound.
- `learning-loops.md`: how implementation, review, incident, and evaluation signals become curated memory or operating changes.
- `agentic-change-governance.md`: decision rights, review gates, accountability, and governance evidence.
- `open-questions.md`: uncertainties, missing source notes, and unresolved model details.

Human-readable orientation lives in `docs/overview/`. Treat it as a map that links back to durable memory, not as a replacement for context, commerce, ADR, schema, or service detail.

Manual process status can be checked with:

```sh
npm run context:check
```

## Minimum Read Path

For architecture or governance changes, read:

- `docs/context/index.md`
- `docs/context/context-architecture.md`
- `docs/context/context-packs.md`
- `docs/context/handoff-protocols.md`
- `docs/context/agentic-change-governance.md`
- The relevant `docs/commerce` page and ADR.

## Standing Rules

- Prefer minimum needed context over broad implicit prompts.
- Classify context as required, optional, forbidden, or missing authority.
- Use handoffs for cross-context interpretation, approval, exceptions, and obligations.
- Treat review findings as learning signals, but curate before promoting them to durable memory.
- Propose `AGENTS.md` diffs for durable agent operating rules; do not silently rewrite project principles.
- Preserve MVP v0.1 exclusions unless explicitly requested and approved: Paperclip Teams, RAG, and Cloud Run deployment. Treat Akeneo CE as optional local setup governed by ADR-005, live Shopify sync as an optional adapter governed by ADR-006, Hydrogen as an optional storefront boundary governed by ADR-007, and hosted checkout/customer account route scope as governed by ADR-008, not as default dependencies.
