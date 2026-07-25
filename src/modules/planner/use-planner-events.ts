import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/services/supabase';

export interface PlannerEvent {
  id: string;
  name: string;
  eventDate: string | null;
  status: string;
  venue: string | null;
}

/**
 * The planner's own events. RLS (`has_event_permission(id,'event.view')`) scopes
 * the rows to the caller automatically — do NOT filter by organizer_id here;
 * trust the policy (it also covers events the planner retained as MANAGER).
 */
async function fetchMyEvents(): Promise<PlannerEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('id, name, event_date, status, venue')
    .is('deleted_at', null)
    .order('event_date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    eventDate: e.event_date,
    status: e.status,
    venue: e.venue,
  }));
}

export function useMyEvents() {
  return useQuery({ queryKey: ['planner', 'events'], queryFn: fetchMyEvents });
}
