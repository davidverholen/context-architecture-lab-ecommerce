import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
import {productCardView} from '~/lib/productPresentation';

type SearchItems = NonNullable<RegularSearchReturn['result']>['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2>Articles</h2>
      <div>
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item" key={article.id}>
              <Link prefetch="intent" to={articleUrl}>
                {article.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2>Pages</h2>
      <div>
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item" key={page.id}>
              <Link prefetch="intent" to={pageUrl}>
                {page.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <div className="section-heading compact">
        <p className="eyebrow">Products</p>
        <h2>Rugs matching your search</h2>
      </div>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            const price = product?.selectedOrFirstAvailableVariant?.price;
            const image = product?.selectedOrFirstAvailableVariant?.image;
            const view = productCardView(product);

            return (
              <Link
                className="search-product-card"
                key={product.id}
                prefetch="intent"
                to={productUrl}
              >
                <span className="product-item-media">
                  {image && (
                    <Image
                      alt={product.title}
                      data={image}
                      sizes="(min-width: 45em) 25vw, 50vw"
                    />
                  )}
                  {!image ? (
                    <img alt="" aria-hidden="true" src={view.fallbackImage} />
                  ) : null}
                </span>
                <span className="product-item-info">
                  <span>
                    <span className="product-item-title">{product.title}</span>
                    {view.metaLabel ? (
                      <span className="product-item-meta">
                        {view.metaLabel}
                      </span>
                    ) : null}
                  </span>
                  <span className="product-item-price">
                    {price && <Money data={price} />}
                  </span>
                </span>
              </Link>
            );
          });

          return (
            <div>
              <div className="pagination-link">
                <PreviousLink>
                  {isLoading ? 'Loading...' : <span>Load previous</span>}
                </PreviousLink>
              </div>
              <div className="search-products-grid">
                {ItemsMarkup}
              </div>
              <div className="pagination-link">
                <NextLink>
                  {isLoading ? 'Loading...' : <span>Load more</span>}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
      <br />
    </div>
  );
}

function SearchResultsEmpty() {
  return (
    <div className="empty-state">
      <h2>Start with a material or room.</h2>
      <p>Try wool, jute, cotton, bedroom, living room, or terracotta.</p>
    </div>
  );
}
