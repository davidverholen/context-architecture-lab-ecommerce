# Glossary

## Akeneo / PIM

The product information management concept used by the lab. It owns product governance, enrichment, and canonical product vocabulary. MVP v0.1 uses `mock-pim` as the stable test double and optional local Akeneo CE as a real PIM source behind the product export boundary.

## Shopify Projection

The customer-facing commerce representation derived from governed PIM data. Shopify is not the product master in this lab.

## Hydrogen Storefront

The optional customer-facing storefront boundary governed by [ADR-007](../decisions/ADR-007-hydrogen-storefront-boundary.md) and [ADR-008](../decisions/ADR-008-shopify-checkout-and-customer-account-mvp.md). Hydrogen consumes Shopify through Storefront API and Customer Account API patterns, redirects to Shopify-hosted checkout, and does not own product projection writes, checkout, payments, orders, authentication, or customer records.

## n8n

The local visible workflow layer. It models iPaaS-like integration thinking and calls services instead of owning durable business logic.

## Canonical Order

The internal order representation used between a Shopify-style order event and downstream fulfillment integration.

## Mock WMS

The local warehouse management system boundary. It accepts mock WMS orders and returns structured failures such as `SKU_MAPPING_MISSING`.

## Akeneo Export

The future event or export payload emitted by Akeneo CE and validated at the product export boundary. The local schema is not a claim about Akeneo API behavior; it is the lab contract for the future adapter.

## Product Projection Service

The future service that validates Akeneo export payloads, maps them into the local PIM product contract, and produces Shopify-style projection results.

## Mock Shopify Target

The future local target that receives projected Shopify product payloads and stores or dumps them for inspection before real Shopify Admin API integration.

## Governance Decision

A structured decision response for an agentic change request, including status, review gate, checks, reviewers, and follow-ups.

## Context Pack

A small explicit bundle of task-relevant docs, ADRs, schemas, examples, and stop conditions.

## Durable Memory

Curated repository knowledge that survives one session: docs, ADRs, schemas, examples, checklists, skills, and handoff records.

## Review Gate

A required human review point for high-risk changes such as product projection, storefront behavior, fulfillment, customer data, Cloud Run deployment, or governance boundary changes.

## Overview Docs

The human-readable map under `docs/overview`. It summarizes and links to durable memory but does not replace source-of-truth docs.
