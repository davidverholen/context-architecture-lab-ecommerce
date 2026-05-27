export type AccountMoney = {
  amount: string;
  currencyCode: string;
};

export type AccountOrderSummary = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string;
  statusPageUrl: string;
  totalPrice: AccountMoney;
  lineItems: {
    nodes: Array<{
      title: string;
      quantity: number;
    }>;
  };
};

export type CustomerAccountQueryData = {
  customer: {
    id: string;
    displayName: string;
    firstName: string | null;
    lastName: string | null;
    emailAddress: {
      emailAddress: string | null;
    } | null;
    orders: {
      nodes: AccountOrderSummary[];
    };
  };
};

export type AccountOrderDetail = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string;
  statusPageUrl: string;
  customer: {
    id: string;
  } | null;
  subtotal: AccountMoney | null;
  totalShipping: AccountMoney;
  totalTax: AccountMoney | null;
  totalPrice: AccountMoney;
  shippingAddress: {
    formatted: string[];
  } | null;
  lineItems: {
    nodes: AccountOrderLineItem[];
  };
};

export type AccountOrderLineItem = {
  id: string;
  title: string;
  quantity: number;
  sku: string | null;
  variantTitle: string | null;
  image: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
  totalPrice: AccountMoney | null;
  variantOptions: Array<{
    name: string;
    value: string;
  }>;
};

export type CustomerOrderQueryData = {
  customer: {
    id: string;
  };
  order: AccountOrderDetail | null;
};

export const CUSTOMER_ACCOUNT_QUERY = `#graphql
  fragment AccountMoney on MoneyV2 {
    amount
    currencyCode
  }

  query CustomerAccount($first: Int = 10) {
    customer {
      id
      displayName
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      orders(first: $first, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          statusPageUrl
          totalPrice {
            ...AccountMoney
          }
          lineItems(first: 3) {
            nodes {
              title
              quantity
            }
          }
        }
      }
    }
  }
` as const;

export const CUSTOMER_ORDER_QUERY = `#graphql
  fragment AccountMoney on MoneyV2 {
    amount
    currencyCode
  }

  query CustomerOrder($orderId: ID!) {
    customer {
      id
    }
    order(id: $orderId) {
      id
      name
      processedAt
      financialStatus
      fulfillmentStatus
      statusPageUrl
      customer {
        id
      }
      subtotal {
        ...AccountMoney
      }
      totalShipping {
        ...AccountMoney
      }
      totalTax {
        ...AccountMoney
      }
      totalPrice {
        ...AccountMoney
      }
      shippingAddress {
        formatted(withName: true, withCompany: true)
      }
      lineItems(first: 50) {
        nodes {
          id
          title
          quantity
          sku
          variantTitle
          image {
            url
            altText
            width
            height
          }
          totalPrice {
            ...AccountMoney
          }
          variantOptions {
            name
            value
          }
        }
      }
    }
  }
` as const;

export function formatAccountMoney(money: AccountMoney | null | undefined) {
  if (!money) return '-';

  return new Intl.NumberFormat('en-US', {
    currency: money.currencyCode,
    style: 'currency',
  }).format(Number(money.amount));
}

export function formatAccountDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function encodeOrderId(id: string) {
  return encodeURIComponent(btoa(id));
}

export function decodeOrderId(id: string) {
  try {
    return atob(decodeURIComponent(id));
  } catch {
    return null;
  }
}
