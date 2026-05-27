import type {Route} from './+types/collections.all';
import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/productFragments';

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
    cache: storefront.CacheShort(),
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

      <PaginatedResourceSection<ProductCardFragment>
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
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
