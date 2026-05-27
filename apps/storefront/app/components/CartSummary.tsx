import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {Money, type OptimisticCart} from '@shopify/hydrogen';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';
  const checkoutUrl = cart?.checkoutUrl;

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <h4 id="cart-summary">Order summary</h4>
      <dl className="cart-subtotal">
        <dt>Subtotal</dt>
        <dd>
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart?.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      <div className="cart-summary-note">
        Subtotal before shipping and taxes.
      </div>
      {checkoutUrl ? (
        <a className="button primary checkout-link" href={checkoutUrl}>
          Checkout
        </a>
      ) : (
        <button className="checkout-link" disabled type="button">
          Checkout unavailable
        </button>
      )}
    </div>
  );
}
