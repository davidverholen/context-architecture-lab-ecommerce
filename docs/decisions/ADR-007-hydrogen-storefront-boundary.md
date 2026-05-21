# ADR-007: Hydrogen Storefront Boundary

## Status

Accepted by explicit MVP scope request on 2026-05-21.

## Context

MVP v0.1 originally excluded Hydrogen so the lab could focus on product projection, n8n orchestration, custom services, and governance boundaries. Shopify projection support now exists in two forms:

- `mock-shopify` receives local projection dumps without Shopify credentials.
- `shopify-admin-target` can optionally write product projections to a Shopify development or basic shop through Admin GraphQL, with credentials outside the repository.

The next MVP step is to include a customer-facing headless storefront boundary so the lab can show how projected Shopify data is consumed without making Shopify the product master.

Official Shopify documentation remains the source of truth for Hydrogen, Oxygen, Storefront API, Customer Account API, environment variables, deployment, limits, and API versions.

## Decision

Include Hydrogen in MVP v0.1 as an optional storefront boundary, not as the product governance source and not as a default runtime dependency.

- Hydrogen represents the customer-facing storefront that reads from Shopify through Storefront API patterns.
- Hydrogen must not call Shopify Admin API or own product projection writes.
- Product writes remain in the product export path and, when live sync is enabled, in `shopify-admin-target`.
- Hydrogen credentials and storefront tokens stay outside source control in private environment configuration.
- The default local product projection path remains `mock-shopify`.
- Live Shopify sync remains opt-in through [ADR-006](ADR-006-shopify-live-target-adapter.md).
- Oxygen deployment, self-hosted production deployment, Customer Account API, checkout behavior, and customer data handling require separate review before implementation.

## Consequences

- MVP scope now includes a governed storefront boundary alongside product projection and order integration.
- A future Hydrogen app scaffold may be added under an explicit storefront path, but adding the scaffold is a separate implementation step.
- Hydrogen source authority must be checked against official Shopify docs before API-specific code, environment setup, deployment setup, or customer-account behavior is added.
- Storefront work becomes customer-facing commerce work and requires at least storefront review. Checkout and customer data changes require the customer data and checkout review gates.
- The lab can explain the full loop from governed PIM data to Shopify projection to customer-facing headless storefront without adding production scale.

## Contract Artifacts

- [Hydrogen Storefront](../commerce/hydrogen-storefront.md)
- [Shopify Product Model](../commerce/shopify-product-model.md)
- [Shopify Live Sync](../commerce/shopify-live-sync.md)
- [Product Export Flow](../commerce/product-export-flow.md)
- [Shopify Change Checklist](../checklists/shopify-change-checklist.md)

## Source Authority

Use official Shopify documentation before implementation-specific Hydrogen or Storefront API work:

- https://shopify.dev/docs/storefronts/headless/getting-started/build-options
- https://shopify.dev/docs/storefronts/headless/hydrogen/getting-started
- https://shopify.dev/docs/storefronts/headless/hydrogen/data-fetching
- https://shopify.dev/docs/storefronts/headless/hydrogen/environments
- https://shopify.dev/docs/api/storefront
