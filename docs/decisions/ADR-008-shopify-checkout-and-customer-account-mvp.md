# ADR-008: Shopify Checkout And Customer Account MVP

## Status

Accepted by explicit MVP scope request on 2026-05-27.

## Context

[ADR-007](ADR-007-hydrogen-storefront-boundary.md) introduced Hydrogen as an optional storefront boundary and deferred checkout, Customer Account API, and customer data behavior until separate review. The storefront demo now needs the basic Shopify ecommerce loop: add products to cart, continue into Shopify-hosted checkout, and let returning customers access Shopify-standard account and order information.

Official Shopify documentation remains the source of truth for hosted checkout, Customer Account API, Hydrogen route patterns, Storefront API cart behavior, environment values, limits, and API versions.

## Decision

MVP v0.1 includes Shopify-hosted checkout redirect and Shopify-standard Customer Account API routes in the Hydrogen storefront.

- Shopify remains the system of record for checkout, payment, orders, authentication, and customer records.
- Hydrogen may render the cart checkout call to action by reading `Cart.checkoutUrl` from the Storefront API and redirecting to Shopify-hosted checkout.
- Hydrogen may provide Shopify-standard account routes for login, OAuth authorization, logout, account landing, order list, and order detail.
- Customer account routes must use Hydrogen's Customer Account client methods, not legacy Storefront customer access-token mutations.
- Customer/account route responses must be treated as customer-data handling and remain uncached.
- Root storefront layout may expose only a boolean login state, not customer PII.
- Hydrogen must not create custom checkout, payment, profile, address, subscription, return, or order-management workflows.
- Hydrogen must not call Shopify Admin API or store customer records outside the session behavior required by Hydrogen's Customer Account client.
- Production Hydrogen/Oxygen deployment remains out of scope.

## Consequences

- ADR-007 remains the Hydrogen boundary decision, amended by this ADR for hosted checkout and standard customer account route scope.
- The storefront now has customer-data handling code and therefore requires customer-data and checkout review for changes that affect login, account session behavior, order rendering, checkout redirects, analytics, or customer identifiers.
- The local account OAuth flow requires Shopify-linked environment values and local development with the Shopify CLI `--customer-account-push` flag.
- Demo and local development can show the basic ecommerce loop while preserving Shopify ownership of sensitive commerce records.
- Custom checkout, custom payment handling, profile/address mutations, returns, subscriptions, and production deployment still require new review and likely a new ADR or ADR amendment.

## Contract Artifacts

- [Hydrogen Storefront](../commerce/hydrogen-storefront.md)
- [Shopify Change Checklist](../checklists/shopify-change-checklist.md)
- [Shopify Sources](../../sources/external/shopify/README.md)
- [Context Packs](../context/context-packs.md)
- [Agentic Change Governance](../context/agentic-change-governance.md)

## Source Authority

Use official Shopify documentation before implementation-specific checkout or Customer Account API work:

- https://shopify.dev/storefronts/headless/building-with-the-customer-account-api/hydrogen
- https://shopify.dev/docs/storefronts/headless/hydrogen/cart
- https://shopify.dev/docs/api/storefront/latest/objects/Cart
- https://shopify.dev/docs/api/customer
