# Runtime And Containers

This page combines the first C4-style zooms for the MVP. Split it later if it becomes too dense.

## System Context

```mermaid
flowchart TB
  Human["Developer / reviewer"]
  Agent["Codex / agent"]
  Lab["Context Architecture Commerce Lab"]
  ShopifyDocs["Official Shopify docs"]
  N8NDocs["Official n8n docs"]
  CloudRunDocs["Official Cloud Run docs"]

  Human -->|"runs local stack, reviews changes"| Lab
  Agent -->|"implements bounded changes"| Lab
  Lab -->|"source authority for Shopify, Storefront API, and Hydrogen behavior"| ShopifyDocs
  Lab -->|"source authority for n8n behavior"| N8NDocs
  Lab -->|"source authority before deployment work"| CloudRunDocs
```

## Container View

```mermaid
flowchart LR
  subgraph Local["Local Docker Compose"]
    N8N["n8n\nworkflow visibility"]
    PG["Postgres\nn8n persistence"]
    CIS["commerce-integration-service\nFastify + Zod"]
    WMS["mock-wms\nfulfillment boundary"]
    PIM["mock-pim\nrug product fixture"]
    GOV["governance-service\nchange classification"]
    AEB["akeneo-event-bridge\nAkeneo webhook adapter"]
    PPS["product-projection-service\nAkeneo to Shopify projection"]
    MS["mock-shopify\nprojection dump target"]
    SAT["shopify-admin-target\noptional live Shopify adapter"]
  end

  OptionalAkeneo["optional Akeneo CE\nignored .local/akeneo/pim project"]
  Shopify["optional Shopify shop\ncustomer-facing projection"]
  Hydrogen["apps/storefront\noptional Hydrogen storefront"]

  Samples["examples/\nJSON samples"]
  Schemas["schemas/\nJSON Schema contracts"]
  Workflow["n8n/workflows/order-created-to-wms.json"]
  ProductWorkflow["n8n/workflows/akeneo-product-updated-to-mock-shopify.json"]
  WorkflowLifecycle["npm run n8n:validate/import/export\nagent workflow lifecycle"]

  N8N --> PG
  Workflow --> N8N
  ProductWorkflow --> N8N
  WorkflowLifecycle --> Workflow
  WorkflowLifecycle --> ProductWorkflow
  N8N -->|"POST /orders/shopify-created"| CIS
  N8N -->|"POST /products/akeneo-events"| PPS
  OptionalAkeneo -->|"product webhook event"| AEB
  AEB -->|"normalized rug event"| N8N
  CIS -->|"POST /orders"| WMS
  PPS -->|"default POST /products/projections"| MS
  PPS -. "profile shopify-live" .-> SAT
  SAT -. "Admin GraphQL" .-> Shopify
  Hydrogen -. "Storefront API" .-> Shopify
  Samples --> CIS
  Samples --> PPS
  Schemas --> CIS
  Schemas --> WMS
  Schemas --> PPS
  Schemas --> MS
  PIM -->|"GET /products"| CIS
  GOV -->|"POST /changes/classify"| HumanReview["review gate"]
  PIM -. "test double contract" .-> PPS
  OptionalAkeneo -. "event-shaped export contract" .-> PPS
```

## Service Responsibilities

| Service | Responsibility | Health | Dockerfile |
| --- | --- | --- | --- |
| `commerce-integration-service` | Validate Shopify order-created samples and map to canonical and mock WMS orders. | `GET /health` | `services/commerce-integration-service/Dockerfile` |
| `mock-wms` | Accept mock WMS orders unless SKU mapping is missing. | `GET /health` | `services/mock-wms/Dockerfile` |
| `mock-pim` | Return governed rug product fixture data. | `GET /health` | `services/mock-pim/Dockerfile` |
| `governance-service` | Classify change requests and return review gate decisions. | `GET /health` | `services/governance-service/Dockerfile` |
| `akeneo-event-bridge` | Normalize local Akeneo webhook envelopes to the product export contract and forward rug events to n8n. | `GET /health` | `services/akeneo-event-bridge/Dockerfile` |
| `product-projection-service` | Validate Akeneo exports and map governed PIM products to Shopify projection payloads. | `GET /health` | `services/product-projection-service/Dockerfile` |
| `mock-shopify` | Receive Shopify-style product projection dumps before real Shopify integration. | `GET /health` | `services/mock-shopify/Dockerfile` |
| `shopify-admin-target` | Optional live Shopify Admin GraphQL adapter for product projection upserts and removals. | `GET /health` | `services/shopify-admin-target/Dockerfile` |

Hydrogen is documented as an optional storefront boundary in [Hydrogen Storefront](../commerce/hydrogen-storefront.md). The scaffold lives under [apps/storefront](../../apps/storefront/) and is not part of the default Docker Compose stack.

## Workflow Lifecycle

Tracked workflow JSON in [n8n/workflows](../../n8n/workflows/) is the reviewable source artifact. The local n8n instance is a runner/editor, not durable memory.

```mermaid
flowchart LR
  Repo["Repo workflow JSON\nn8n/workflows"]
  Validate["Validate\nnpm run n8n:validate"]
  Import["Import to local n8n\nnpm run n8n:import"]
  Canvas["n8n visual editor\nlocalhost:5678"]
  Export["Export for review\nnpm run n8n:export"]
  Review["Human or agent review\nbefore promotion"]

  Repo --> Validate --> Import --> Canvas --> Export --> Review
  Review -->|"curated change"| Repo
```

See [ADR-003](../decisions/ADR-003-n8n-vs-custom-services.md) and [n8n as Integration Layer](../commerce/n8n-as-integration-layer.md) for the decision and operating rules.

## Runtime Flow: Order Created To WMS

```mermaid
sequenceDiagram
  participant Caller as Local caller / n8n webhook
  participant N8N as n8n workflow
  participant CIS as commerce-integration-service
  participant WMS as mock-wms

  Caller->>N8N: POST Shopify order-created sample
  N8N->>CIS: POST /orders/shopify-created
  CIS->>CIS: Validate and map to canonical order
  CIS->>CIS: Map canonical order to mock WMS order
  CIS->>WMS: POST /orders
  alt SKU is known
    WMS-->>CIS: accepted
    CIS-->>N8N: accepted response
    N8N-->>Caller: 200 success
  else SKU is UNKNOWN-SKU
    WMS-->>CIS: SKU_MAPPING_MISSING
    CIS-->>N8N: rejected response
    N8N-->>Caller: 422 structured error
  end
```

## Runtime Flow: Governance Classification

```mermaid
sequenceDiagram
  participant Agent as Agent or developer
  participant GOV as governance-service
  participant Reviewer as Human review gate

  Agent->>GOV: POST /changes/classify
  GOV->>GOV: Validate change request
  GOV->>GOV: Classify risk and affected domain
  alt High-risk product projection or fulfillment change
    GOV-->>Agent: needs_changes with review_gate
    Agent->>Reviewer: request review
  else Low-risk change
    GOV-->>Agent: approved for standard review
  end
```

## Runtime Flow: Product Export Projection

```mermaid
sequenceDiagram
  participant Akeneo as optional local Akeneo CE
  participant Bridge as akeneo-event-bridge
  participant N8N as n8n workflow
  participant Projection as product-projection-service
  participant Target as mock-shopify / shopify-admin-target
  participant Reviewer as Product projection review

  Akeneo->>Bridge: product webhook event
  Bridge->>Bridge: ignore non-rug events; normalize rug event
  Bridge->>N8N: repo product export contract
  N8N->>Projection: POST /products/akeneo-events
  Projection->>Projection: validate export and map projection
  alt product is approved and mapping exists
    Projection->>Target: Shopify projection payload
    Target-->>Projection: accepted target result
    Projection-->>N8N: accepted projection result
  else mapping or source authority is missing
    Projection-->>N8N: review_required
    N8N->>Reviewer: route for product projection review
  end
```

## Runtime Flow: Product Removal

```mermaid
sequenceDiagram
  participant Akeneo as optional local Akeneo CE
  participant Bridge as akeneo-event-bridge
  participant N8N as n8n workflow
  participant Projection as product-projection-service
  participant Target as mock-shopify / shopify-admin-target

  Akeneo->>Bridge: product removal event
  Bridge->>N8N: product.removed export contract
  N8N->>Projection: POST /products/akeneo-events
  Projection->>Projection: build removal command
  alt mock target
    Projection->>Target: POST /products/removals
    Target-->>Projection: dump removed
  else Shopify live target
    Projection->>Target: POST /products/removals
    Target-->>Projection: product archived by default
  end
```

## Runtime Flow: Hydrogen Storefront Read

```mermaid
sequenceDiagram
  participant Browser as Customer browser
  participant Hydrogen as Hydrogen storefront
  participant Shopify as Shopify Storefront API
  participant Projection as Product projection flow

  Projection-->>Shopify: optional live projection writes through shopify-admin-target
  Browser->>Hydrogen: request product or collection route
  Hydrogen->>Shopify: Storefront API query
  Shopify-->>Hydrogen: customer-facing product projection
  Hydrogen-->>Browser: rendered storefront response
```

## Notes

- n8n should remain orchestration and response routing, not durable domain logic.
- Service READMEs and source code own service detail.
- Schemas and examples own data-contract detail.
- ADRs own durable architecture decisions.
