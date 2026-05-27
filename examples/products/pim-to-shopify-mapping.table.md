# PIM to Shopify Rug Projection Mapping

This table proposes how the mock Akeneo/PIM rug product projects into Shopify. It is a design artifact, not a real Shopify API payload.

PIM remains the product master. Shopify receives a customer-facing commerce projection.

| PIM source | Sample value | Shopify projection target | Projection rule | Rationale | Verification needed |
| --- | --- | --- | --- | --- | --- |
| `pim_product_id` | `pim-rug-atlas-sand` | Internal projection reference | Store as projection source reference in project data or a private/internal metafield when API implementation exists. | Preserves source traceability without making Shopify the master. | Verify preferred private/internal storage pattern in official Shopify docs before implementation. |
| `family` | `rug` | Product type / category decision | Project to a customer-facing rug classification. | Rug family is stable commerce categorization. | Verify current product classification fields and taxonomy behavior. |
| `sku` | `RUG-ATLAS-170X240-SAND` | Variant SKU | Put SKU on the purchasable variant. | SKU identifies the sellable item. | Verify current Admin API mutation shape for variant SKU. |
| `status` | `approved` | Product status | Only approved PIM products may project to active commerce states; otherwise keep draft. | PIM governance controls readiness. | Verify current status values and publication/channel behavior. |
| `merchandising_name` | `Atlas Wool Rug` | Native product title | Use approved PIM merchandising name; derive only when absent in local tests. | Title is core commerce presentation. | Confirm naming and translation strategy before real sync. |
| Derived handle | `atlas-wool-rug-sand` | Native product handle | Generate from governed title/color rules, with collision handling outside MVP. | Handle is commerce-facing routing. | Verify handle uniqueness and update semantics. |
| Brand/vendor | `Context Home` | Native vendor or brand field | Project configured brand value. | Vendor/brand is native commerce presentation. | Verify desired Shopify field for brand/vendor in target setup. |
| Description | Sample copy | Native product description | Project approved customer-facing description only. | Description is presentation content, not governance source. | Verify rich text / HTML handling before API implementation. |
| `price` | `349.00` | Variant price | Project the approved ecommerce price to the sellable variant. | Price is variant-level commerce data. | Verify currency ownership and market-specific price strategy. |
| `size` | `170x240 cm` | Variant option when purchasable | Use as variant option when size changes the sellable item. | Size is a purchasable rug difference. | Verify current option/variant API shape and option naming constraints. |
| `color` | `sand` | Variant option when purchasable | Use as variant option when color changes the sellable item. | Color is a purchasable rug difference. | Verify current option/variant API shape and display conventions. |
| `material` | `wool` | Product metafield or material metaobject reference | Use metafield for simple display; use metaobject if material needs reusable definition, care, origin, or certification data. | Starts simple, promotes to reusable concept when governance requires it. | Verify metafield type and metaobject reference patterns. |
| `shape` | `rectangle` | Product metafield | Project as simple structured attribute. | Shape filters/presentation can use a simple value. | Verify target metafield type and storefront visibility. |
| `pile_height_mm` | `12` | Product metafield | Project as numeric structured attribute. | Numeric value supports display and filtering. | Verify numeric metafield type and units strategy. |
| `care_instruction` | `Vacuum regularly...` | Care profile metaobject | Project to reusable `care_profile` concept. | Care instructions are reusable and should not be duplicated blindly. | Verify metaobject definition, references, and localization behavior. |
| `suitable_rooms` | `living_room`, `bedroom` | Room type metaobject references or list metafield | Use list metafield for MVP projection; promote to metaobjects if room definitions need reusable content. | Room fit can power merchandising and filtering. | Verify list/reference field choices and storefront access. |
| `style` | `modern organic` | Product metafield or style metaobject reference | Use metafield unless style becomes governed reusable vocabulary. | Keeps simple attributes lightweight. | Verify storefront filtering/search requirements. |
| `origin_country` | `IN` | Product metafield or origin metaobject | Use metafield for country code; use metaobject if origin content becomes reusable. | Country is structured and governed by PIM. | Verify type, display format, and compliance requirements. |
| `image_assets` | `atlas-wool-rug-primary.jpg` | Shopify product media | Demo sync uploads generated owned images and associates the primary image with the variant. | Product media is required for storefront inspection. | Verify production asset authority and media lifecycle before real sync. |
| Certifications | Not in sample | Certification metaobjects | Do not project until PIM provides governed certification data. | Avoid inventing unsupported claims. | Verify certification source authority and Shopify modeling before adding. |
