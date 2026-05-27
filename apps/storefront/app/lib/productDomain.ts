import {PRODUCT_IMAGE_PLACEHOLDER} from './storefrontAssets';

type MetafieldLike = {
  value?: string | null;
} | null | undefined;

type ProductCardSource = {
  material?: MetafieldLike;
  style?: MetafieldLike;
};

type ProductDetailSource = ProductCardSource & {
  originCountry?: MetafieldLike;
  pileHeightMm?: MetafieldLike;
  suitableRooms?: MetafieldLike;
};

type SelectedVariantSource = {
  selectedOptions?: Array<{
    name: string;
    value: string;
  }>;
} | null | undefined;

export type ProductDetail = {
  label: string;
  value: string;
};

export function productCardView(product: ProductCardSource) {
  const material = productAttributeLabel(product.material?.value);
  const style = productAttributeLabel(product.style?.value);
  const metaLabel = [material, style].filter(Boolean).join(' / ');

  return {
    fallbackImage: PRODUCT_IMAGE_PLACEHOLDER,
    metaLabel,
  };
}

export function productDetailView(
  product: ProductDetailSource,
  selectedVariant: SelectedVariantSource,
) {
  const selectedOption = (name: string) =>
    selectedVariant?.selectedOptions?.find((option) => option.name === name)
      ?.value;
  const rooms = parseProductList(product.suitableRooms?.value);
  const pileHeight = product.pileHeightMm?.value;

  const details: ProductDetail[] = [
    {
      label: 'Material',
      value: productAttributeLabel(product.material?.value),
    },
    {
      label: 'Size',
      value: selectedOption('Size') ?? '',
    },
    {
      label: 'Color',
      value: productAttributeLabel(selectedOption('Color')),
    },
    {
      label: 'Pile height',
      value: pileHeight ? `${pileHeight} mm` : '',
    },
    {
      label: 'Room fit',
      value: rooms.map(productAttributeLabel).join(', '),
    },
    {
      label: 'Origin',
      value: productCountryLabel(product.originCountry?.value),
    },
    {
      label: 'Style',
      value: productAttributeLabel(product.style?.value),
    },
  ].filter((detail) => detail.value);

  return {
    details,
    fallbackImage: PRODUCT_IMAGE_PLACEHOLDER,
  };
}

export function productAttributeLabel(value: string | null | undefined) {
  if (!value) return '';
  return value
    .split(/[_-]+/g)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function productCountryLabel(value: string | null | undefined) {
  if (!value) return '';
  try {
    return new Intl.DisplayNames(['en'], {type: 'region'}).of(value) ?? value;
  } catch {
    return value;
  }
}

function parseProductList(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
  }
}
