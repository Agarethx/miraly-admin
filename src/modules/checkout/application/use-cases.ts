import { CheckoutValidationError, type CheckoutData, type CheckoutPreview } from '../domain';
import type { CheckoutGateway, PlaceOrderInput } from './ports';

export function loadCheckout(gateway: CheckoutGateway, eventBillingId: string): Promise<CheckoutData> {
  return gateway.load(eventBillingId);
}

export function previewCheckout(
  gateway: CheckoutGateway,
  planId: string | null,
  addonIds: string[],
  currency: string,
): Promise<CheckoutPreview> {
  return gateway.computePreview(planId, addonIds, currency);
}

/**
 * PlaceOrder — the checkout's confirm action. Validates the pre-conditions, then
 * delegates to the gateway (persist selection → ready-for-checkout → generate
 * Order). Never charges: the Order ends in PENDING_PAYMENT.
 */
export function placeOrder(
  gateway: CheckoutGateway,
  input: PlaceOrderInput,
  termsAccepted: boolean,
): Promise<{ orderId: string }> {
  if (!input.planId) {
    throw new CheckoutValidationError('Elige un plan antes de generar la orden.');
  }
  if (!termsAccepted) {
    throw new CheckoutValidationError('Debes aceptar los términos y condiciones.');
  }
  return gateway.placeOrder(input);
}

export function cancelOpenOrder(gateway: CheckoutGateway, orderId: string): Promise<void> {
  return gateway.cancelOpenOrder(orderId);
}
