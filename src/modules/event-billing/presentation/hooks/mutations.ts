import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/utils/errors';
import { useNotifications } from '@/shared/providers/NotificationProvider';
import { configureEventBilling, transitionEventBilling } from '../../application';
import { billingCatalogRepository, eventBillingRepository } from '../../infrastructure';
import type { CommercialStatus, EventBillingConfig } from '../../domain';
import { billingKeys } from './query-keys';

/**
 * useConfigureEventBilling — saves the plan + addons configuration (no payment).
 * Invalidates the event's billing + the account's events so the UI reflects the
 * new snapshot. Optimistic isn't applied because the server computes the snapshot.
 */
export function useConfigureEventBilling(eventId: string, accountId: string) {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: (config: EventBillingConfig) =>
      configureEventBilling(eventBillingRepository, billingCatalogRepository, { eventId, accountId, config }),
    onSuccess: (eb) => {
      void queryClient.invalidateQueries({ queryKey: billingKeys.eventBilling(eventId) });
      void queryClient.invalidateQueries({ queryKey: billingKeys.accountEvents(accountId) });
      void queryClient.setQueryData(billingKeys.eventBilling(eventId), eb);
      success('Configuración de billing guardada.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });
}

/** useTransitionEventBilling — a validated commercial status change. */
export function useTransitionEventBilling(eventId: string) {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: ({ id, to }: { id: string; to: CommercialStatus }) =>
      transitionEventBilling(eventBillingRepository, id, to),
    onSuccess: (eb) => {
      void queryClient.setQueryData(billingKeys.eventBilling(eventId), eb);
      void queryClient.invalidateQueries({ queryKey: billingKeys.accounts });
      success('Estado actualizado.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });
}
