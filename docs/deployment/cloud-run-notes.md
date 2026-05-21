# Cloud Run Notes

Cloud Run deployment is intentionally out of scope for MVP v0.1. This document records future deployment preparation only.

Do not deploy, create GCP resources, or add secrets as part of MVP readiness work.

Official Cloud Run source links are tracked in `sources/external/google-cloud-run/README.md`. Verify those docs before any deployment change.

## Current Readiness Baseline

Custom services are Cloud-Run-ready in the limited sense that they:

- Build into production containers from service-specific Dockerfiles.
- Own a service-specific image default command.
- Run as a non-root `node` user in the runtime image.
- Listen on `process.env.PORT`.
- Bind to `0.0.0.0`.
- Expose `GET /health`.
- Log through Fastify to stdout/stderr.
- Read runtime configuration from environment variables.
- Do not require committed secrets. `shopify-admin-target` requires runtime Shopify credentials only when explicitly enabled.

Services covered:

- `commerce-integration-service`
- `mock-wms`
- `mock-pim`
- `governance-service`
- `product-projection-service`
- `mock-shopify`
- `akeneo-event-bridge`
- `shopify-admin-target`

## Deployment Boundaries

The local Docker Compose topology is not a Cloud Run architecture. It is a local development model for n8n, Postgres, and services.

Future Cloud Run work must decide:

- How service-to-service authentication is handled.
- Where persistent state, projection dumps, idempotency records, audit events, and workflow data live.
- Whether n8n remains local, moves to another hosting model, or is replaced by managed workflow infrastructure.
- How secrets are stored outside the repository.
- Which project, region, service accounts, artifact registry, and network settings are used.

## Future Deployment TODOs

- [ ] Verify current official Cloud Run deployment and container requirements.
- [ ] Choose target GCP project and region.
- [ ] Choose Artifact Registry repository name and image naming convention.
- [x] Use service-specific Dockerfiles instead of Compose or Cloud Run command overrides.
- [ ] Define service accounts and least-privilege permissions.
- [ ] Define secret storage and runtime environment variable strategy.
- [ ] Add idempotency and audit storage before production-like fulfillment flows.
- [ ] Replace local mock Shopify dump files with an approved durable storage or target strategy before production-like product projection.
- [ ] Define Secret Manager bindings for `SHOPIFY_ADMIN_ACCESS_TOKEN` before any live Shopify Cloud Run deployment.
- [ ] Add readiness checks for downstream dependencies where needed.
- [ ] Add structured logging fields for correlation IDs and source order IDs.
- [ ] Add CI build/test/container validation before deployment.
- [ ] Add human review gate for any Cloud Run deployment change.

## Exact Future Deploy Steps

These are the intended future steps. Do not execute them until deployment is explicitly requested and reviewed.

1. Verify current official Cloud Run docs and update this note if requirements changed.
2. Confirm the target GCP project, region, billing posture, and accountable owner.
3. Create or select an Artifact Registry repository.
4. Build each service image from its service-specific Dockerfile.
5. Tag and push the image to Artifact Registry.
6. Deploy one service at a time to Cloud Run using the image default command.
7. Set runtime environment variables, including `PORT` only if overriding the platform default is required.
8. Configure service-to-service URLs and authentication.
9. Verify `GET /health` for each deployed service.
10. Run smoke tests with sample payloads.
11. Record deployment decisions in an ADR or deployment handoff.

## Non-Goals

- No Cloud Run deployment in MVP v0.1.
- No GCP resource creation in this repository task.
- No committed Shopify credentials.
- No secrets committed to source control.
- No production n8n hosting decision.
