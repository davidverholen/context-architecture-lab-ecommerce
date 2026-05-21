# Integration Flow Checklist

- [ ] Identify source event.
- [ ] Identify canonical model.
- [ ] Identify target system contract.
- [ ] Validate examples against schemas.
- [ ] Define idempotency key.
- [ ] Define audit events.
- [ ] Define retry behavior.
- [ ] Define failure routing.
- [ ] Confirm n8n vs service responsibility split.
- [ ] For n8n workflows, confirm tracked JSON under [n8n/workflows](../../n8n/workflows/) is the reviewable artifact.
- [ ] For n8n workflows, run `npm run n8n:validate` before import or review.
- [ ] For n8n workflows, preserve stable top-level workflow IDs.
- [ ] For n8n workflows, keep credentials, secrets, and external production URLs out of tracked JSON.
- [ ] Require review for fulfillment-impacting changes.
- [ ] For product export flows, confirm Akeneo/PIM remains source of product governance.
- [ ] For Akeneo CE local flows, confirm event-shaped local payloads are not documented as official Event Platform support.
- [ ] For product export flows, confirm mock Shopify target is used before real Admin API integration.
- [ ] For product export flows, require product projection review.
