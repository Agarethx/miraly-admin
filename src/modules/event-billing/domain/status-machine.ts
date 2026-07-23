import { CatalogValidationError } from '@/shared/catalog';
import type { CommercialStatus, EventBilling } from './event-billing';

/**
 * The commercial status machine + business rules for Event Billing. Pure; the
 * repository never transitions without passing through here.
 */
export const ALLOWED_TRANSITIONS: Record<CommercialStatus, readonly CommercialStatus[]> = {
  DRAFT: ['CONFIGURING', 'CANCELLED'],
  CONFIGURING: ['READY_FOR_CHECKOUT', 'DRAFT', 'CANCELLED'],
  READY_FOR_CHECKOUT: ['PENDING_PAYMENT', 'CONFIGURING', 'CANCELLED'],
  PENDING_PAYMENT: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
  ACTIVE: ['EXPIRED', 'CANCELLED'],
  EXPIRED: ['CONFIGURING', 'CANCELLED'],
  CANCELLED: [],
};

export function isTransitionAllowed(from: CommercialStatus, to: CommercialStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Pricing is "present" when an estimate + currency exist. */
export function hasPricing(eb: Pick<EventBilling, 'estimatedPriceMinor' | 'currency'>): boolean {
  return eb.estimatedPriceMinor !== null && eb.currency !== null;
}

/** A plan can be changed only while no paid Order exists (rule prepared for Orders). */
export function canChangePlan(eb: Pick<EventBilling, 'hasPaidOrder'>): boolean {
  return !eb.hasPaidOrder;
}

/** Throws if the plan is frozen by a paid order. */
export function assertCanChangePlan(eb: Pick<EventBilling, 'hasPaidOrder'>): void {
  if (!canChangePlan(eb)) {
    throw new CatalogValidationError('No se puede cambiar el plan: existe una orden pagada.');
  }
}

/**
 * Validates a status transition, enforcing:
 *  - the transition is allowed by the machine,
 *  - ACTIVE requires a selected plan,
 *  - READY_FOR_CHECKOUT requires pricing.
 */
export function assertCanTransition(eb: EventBilling, to: CommercialStatus): void {
  if (!isTransitionAllowed(eb.commercialStatus, to)) {
    throw new CatalogValidationError(
      `Transición no permitida: ${eb.commercialStatus} → ${to}.`,
    );
  }
  if (to === 'ACTIVE' && !eb.selectedPlanId) {
    throw new CatalogValidationError('No se puede activar sin un plan seleccionado.');
  }
  if (to === 'READY_FOR_CHECKOUT' && !hasPricing(eb)) {
    throw new CatalogValidationError('No se puede marcar listo para checkout sin pricing calculado.');
  }
}
