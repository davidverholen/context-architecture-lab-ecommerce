# Durable Memory

Durable memory is curated project knowledge that survives one chat, ticket, or implementation session.

In this lab, durable memory includes:

- `AGENTS.md` for agent operating rules.
- `docs/context` and `docs/commerce` for stable project interpretation.
- ADRs for durable decisions.
- JSON Schemas for data contracts.
- Examples for testable boundary cases.
- Tracked n8n workflow JSON under `n8n/workflows` for reviewable workflow skeletons.
- Checklists for repeated review prompts.
- Handoff templates and records for cross-boundary exchanges.
- `docs/overview` for a human-readable architecture map.

## Promotion Rule

Do not promote every observation into durable memory. Promote a signal only after deciding:

- What the signal means.
- Which context owns the meaning.
- Whether it is local or shared.
- Which source, decision, review, incident, example, or handoff supports it.
- Whether the lesson is current, draft, superseded, or uncertain.
- Who must review or approve the update.

Logs, traces, review comments, chat history, and failed attempts are signals. They become memory only after curation.

Local runtime databases, including `.n8n-data`, are not durable memory. Exported n8n workflows under `.local/n8n-export/workflows/` are review inputs; they become durable memory only after a curated change is promoted into `n8n/workflows`.

## Minimum Page Metadata

Until the repo adopts a formal metadata block, curated memory pages should make these facts clear in prose:

- Source basis.
- Scope.
- Owner or accountable context.
- Status or uncertainty.
- Review gate, if the memory changes behavior or authority.
- Escalation path when the page is not enough to decide.

## Domain And Shared Memory

Domain memory stays with the owning context. Shared memory may point across contexts, but it must preserve origin, scope, owner, rationale, source signal, affected domains, review state, and follow-up action.

A local decision does not become global policy because it appears in shared memory. Policy promotion requires owner review and, when durable agent instructions change, a proposed `AGENTS.md` diff.

## Upkeep

Durable memory needs maintenance:

- Review stale pages.
- Keep `docs/overview` in sync with service boundaries, runtime flows, deployment topology, and ADR changes.
- Retire or narrow obsolete decisions.
- Preserve open questions instead of inventing answers.
- Refresh examples after schema, policy, or boundary changes.
- Route repeated retrieval mistakes to the learning loop.

RAG is not durable memory by itself. MVP v0.1 does not add RAG; the maintained Markdown, ADRs, schemas, examples, and checklists are the durable memory system.
