# Governance Service

## Responsibility

Represent review gates and agentic change governance decisions as testable local APIs.

## Inputs and Outputs

- Input: change request at `POST /changes/classify`.
- Output: governance decision, required checks, and review requirement.

## Belongs Here

- Risk classification.
- Review gate evaluation.
- Governance decision records.
- Audit-friendly decision output.

## Does Not Belong Here

- Human approval simulation as automatic approval.
- Product or fulfillment domain logic.
- Paperclip Teams in MVP v0.1.

## Future MVP Step

Persist governance decisions and add richer policy fixtures.

## Local Docker

Run through Docker Compose as `governance-service`. The service listens on `process.env.PORT` and exposes `GET /health`.

The service owns `services/governance-service/Dockerfile`, which sets the image default command for this service.

## Future Cloud Run Notes

This service is container-ready, but deployment is deferred. Before Cloud Run deployment, define decision persistence, reviewer identity, service authentication, and the human review gate for governance changes.
