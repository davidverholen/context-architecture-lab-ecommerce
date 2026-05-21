# Handoffs

Handoffs are durable boundary records. They keep review gates, obligations, missing authority, and cross-context decisions visible without turning a chat transcript into project memory.

## Records

| Status | Handoff | Review Gate |
| --- | --- | --- |
| Requested | [Product Projection Event Flow Review](product-projection-event-flow-review.md) | Product projection review required before treating the event-shaped flow as approved beyond local MVP learning. |

## Templates

- [Change Handoff Template](change-handoff-template.md)
- [Implementation Handoff Template](implementation-handoff-template.md)
- [Review Handoff Template](review-handoff-template.md)

## Upkeep

- Keep one row per active or recently closed handoff.
- Update status when a handoff is answered, blocked, escalated, or closed.
- Move obligations back into docs, ADRs, checklists, examples, schemas, or open questions.
- Run `npm run context:check` after creating or updating handoff records.
