import {
  parseProductList,
  productAttributeLabel,
  productCountryLabel,
  type ProductCardSource,
  type ProductDetailSource,
  type SelectedVariantSource,
} from './productAttributes';
import {PRODUCT_IMAGE_PLACEHOLDER} from './storefrontAssets';

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
