# n8n as Integration Layer

n8n is the visible local workflow layer for MVP learning. It represents iPaaS-style integration thinking without implementing Patchworks or another commerce iPaaS.

n8n is intentionally not the durable source of truth for workflow definitions. Tracked workflow JSON under [n8n/workflows](../../n8n/workflows/) is the reviewable artifact; the local n8n instance is the runner and visual editor.

The durable decision is [ADR-003: n8n vs Custom Services](../decisions/ADR-003-n8n-vs-custom-services.md).

n8n should own:

- Workflow visibility.
- Event routing.
- Calling custom services.
- Simple branching and retry orchestration.
- Human-readable integration flow examples.
- The visible product projection path after `akeneo-event-bridge` normalizes Akeneo webhook payloads.

n8n should not own complex domain rules, schema interpretation, idempotency decisions, or audit policy. Those belong in custom services and schemas.

## Agent Workflow Lifecycle

- Validate workflow JSON with `npm run n8n:validate`, implemented by [scripts/n8n-validate-workflows.mjs](../../scripts/n8n-validate-workflows.mjs).
- Import tracked workflow JSON into local n8n with `npm run n8n:import`, implemented by [scripts/n8n-import-workflows.sh](../../scripts/n8n-import-workflows.sh); the script waits for the local health endpoint before running the CLI import.
- Export local n8n workflows for review with `npm run n8n:export`, implemented by [scripts/n8n-export-workflows.sh](../../scripts/n8n-export-workflows.sh).
- Review exported JSON before promoting it into [n8n/workflows](../../n8n/workflows/).
- Preserve stable top-level workflow IDs in repo JSON so repeated local CLI imports update the same workflow instead of creating duplicates.

## Reasoning

This split gives agents a concrete file interface and gives humans the visual n8n canvas. It also keeps the local n8n database out of durable project memory. Workflow exports may include instance-specific metadata, so exported files are review input rather than automatic source updates.

If a workflow becomes production-critical, move durable behavior into a service or introduce an explicit workflow/queue decision before expanding n8n's authority.

Official n8n docs remain the source of truth for import/export, REST API, CLI, source control, and workflow behavior.
