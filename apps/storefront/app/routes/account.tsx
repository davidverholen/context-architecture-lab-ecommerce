import {
  data,
  Form,
  Link,
  useLoaderData,
  type HeadersFunction,
} from 'react-router';
import type {Route} from './+types/account';
import {
  CUSTOMER_ACCOUNT_NO_STORE_HEADERS,
  rethrowCustomerAccountNoStore,
} from '~/lib/customerAccountRoutes';
import {
  CUSTOMER_ACCOUNT_QUERY,
  encodeOrderId,
  formatAccountDate,
  formatAccountMoney,
  type CustomerAccountQueryData,
} from '~/graphql/customerAccount';

export const headers: HeadersFunction = ({loaderHeaders}) => loaderHeaders;

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Context Home | Account'},
    {
      name: 'description',
      content: 'View your Context Home account and Shopify order history.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  let accountResult;

  try {
    accountResult =
      await context.customerAccount.query<CustomerAccountQueryData>(
        CUSTOMER_ACCOUNT_QUERY,
        {
          variables: {first: 10},
        },
      );
  } catch (error) {
    rethrowCustomerAccountNoStore(error);
  }

  const {data: account, errors} = accountResult;

  if (errors?.length || !account?.customer) {
    throw new Response('Account not found', {status: 404});
  }

  return data(
    {
      customer: account.customer,
    },
    {headers: CUSTOMER_ACCOUNT_NO_STORE_HEADERS},
  );
}

export default function Account() {
  const {customer} = useLoaderData<typeof loader>();
  const orders = customer.orders.nodes;
  const email = customer.emailAddress?.emailAddress;
  const greeting =
    customer.firstName || customer.displayName || email || 'Your account';

  return (
    <div className="account page-shell">
      <section className="account-hero">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Welcome back, {greeting}.</h1>
          {email ? <p>{email}</p> : null}
        </div>
        <Form action="/account/logout" method="post">
          <button className="button secondary" type="submit">
            Sign out
          </button>
        </Form>
      </section>

      <section className="account-panel" aria-labelledby="account-orders">
        <div className="account-panel-heading">
          <div>
            <p className="eyebrow">Orders</p>
            <h2 id="account-orders">Recent orders</h2>
          </div>
        </div>

        {orders.length ? (
          <div className="account-order-list">
            {orders.map((order) => (
              <article className="account-order-card" key={order.id}>
                <div>
                  <h3>{order.name}</h3>
                  <p>{formatAccountDate(order.processedAt)}</p>
                  <div className="account-order-lines">
                    {order.lineItems.nodes.map((line) => (
                      <span key={`${order.id}-${line.title}`}>
                        {line.quantity} x {line.title}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="account-order-summary">
                  <strong>{formatAccountMoney(order.totalPrice)}</strong>
                  <span>{formatStatus(order.fulfillmentStatus)}</span>
                  <Link
                    className="button secondary"
                    to={`/account/orders/${encodeOrderId(order.id)}`}
                  >
                    View order
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No orders yet.</h2>
            <p>When Shopify has orders for this customer, they appear here.</p>
            <Link className="button primary" to="/collections/all">
              Continue shopping
            </Link>
          </div>
        )}
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
