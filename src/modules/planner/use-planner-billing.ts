import { useMutation, useQuery } from '@tanstack/react-query';
import { callFunction } from './functions-client';

export interface CatalogPlan {
  id: string;
  name: string;
  currency: string;
  /** Standard catalog price (reference only; the checkout returns the authoritative planner price). */
  priceMinor: number;
}

interface CatalogResponse {
  plans: CatalogPlan[];
}

export interface CheckoutResult {
  orderId: string;
  totalMinor: number;
  currency: string;
}

export interface FlowSession {
  redirectUrl: string;
  token: string;
}

/** Sellable plans (billing-catalog). Reference prices; planner price comes from checkout. */
export function useCatalog() {
  return useQuery({
    queryKey: ['planner', 'catalog'],
    queryFn: async () => {
      const data = await callFunction<CatalogResponse>('billing-catalog', { method: 'GET' });
      return data.plans ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Prices the checkout for (event, plan). totalMinor is the authoritative PLANNER price. */
export function useCheckout() {
  return useMutation({
    mutationFn: (vars: { eventId: string; planId: string }) =>
      callFunction<CheckoutResult>('billing-checkout', {
        body: { eventId: vars.eventId, planId: vars.planId, addonIds: [] },
      }),
  });
}

/** Creates the Flow payment session for an order and returns its redirect URL. */
export function useCreateFlowPayment() {
  return useMutation({
    mutationFn: (orderId: string) =>
      callFunction<FlowSession>('flow-payment-create', { body: { orderId } }),
  });
}
