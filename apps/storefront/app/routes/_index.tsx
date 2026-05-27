import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';
import {productAttributeLabel} from '~/lib/productAttributes';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/productFragments';
import {HOME_HERO_IMAGE} from '~/lib/storefrontAssets';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Context Home | Demo rugs'},
    {
      name: 'description',
      content:
        'A clean Hydrogen storefront demo for rugs, product attributes, search, and cart.',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const recommendedProducts = storefront
    .query(RECOMMENDED_PRODUCTS_QUERY, {
      cache: storefront.CacheShort(),
      variables: {
        first: 8,
        query: 'tag:context-home-demo',
      },
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <section className="home-hero">
        <div className="home-hero-media">
          <img
            alt="Context Home rug styled in a living room"
            src={HOME_HERO_IMAGE}
          />
        </div>
        <div className="home-hero-copy">
          <p className="eyebrow">Context Home demo catalog</p>
          <h1>Rugs that make product data feel shoppable.</h1>
          <p>
            A clean headless storefront showing product listing, search, cart,
            and detailed rug attributes from Shopify.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/collections/all">
              Shop rugs
            </Link>
            <Link className="button secondary" to="/search?q=wool">
              Search wool
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <p className="eyebrow">Curated test products</p>
          <h2>Four rugs for testing the storefront flow</h2>
          <Link to="/collections/all">View all</Link>
        </div>
        <RecommendedProducts products={data.recommendedProducts} />
      </section>

      <section className="category-tiles" aria-label="Shop by material">
        {['wool', 'jute', 'cotton'].map((material) => (
          <Link
            className="category-tile"
            key={material}
            to={`/search?q=${material}`}
          >
            <span>{productAttributeLabel(material)}</span>
            <small>Shop {material} rugs</small>
          </Link>
        ))}
      </section>

      <section className="trust-strip" aria-label="Storefront promises">
        <div>
          <strong>Real cart behavior</strong>
          <span>Add, update, and remove line items.</span>
        </div>
        <div>
          <strong>Structured details</strong>
          <span>Material, pile height, room fit, and origin.</span>
        </div>
        <div>
          <strong>Headless boundary</strong>
          <span>Hydrogen reads from Storefront API only.</span>
        </div>
      </section>
    </div>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <Suspense fallback={<div className="loading-block">Loading rugs...</div>}>
      <Await resolve={products}>
        {(response) =>
          response && response.products.nodes.length > 0 ? (
            <div className="products-grid">
              {response.products.nodes.map((product, index) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 4 ? 'eager' : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="loading-block">
              Product data will appear here after the Akeneo demo catalog is
              projected to Shopify.
            </div>
          )
        }
      </Await>
    </Suspense>
  );
}

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query RecommendedProducts(
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
