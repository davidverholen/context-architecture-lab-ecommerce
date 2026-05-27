export const PRODUCT_DISPLAY_ATTRIBUTES_FRAGMENT = `#graphql
  fragment ProductDisplayAttributes on Product {
    material: metafield(namespace: "details", key: "material") {
      value
    }
    style: metafield(namespace: "details", key: "style") {
      value
    }
  }
` as const;

export const PRODUCT_CARD_FRAGMENT = `#graphql
  ${PRODUCT_DISPLAY_ATTRIBUTES_FRAGMENT}
  fragment MoneyProductCard on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductCard on Product {
    id
    handle
    title
    ...ProductDisplayAttributes
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductCard
      }
      maxVariantPrice {
        ...MoneyProductCard
      }
    }
  }
` as const;
