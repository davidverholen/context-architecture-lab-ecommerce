# Cloud Run Readiness Checklist

Deployment remains out of scope for MVP v0.1 unless explicitly requested.

Current MVP baseline:

- [x] Custom services are container-ready through service-specific Dockerfiles.
- [x] Each custom service image has the correct default command.
- [x] Runtime container uses production dependencies only.
- [x] Runtime container runs as non-root `node` user.
- [x] Custom services listen on `process.env.PORT`.
- [x] Custom services bind to `0.0.0.0`.
- [x] Custom services expose `GET /health`.
- [x] No real Shopify credentials are committed; live Shopify target reads credentials from runtime environment only.
- [x] Runtime configuration comes from environment variables.
- [x] Logs use Fastify stdout/stderr logging.
- [x] Docker image assumptions are documented in `docker-compose.yml` and service-specific Dockerfiles.
- [x] Future deployment notes live in `docs/deployment/cloud-run-notes.md`.
- [x] Production Cloud Run deployment configuration is intentionally absent.
- [x] Local mock Shopify dump storage is explicitly non-production and would need a future durable storage decision.

Per-service check before future deployment work:

- [ ] Confirm `PORT` is used rather than a hard-coded runtime port.
- [ ] Confirm `/health` returns quickly without external dependencies.
- [ ] Confirm no secrets or private credentials are present in the repository.
- [ ] Confirm startup failure behavior is clear.
- [ ] Confirm environment variables are documented in `.env.example`.
- [ ] Confirm Docker image can be built from a clean checkout.
- [ ] Confirm current official Cloud Run docs before any deployment work.
- [ ] Confirm service-to-service authentication before exposing non-public services.
- [ ] Confirm secrets are supplied through approved secret management, not repository files.
