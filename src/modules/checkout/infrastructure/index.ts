import type { CheckoutGateway } from '../application';
import { DefaultCheckoutGateway } from './checkout-gateway';

/** Composition root for the Checkout module. */
export const checkoutGateway: CheckoutGateway = new DefaultCheckoutGateway();
