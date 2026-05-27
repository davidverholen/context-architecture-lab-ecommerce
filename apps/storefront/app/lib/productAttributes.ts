type MetafieldLike = {
  value?: string | null;
} | null | undefined;

export type ProductCardSource = {
  material?: MetafieldLike;
  style?: MetafieldLike;
};

export type ProductDetailSource = ProductCardSource & {
  originCountry?: MetafieldLike;
  pileHeightMm?: MetafieldLike;
  suitableRooms?: MetafieldLike;
};

export type SelectedVariantSource = {
  selectedOptions?: Array<{
    name: string;
    value: string;
  }>;
} | null | undefined;

export function productAttributeLabel(value: string | null | undefined) {
  if (!value) return '';
  return value
    .split(/[_-]+/g)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function productCountryLabel(value: string | null | undefined) {
  if (!value) return '';
  try {
    return new Intl.DisplayNames(['en'], {type: 'region'}).of(value) ?? value;
  } catch {
    return value;
  }
}

export function parseProductList(value: string | null | undefined) {
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
