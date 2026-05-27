import {Await, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  Image,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {Suspense} from 'react';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {ProductItem} from '~/components/ProductItem';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {productDetailView} from '~/lib/productPresentation';
import {
  PRODUCT_CARD_FRAGMENT,
  PRODUCT_DISPLAY_ATTRIBUTES_FRAGMENT,
} from '~/lib/productFragments';
import type {RelatedProductsQuery} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  return [
    {title: `Context Home | ${product?.title ?? 'Product'}`},
    {
      name: 'description',
      content: product?.seo?.description ?? product?.description ?? '',
    },
    {
      rel: 'canonical',
      href: `/products/${product?.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const {product} = await storefront.query(PRODUCT_QUERY, {
    cache: storefront.CacheShort(),
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

function loadDeferredData({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  const relatedProducts = storefront
    .query(RELATED_PRODUCTS_QUERY, {
      cache: storefront.CacheShort(),
      variables: {
        first: 4,
        query: 'tag:context-home-demo',
      },
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    relatedProducts,
    currentHandle: params.handle,
  };
}

export default function Product() {
  const {product, relatedProducts, currentHandle} =
    useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant?.selectedOptions ?? []);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });
  const gallery = product.images.nodes;
  const productView = productDetailView(product, selectedVariant);

  return (
    <div className="product-page page-shell">
      <div className="product">
        <div className="product-gallery">
          {gallery.length > 0 ? (
            gallery.map((image, index) => (
              <Image
                alt={image.altText || product.title}
                data={image}
                key={image.id}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes="(min-width: 64em) 50vw, 100vw"
              />
            ))
          ) : (
            <img
              alt=""
              aria-hidden="true"
              src={productView.fallbackImage}
            />
          )}
        </div>

        <div className="product-main">
          <p className="eyebrow">{product.vendor || 'Context Home'}</p>
          <h1>{product.title}</h1>
          {product.description ? (
            <p className="product-subtitle">{product.description}</p>
          ) : null}
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />

          <div className="product-service-list">
            <span>In-stock demo inventory</span>
            <span>Free returns in the demo flow</span>
            <span>Storefront API product details</span>
          </div>

          <section className="product-details-panel">
            <h2>Details</h2>
            <dl className="product-attributes">
              {productView.details.map((detail) => (
                <div key={detail.label}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="product-description">
            <h2>About this rug</h2>
            <div
              dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
            />
          </section>
        </div>
      </div>

      <RelatedProducts
        currentHandle={currentHandle}
        products={relatedProducts}
      />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

function RelatedProducts({
  currentHandle,
  products,
}: {
  currentHandle: string | undefined;
  products: Promise<RelatedProductsQuery | null>;
}) {
  return (
    <section className="home-section">
      <div className="section-heading">
        <p className="eyebrow">More rugs</p>
        <h2>Complete the room</h2>
      </div>
      <Suspense fallback={<div className="loading-block">Loading rugs...</div>}>
        <Await resolve={products}>
          {(response) => {
            const nodes =
              response?.products.nodes
                .filter((product) => product.handle !== currentHandle)
                .slice(0, 3) ?? [];

            return (
              <div className="products-grid related-products-grid">
                {nodes.map((product) => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </div>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

type ProductPageProduct = Awaited<ReturnType<typeof loadCriticalData>>['product'];

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  ${PRODUCT_DISPLAY_ATTRIBUTES_FRAGMENT}
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    ...ProductDisplayAttributes
    shape: metafield(namespace: "details", key: "shape") {
      value
    }
    pileHeightMm: metafield(namespace: "details", key: "pile_height_mm") {
      value
    }
    suitableRooms: metafield(namespace: "details", key: "suitable_rooms") {
      value
    }
    originCountry: metafield(namespace: "details", key: "origin_country") {
      value
    }
    images(first: 8) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RELATED_PRODUCTS_QUERY = `#graphql
  query RelatedProducts(
    $country: CountryCode
    $first: Int
    $language: LanguageCode
    $query: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      query: $query
      sortKey: UPDATED_AT
      reverse: true
    ) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
