import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {productCardView} from '~/lib/productPresentation';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading,
}: {
  product: ProductCardFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const view = productCardView(product);

  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <span className="product-item-media">
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 60em) 25vw, (min-width: 45em) 33vw, 50vw"
          />
        ) : (
          <img
            alt=""
            aria-hidden="true"
            loading={loading ?? 'lazy'}
            src={view.fallbackImage}
          />
        )}
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
          <Money data={product.priceRange.minVariantPrice} />
        </span>
      </span>
    </Link>
  );
}
