import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/utils/errors';
import { useNotifications } from '@/shared/providers/NotificationProvider';
import { cancelOpenOrder, loadCheckout, placeOrder, previewCheckout, type PlaceOrderInput } from '../application';
import { checkoutGateway } from '../infrastructure';

const checkoutKeys = {
  data: (eventBillingId: string) => ['checkout', 'data', eventBillingId] as const,
  preview: (planId: string | null, addonIds: string[], currency: string) =>
    ['checkout', 'preview', planId, [...addonIds].sort(), currency] as const,
};

/** useCheckout — loads the checkout data (event billing + addons + open order). */
export function useCheckout(eventBillingId: string | undefined) {
  return useQuery({
    queryKey: checkoutKeys.data(eventBillingId ?? ''),
    queryFn: () => loadCheckout(checkoutGateway, eventBillingId as string),
    enabled: Boolean(eventBillingId),
  });
}

/** useCheckoutPreview — recomputes the breakdown + entitlements for a selection. */
export function useCheckoutPreview(planId: string | null, addonIds: string[], currency: string) {
  return useQuery({
    queryKey: checkoutKeys.preview(planId, addonIds, currency),
    queryFn: () => previewCheckout(checkoutGateway, planId, addonIds, currency),
    placeholderData: keepPreviousData,
    enabled: Boolean(currency),
  });
}

/** usePlaceOrder — validates + persists selection + generates the Order (PENDING_PAYMENT). */
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: (vars: { input: PlaceOrderInput; termsAccepted: boolean }) =>
      placeOrder(checkoutGateway, vars.input, vars.termsAccepted),
    onSuccess: (_result, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      void queryClient.invalidateQueries({ queryKey: checkoutKeys.data(vars.input.eventBillingId) });
      success('Orden generada.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });
}

/** useCancelOpenOrder — cancels the open order so the user can edit and regenerate. */
export function useCancelOpenOrder(eventBillingId: string) {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: (orderId: string) => cancelOpenOrder(checkoutGateway, orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: checkoutKeys.data(eventBillingId) });
      void queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      success('Orden cancelada. Puedes editar y volver a generar.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });
}
