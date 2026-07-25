import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/shared/providers/NotificationProvider';
import { getErrorMessage } from '@/shared/utils/errors';
import { callFunction } from './functions-client';

export interface CreateEventInput {
  name: string;
  /** Full ISO-8601 datetime (event-create validates z.string().datetime()). */
  eventDate?: string;
  venue?: string;
  address?: string;
  description?: string;
}

/**
 * Creates an event via the event-create Edge Function (through the CORS-safe
 * callFunction helper). event-create sets organizer_id from the planner's JWT;
 * the client can never nominate an owner. The event is born `draft`.
 */
export function useCreateEvent() {
  const qc = useQueryClient();
  const { success, error } = useNotifications();
  return useMutation({
    mutationFn: (input: CreateEventInput) => callFunction('event-create', { body: input }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['planner', 'events'] });
      success('Evento creado.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });
}
