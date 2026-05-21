# Shopify Product Model

At a stable conceptual level, Shopify product modeling includes:

- Native product fields for core commerce presentation such as title, handle, vendor, product type, description, status, and images.
- Variants for purchasable differences such as size or color when those differences affect the item a customer buys.
- Metafields for simple structured product attributes that extend native fields.
- Metaobjects for reusable structured concepts that should be modeled consistently across products.
- Admin API for administrative product operations.
- Storefront API and headless patterns for customer-facing consumption, including the optional Hydrogen storefront boundary in [Hydrogen Storefront](hydrogen-storefront.md).

Before API-specific work, verify current official Shopify documentation in `sources/external/shopify/README.md`.

The first live adapter is documented in [Shopify Live Sync](shopify-live-sync.md). It uses Admin GraphQL product upsert behavior through `productSet` and keeps the PIM product ID as a custom metafield identifier. Hydrogen consumes the resulting Shopify storefront projection through Storefront API patterns; it does not perform Admin API product writes.

## Rug Projection Interpretation

For this lab, Shopify is a projection target. It should express the customer-facing product model derived from PIM, not become the source of product truth.

Use native fields first when the projected concept is core commerce presentation:

- Title.
- Handle.
- Vendor or brand.
- Product type or category.
- Description.
- Status and publication intent.
- Images when governed media exists.

Use variants only for purchasable rug differences. Size and color are candidate variant options because they can represent distinct sellable rug SKUs. Attributes such as material, shape, pile height, care instruction, suitable rooms, style, and origin country are descriptive unless the business explicitly makes them purchasable choices.

Use metafields for simple structured attributes that extend the product while remaining lightweight:

- Material as a simple display/filter value.
- Shape.
- Pile height in millimeters.
- Style.
- Origin country.
- Suitable room list while room types remain simple.

Use metaobjects for reusable structured concepts:

- Care profiles.
- Room types.
- Material definitions.
- Certifications.

The first live sync pass does not create Shopify metaobject definitions. It preserves local metaobject-shaped projection data as JSON until reusable concept definitions, ownership, and migration rules are designed.

Do not add API-specific payloads, limits, or version assumptions here. Those must be verified against official Shopify docs at implementation time.
