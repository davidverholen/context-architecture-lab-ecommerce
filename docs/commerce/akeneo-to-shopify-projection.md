# Akeneo to Shopify Projection

The PIM-to-Shopify path is a governed domain projection, not a blind sync.

PIM/Akeneo remains the product master for rug product family, SKU, enrichment status, and governed attributes. Shopify receives the customer-facing commerce projection for merchandising, saleability, storefront display, and channel behavior.

Projection should:

- Select only customer-facing attributes needed by commerce.
- Prefer native Shopify fields when they express the concept well.
- Use variants only for purchasable differences.
- Use metafields for simple structured attributes.
- Use metaobjects for reusable structured concepts.
- Record mapping decisions and failure modes.
- Validate projected examples against schemas before implementation.

Missing SKU mappings, incomplete enrichment, or ambiguous attribute ownership should stop or route the flow instead of creating silent drift.

## Rug Projection Policy

The proposed rug projection mapping lives in [pim-to-shopify-mapping.table.md](../../examples/products/pim-to-shopify-mapping.table.md).

The future event/export path is specified in [Product Export Flow](product-export-flow.md). That flow introduces Akeneo CE as an optional real PIM source through contracts rather than replacing the stable `mock-pim` test double.

Native Shopify fields are preferred for core commerce presentation:

- Product title from governed merchandising name.
- Handle from governed naming rules.
- Vendor or brand from configured commerce brand source.
- Product type or category decision from rug family.
- Description from approved customer-facing copy.
- Price from governed ecommerce price data for the sellable variant.
- Status from PIM enrichment and approval state.

Variants are reserved for purchasable differences. For rugs, size and color may be variant options when they identify distinct sellable items. Non-purchasable descriptive attributes such as material, shape, pile height, suitable rooms, style, and origin should not create variants by default.

Metafields carry simple structured attributes:

- `material` when only a display/filter value is needed.
- `shape`.
- `pile_height_mm`.
- `style`.
- `origin_country`.
- `suitable_rooms` while room types are simple list values.

The Context Home demo catalog uses [akeneo-context-home-catalog.json](../../examples/products/akeneo-context-home-catalog.json) as an Akeneo-shaped offline source for four demo rugs, and the same identifiers can be pulled from local Akeneo REST with `SHOPIFY_DEMO_AKENEO_SOURCE=api` after `npm run akeneo:seed-rug`. Hydrogen keeps only a generic missing-media placeholder locally; storefront product names, descriptions, prices, attributes, and product-specific media are read from Shopify after Akeneo data has been projected.

Metaobjects carry reusable governed concepts:

- `care_profile` for reusable care instructions.
- `room_type` if room types need reusable descriptions, imagery, or merchandising rules.
- `material_definition` if materials need reusable explanations, care implications, sustainability notes, or compliance metadata.
- `certification` only when PIM supplies governed certification data.

## Stop Conditions

Do not project a product when:

- PIM status is not approved for commerce projection.
- Required SKU or variant mapping is missing.
- Customer-facing copy is missing or not approved.
- A field requires current Shopify API behavior that has not been checked against official Shopify docs.
- A reusable claim, such as certification or material origin, lacks a governed PIM source.

## Review Gate

Projection mapping changes affect product data governance and customer-facing commerce behavior. They require product projection review before implementation.
