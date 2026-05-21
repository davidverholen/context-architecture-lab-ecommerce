# Webhook Receiver

## Responsibility

Receive local webhook-style events such as Shopify order-created samples and pass validated envelopes to downstream integration services.

## Inputs and Outputs

- Input: HTTP webhook event payload.
- Output: Accepted event envelope or validation error.

## Belongs Here

- Request authentication placeholder.
- Event envelope validation.
- Idempotency key extraction.
- Health endpoint.

## Does Not Belong Here

- Product projection rules.
- WMS mapping.
- Long-running workflow orchestration.

## Future MVP Step

Implement a TypeScript Fastify service with Zod validation, `/health`, and a local event forwarding endpoint.
