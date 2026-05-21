# ADR-002: PIM and Shopify Projection

## Status

Accepted

## Context

Enterprise commerce systems often mix product governance and customer-facing presentation. This lab needs a clear boundary.

## Decision

PIM/Akeneo is the product master for governance and enrichment. Shopify is the commerce and customer-facing projection.

## Consequences

- Product changes start from governed PIM concepts.
- Shopify modeling choices are projection decisions.
- Blind bidirectional sync is out of scope.
- Projection changes require review.
- Rug projection mapping is tracked as durable memory in `examples/products/pim-to-shopify-mapping.table.md`.
- API-specific Shopify behavior, payload shape, limits, and publication mechanics must be verified from official Shopify docs before implementation.
