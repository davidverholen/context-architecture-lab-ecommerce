# ADR-001: Project Scope

## Status

Accepted, amended by [ADR-005](ADR-005-product-export-projection-flow.md), [ADR-006](ADR-006-shopify-live-target-adapter.md), and [ADR-007](ADR-007-hydrogen-storefront-boundary.md)

## Context

The repository demonstrates Context Architecture concepts in an enterprise commerce integration setting. The goal is to model decision boundaries, not rebuild a commerce platform.

## Decision

MVP v0.1 excludes Paperclip Teams, RAG, Cloud Run deployment, and production Shopify sync.

Akeneo CE was initially excluded from the first static lab scope. [ADR-005](ADR-005-product-export-projection-flow.md) now permits Akeneo CE only as an optional local PIM setup under ignored `.local/akeneo/pim/`, behind the product export/projection boundary. It is not part of the default Docker Compose stack and does not replace `mock-pim` as the stable test double.

[ADR-006](ADR-006-shopify-live-target-adapter.md) permits live Shopify sync only as an optional `shopify-admin-target` adapter with credentials outside the repository. It is not part of the default mock-first path.

[ADR-007](ADR-007-hydrogen-storefront-boundary.md) permits Hydrogen only as an optional customer-facing storefront boundary that consumes Shopify through Storefront API patterns. It is not part of the default Docker Compose stack and does not own Admin API writes, product projection, checkout, or customer data behavior.

## Consequences

- Mock data and schemas are used to model PIM, Shopify projection, orders, and WMS.
- Optional Akeneo CE setup may supply real local PIM data after product export contracts are respected.
- Optional live Shopify sync may project to a development/basic shop after credential, source-authority, and review-gate requirements are respected.
- Optional Hydrogen storefront work may consume the Shopify projection after source-authority and review-gate requirements are respected.
- Services are placeholders until implementation is explicitly requested.
- Future extensions must pass through governance and scope review.
