import type {Route} from './+types/collections.all';
import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Context Home | Rugs'},
    {
      name: 'description',
      content: 'Browse the Context Home demo rug catalog.',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return criticalData;
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  const {products} = await storefront.query(CATALOG_QUERY, {
    cache: storefront.CacheNone(),
    variables: {...paginationVariables, query: 'tag:context-home-demo'},
  });

  return {products};
}

export default function Collection() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="collection page-shell">
      <section className="collection-hero">
        <p className="eyebrow">All rugs</p>
        <h1>Quiet pieces for real rooms.</h1>
        <p>
          Browse four demo rugs backed by Shopify product data, media,
          inventory, and public metafields.
        </p>
        <form className="collection-search" action="/search" method="get">
          <input
            aria-label="Search rugs"
            name="q"
            placeholder="Search wool, jute, terracotta..."
            type="search"
          />
          <button type="submit">Search</button>
        </form>
      </section>

      <div className="listing-toolbar">
        <span>{products.nodes.length} rugs</span>
        <div>
          <Link to="/search?q=wool">Wool</Link>
          <Link to="/search?q=jute">Jute</Link>
          <Link to="/search?q=cotton">Cotton</Link>
        </div>
      </div>

      <PaginatedResourceSection<CollectionItemFragment>
        connection={products}
        resourcesClassName="products-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    material: metafield(namespace: "details", key: "material") {
      value
    }
    style: metafield(namespace: "details", key: "style") {
      value
    }
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $query: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      query: $query
      sortKey: TITLE
    ) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
