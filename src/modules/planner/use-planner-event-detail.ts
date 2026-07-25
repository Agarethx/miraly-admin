import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/services/supabase';
import { useNotifications } from '@/shared/providers/NotificationProvider';
import { getErrorMessage } from '@/shared/utils/errors';
import { callFunction } from './functions-client';

export interface EventDetail {
  id: string;
  name: string;
  eventDate: string | null;
  status: string;
  venue: string | null;
  address: string | null;
  description: string | null;
}

export interface EventSubscription {
  hasSubscription: boolean;
  status?: string;
  planName?: string | null;
  currency?: string | null;
  participants?: number | null;
  storageBytes?: number | null;
  retentionDays?: number | null;
  priceMinor?: number | null;
  payment?: { status: string; at: string | null } | null;
}

/** The event (RLS event.view scopes it to the planner). */
export function useEventDetail(eventId: string) {
  return useQuery({
    queryKey: ['planner', 'event', eventId],
    enabled: !!eventId,
    queryFn: async (): Promise<EventDetail> => {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, event_date, status, venue, address, description')
        .eq('id', eventId)
        .is('deleted_at', null)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Evento no encontrado.');
      return {
        id: data.id,
        name: data.name,
        eventDate: data.event_date,
        status: data.status,
        venue: data.venue,
        address: data.address,
        description: data.description,
      };
    },
  });
}

/** Plan / entitlements for the event (billing-subscription Edge Function). */
export function useEventSubscription(eventId: string) {
  return useQuery({
    queryKey: ['planner', 'subscription', eventId],
    enabled: !!eventId,
    queryFn: () => callFunction<EventSubscription>('billing-subscription', { body: { eventId } }),
  });
}

/** Whether the current user may transfer this event (true only for the OWNER). */
export function useCanTransfer(eventId: string) {
  return useQuery({
    queryKey: ['planner', 'can-transfer', eventId],
    enabled: !!eventId,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc('has_event_permission', {
        p_event_id: eventId,
        p_permission: 'ownership.transfer',
      });
      if (error) throw error;
      return data === true;
    },
  });
}

function transferErrorMessage(e: unknown): string {
  const code = (e as { code?: string } | null)?.code;
  if (code === 'P0002') return 'Ese cliente no tiene cuenta registrada.';
  if (code === '42501') return 'No estás autorizado a transferir este evento.';
  return getErrorMessage(e);
}

/** Direct transfer (keeps the planner as MANAGER = portfolio access). */
export function useTransferDirect() {
  const qc = useQueryClient();
  const { success, error } = useNotifications();
  return useMutation({
    mutationFn: async (vars: { eventId: string; email: string }) => {
      const { error: e } = await supabase.rpc('ownership_transfer_direct', {
        p_event_id: vars.eventId,
        p_to_email: vars.email,
        p_retain_role: 'MANAGER',
        p_billing_handover: 'KEEP_SENDER',
      });
      if (e) throw e;
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['planner', 'event', vars.eventId] });
      void qc.invalidateQueries({ queryKey: ['planner', 'can-transfer', vars.eventId] });
      void qc.invalidateQueries({ queryKey: ['planner', 'events'] });
      success(`Transferido a ${vars.email}.`);
    },
    onError: (e) => error(transferErrorMessage(e)),
  });
}
