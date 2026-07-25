import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge, type BadgeTone } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { getErrorMessage } from '@/shared/utils/errors';
import { useMyEvents, type PlannerEvent } from './use-planner-events';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  closed: 'Cerrado',
  archived: 'Archivado',
};

const STATUS_TONE: Record<string, BadgeTone> = {
  draft: 'neutral',
  active: 'solid',
  closed: 'neutral',
  archived: 'neutral',
};

function formatDate(iso: string | null): string {
  if (!iso) return 'Fecha por definir';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Fecha por definir';
  return d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

function EventRow({ event, onOpen, onPay }: { event: PlannerEvent; onOpen: () => void; onPay: () => void }) {
  return (
    <Card onClick={onOpen} className="cursor-pointer transition-colors hover:bg-secondary/40">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{event.name}</p>
          <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" /> {formatDate(event.eventDate)}
            </span>
            {event.venue ? (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="size-3.5" /> {event.venue}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge tone={STATUS_TONE[event.status] ?? 'neutral'}>
            {STATUS_LABEL[event.status] ?? event.status}
          </Badge>
          {event.status === 'draft' ? (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPay();
              }}
            >
              Activar / Pagar
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function PlannerEventsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch, isFetching } = useMyEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Mis eventos</h1>
          <p className="text-sm text-muted-foreground">Los eventos que administras como planner.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Flow returns to a generic page, not the portal: this refetch (plus
              refetch-on-focus) reflects the event turning "active" after payment. */}
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className="size-4" /> Actualizar
          </Button>
          <Button onClick={() => navigate('/planner/events/new')}>
            <Plus className="size-4" /> Crear evento
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="No se pudieron cargar tus eventos"
          description={getErrorMessage(error)}
        />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Todavía no tienes eventos"
          description="Cuando crees o te transfieran un evento, aparecerá aquí."
        />
      ) : (
        <div className="space-y-3">
          {data!.map((e) => (
            <EventRow
              key={e.id}
              event={e}
              onOpen={() => navigate(`/planner/events/${e.id}`)}
              onPay={() => navigate(`/planner/events/${e.id}/pay`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
