# Akeneo Local Setup

Akeneo CE is introduced as an optional local PIM source. It is not part of the default Docker Compose stack and it does not replace `mock-pim` in tests.

The generated Akeneo project is kept under `.local/akeneo/pim/`, which is ignored by Git. The tracked boundary note lives in [Akeneo Integration Boundary](../../integrations/akeneo/README.md).

## Source Basis

The local setup follows the official Akeneo Community Standard Docker project creation flow from the [Akeneo PIM Community Standard repository](https://github.com/akeneo/pim-community-standard). Akeneo’s public Community Edition page describes CE as the free open-source PIM.

Relevant local source links are collected in [Akeneo Sources](../../sources/external/akeneo/README.md).

## Requirements

Akeneo’s current Community Standard README lists:

- Docker 19+
- docker-compose >= 1.24
- `make`

This repository uses wrapper scripts so the generated Akeneo project stays outside tracked source files. The generated Akeneo Makefile expects `docker-compose`; the wrappers provide a local compatibility shim when Docker Compose v2 is available as `docker compose`. The wrappers also route Composer, Yarn, and Cypress caches to ignored `.local/akeneo/cache/` directories so Docker does not need to write into the developer home cache.

## Setup

Create and start the local Akeneo project:

```sh
npm run akeneo:setup
```

By default, this creates Akeneo Community Standard `v2026.3` using the `akeneo/pim-php-dev:8.3` image under `.local/akeneo/pim/`.

Override defaults when needed:

```sh
AKENEO_VERSION=v2026.3 AKENEO_DIR=.local/akeneo/pim npm run akeneo:setup
```

Start an existing local Akeneo project:

```sh
npm run akeneo:up
```

Stop Akeneo:

```sh
npm run akeneo:down
```

The generated Akeneo project is expected to be available at `http://localhost:8080/` after startup completes. The official development install path documents `admin/admin` as the default credentials for the generated local PIM.

## Event Projection Demo

Start the local Akeneo-to-mock-Shopify event flow:

```sh
npm run akeneo:demo-up
```

This command:

- Starts the generated Akeneo CE stack.
- Starts n8n, `akeneo-event-bridge`, `product-projection-service`, and `mock-shopify`.
- Imports and activates the product projection workflow.
- Configures the local Akeneo `context_lab` connection webhook to call `akeneo-event-bridge`.
- Starts a local Akeneo Messenger webhook worker container named `pim-webhook-worker`.
- Seeds or updates `RUG-ATLAS-170X240-SAND` through the Akeneo REST API.
- Produces a mock Shopify projection dump under `.local/mock-shopify-dumps/`.

The bridge endpoint is `POST /akeneo/events` on `http://localhost:8090`.

## Lab Boundary

Akeneo CE is a real upstream PIM source. It enters this lab through the product export boundary:

```text
Akeneo CE
-> Akeneo product webhook event
-> akeneo-event-bridge
-> n8n orchestration
-> product projection service
-> mock Shopify projection target
```

The current local flow accepts Akeneo webhook payloads at `akeneo-event-bridge`, converts rug product events into [akeneo-product-export.schema.json](../../schemas/akeneo-product-export.schema.json), and sends the normalized event through n8n and `product-projection-service`. This is a project contract, not a claim that Akeneo CE supports the official Akeneo Event Platform.

## Seed Data

The local seed script models the existing rug sample:

- Family: `rug`
- Identifier/SKU: `RUG-ATLAS-170X240-SAND`
- Attributes: material, size, color, shape, pile height, care instruction, suitable rooms, style, origin country
- Completeness: ready for ecommerce projection

Run it directly with:

```sh
npm run akeneo:seed-rug
```

The seed should produce an event that normalizes toward [akeneo-rug-export.sample.json](../../examples/products/akeneo-rug-export.sample.json).

## Non-Goals

- Do not add real Shopify credentials.
- Do not call Shopify Admin API.
- Do not commit generated Akeneo application files.
- Do not replace `mock-pim` as the stable contract test double.
- Do not make Akeneo part of default `docker compose up`.

## Open Follow-Ups

- Decide whether the bridge should verify Akeneo webhook signatures outside local development.
- Decide whether the bridge should persist processed event IDs before retry/replay testing.
- Decide whether Akeneo should later move into a root Compose profile or remain a separate generated project.
