# Akeneo Integration Boundary

Akeneo CE is treated as an external PIM system. It may provide real local product data, but it does not become the product projection service and it does not replace the repository schemas, ADRs, or review gates.

## Local Runtime Location

The generated Akeneo Community Standard project lives under ignored `.local/akeneo/pim/` by default.

Wrapper scripts:

- `npm run akeneo:setup`
- `npm run akeneo:up`
- `npm run akeneo:down`
- `npm run akeneo:demo-up`

Detailed setup instructions live in [Akeneo Local Setup](../../docs/commerce/akeneo-local-setup.md).

## Event Boundary

The local flow uses an explicit bridge:

```text
Akeneo CE webhook event
-> akeneo-event-bridge
-> n8n product workflow
-> product-projection-service
-> mock-shopify dump target
```

`akeneo-event-bridge` is a local adapter. It receives Akeneo webhook envelopes, ignores non-rug product events, normalizes rug product data to the repository's product export contract, and forwards the normalized payload to n8n. It is intentionally not documented as official Akeneo Event Platform support for Community Edition.

Official Akeneo Event Platform behavior must be verified from [Akeneo Sources](../../sources/external/akeneo/README.md) before a real subscription adapter is added.

## Boundary Role

Akeneo owns product governance and enrichment. This lab owns:

- Product export contracts.
- Akeneo webhook adaptation.
- Projection mapping decisions.
- n8n orchestration shape.
- Mock Shopify projection targets until real Shopify integration is approved.

## Non-Goals

- Do not commit generated Akeneo files.
- Do not add Shopify credentials.
- Do not make Akeneo part of the default Docker Compose stack.
- Do not let Akeneo API details override local architecture decisions without source verification and review.
