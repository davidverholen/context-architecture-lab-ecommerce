import {data, Link, useLoaderData, type HeadersFunction} from 'react-router';
import type {Route} from './+types/account_.orders.$orderId';
import {
  CUSTOMER_ACCOUNT_NO_STORE_HEADERS,
  rethrowCustomerAccountNoStore,
} from '~/lib/customerAccountRoutes';
import {
  CUSTOMER_ORDER_QUERY,
  decodeOrderId,
  formatAccountDate,
  formatAccountMoney,
  type CustomerOrderQueryData,
} from '~/graphql/customerAccount';

export const headers: HeadersFunction = ({loaderHeaders}) => loaderHeaders;

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Context Home | ${data?.order.name ?? 'Order'}`}];
};

export async function loader({context, params}: Route.LoaderArgs) {
  if (!params.orderId) {
    throw new Response('Order not found', {status: 404});
  }

  const orderId = decodeOrderId(params.orderId);
  if (!orderId) {
    throw new Response('Order not found', {status: 404});
  }

  let orderResult;

  try {
    orderResult = await context.customerAccount.query<CustomerOrderQueryData>(
      CUSTOMER_ORDER_QUERY,
      {
        variables: {orderId},
      },
    );
  } catch (error) {
    rethrowCustomerAccountNoStore(error);
  }

  const {data: result, errors} = orderResult;

  if (
    errors?.length ||
    !result?.order ||
    !result.order.customer ||
    result.order.customer.id !== result.customer.id
  ) {
    throw new Response('Order not found', {status: 404});
  }

  return data(
    {order: result.order},
    {headers: CUSTOMER_ACCOUNT_NO_STORE_HEADERS},
  );
}

export default function AccountOrder() {
  const {order} = useLoaderData<typeof loader>();

  return (
    <div className="account page-shell">
      <Link className="account-back-link" to="/account">
        Back to account
      </Link>
      <section className="account-hero">
        <div>
          <p className="eyebrow">Order</p>
          <h1>{order.name}</h1>
          <p>
            Placed {formatAccountDate(order.processedAt)} |{' '}
            {formatStatus(order.fulfillmentStatus)}
          </p>
        </div>
        <a className="button secondary" href={order.statusPageUrl}>
          Shopify status
        </a>
      </section>

      <section className="account-panel account-order-detail">
        <div className="account-order-items">
          <h2>Items</h2>
          {order.lineItems.nodes.map((line) => (
            <article className="account-line-item" key={line.id}>
              {line.image ? (
                <img
                  alt={line.image.altText ?? line.title}
                  height={line.image.height ?? 120}
                  src={line.image.url}
                  width={line.image.width ?? 120}
                />
              ) : (
                <div className="account-line-placeholder" aria-hidden="true" />
              )}
              <div>
                <h3>{line.title}</h3>
                {line.variantTitle ? <p>{line.variantTitle}</p> : null}
                {line.sku ? <p>SKU {line.sku}</p> : null}
                <p>Quantity {line.quantity}</p>
              </div>
              <strong>{formatAccountMoney(line.totalPrice)}</strong>
            </article>
          ))}
        </div>

        <div className="account-order-totals">
          <h2>Summary</h2>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatAccountMoney(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{formatAccountMoney(order.totalShipping)}</dd>
            </div>
            <div>
              <dt>Tax</dt>
              <dd>{formatAccountMoney(order.totalTax)}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{formatAccountMoney(order.totalPrice)}</dd>
            </div>
          </dl>
          {order.shippingAddress?.formatted.length ? (
            <div className="account-address">
              <h3>Shipping address</h3>
              {order.shippingAddress.formatted.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
