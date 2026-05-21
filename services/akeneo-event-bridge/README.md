# Akeneo Event Bridge

The Akeneo event bridge is a local adapter between optional Akeneo CE webhooks and the repo-owned product export contract.

## Responsibility

- Receive Akeneo product webhook payloads at `POST /akeneo/events`.
- Normalize product events into the local `akeneo-product-export` contract.
- Forward normalized events to the active n8n product projection webhook.
- Expose `GET /health`.

## Inputs And Outputs

- Input: Akeneo product event webhook envelope or an already-normalized local Akeneo product export payload.
- Output: HTTP calls to n8n at `N8N_PRODUCT_WEBHOOK_URL`.

## Belongs Here

- Akeneo event envelope adaptation.
- Local completeness inference for the MVP rug attributes.
- Local-only bridge response and forwarding status.

## Does Not Belong Here

- Shopify API calls.
- Product projection mapping.
- Durable business rules beyond boundary adaptation.
- Secrets or production webhook credentials.

## Future MVP Step

Replace local completeness inference with a richer Akeneo read model or official API-backed adapter after the first seeded Akeneo rug data set is stable.
