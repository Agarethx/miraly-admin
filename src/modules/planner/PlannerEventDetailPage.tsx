import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Images, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge, type BadgeTone } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/shared/components/ui/dialog';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatMoney } from '@/shared/catalog';
import { getErrorMessage } from '@/shared/utils/errors';
import {
  useEventDetail, useEventSubscription, useCanTransfer, useTransferDirect,
} from './use-planner-event-detail';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', active: 'Activo', closed: 'Cerrado', archived: 'Archivado',
};
const STATUS_TONE: Record<string, BadgeTone> = {
  draft: 'neutral', active: 'solid', closed: 'neutral', archived: 'neutral',
};

function formatDate(iso: string | null): string {
  if (!iso) return 'Fecha por definir';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? 'Fecha por definir'
    : d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

function gb(bytes: number | null | undefined): string {
  if (bytes == null) return '—';
  return `${Math.round(bytes / 1024 ** 3)} GB`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function PlannerEventDetailPage() {
  const { eventId = '' } = useParams();
  const navigate = useNavigate();

  const detail = useEventDetail(eventId);
  const sub = useEventSubscription(eventId);
  const canTransfer = useCanTransfer(eventId);
  const transfer = useTransferDirect();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');

  async function confirmTransfer(e: FormEvent) {
    e.preventDefault();
    const clean = email.trim();
    if (!clean) return;
    try {
      await transfer.mutateAsync({ eventId, email: clean });
      setOpen(false);
      setEmail('');
    } catch {
      /* error toast handled in the hook */
    }
  }

  if (detail.isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>;
  }
  if (detail.isError || !detail.data) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No se pudo cargar el evento"
        description={getErrorMessage(detail.error)}
        action={<Button variant="outline" onClick={() => navigate('/planner')}>Volver</Button>}
      />
    );
  }

  const ev = detail.data;
  const s = sub.data;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => navigate('/planner')}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Mis eventos
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{ev.name}</h1>
          <Badge tone={STATUS_TONE[ev.status] ?? 'neutral'}>{STATUS_LABEL[ev.status] ?? ev.status}</Badge>
        </div>
      </div>

      {/* Event data */}
      <Card>
        <CardHeader>
          <CardTitle>Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <DetailRow label="Fecha" value={formatDate(ev.eventDate)} />
          <DetailRow label="Lugar" value={ev.venue || '—'} />
          <DetailRow label="Dirección" value={ev.address || '—'} />
          {ev.description ? (
            <div className="pt-2 text-sm">
              <p className="text-muted-foreground">Descripción</p>
              <p className="mt-1 whitespace-pre-wrap">{ev.description}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sub.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando plan…</p>
          ) : sub.isError ? (
            <p className="text-sm text-muted-foreground">No se pudo cargar el plan.</p>
          ) : !s?.hasSubscription ? (
            <p className="text-sm text-muted-foreground">Sin plan activo. Activá el evento para elegir un plan.</p>
          ) : (
            <>
              <DetailRow label="Plan" value={s.planName || '—'} />
              <DetailRow label="Estado" value={s.status || '—'} />
              <DetailRow label="Invitados" value={s.participants != null ? String(s.participants) : '—'} />
              <DetailRow label="Almacenamiento" value={gb(s.storageBytes)} />
              <DetailRow label="Retención" value={s.retentionDays != null ? `${s.retentionDays} días` : '—'} />
              {s.priceMinor != null && s.currency ? (
                <DetailRow label="Pagado" value={formatMoney({ currency: s.currency, amountMinor: s.priceMinor, region: null })} />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" disabled>
          <Images className="size-4" /> Ver galería (próximamente)
        </Button>

        {canTransfer.data === true ? (
          <Button onClick={() => setOpen(true)}>Transferir evento</Button>
        ) : canTransfer.data === false ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" /> Transferido — sos administrador de este evento.
          </span>
        ) : null}
      </div>

      {/* Transfer dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={confirmTransfer}>
            <DialogHeader>
              <DialogTitle>Transferir evento</DialogTitle>
              <DialogDescription>
                El cliente pasará a ser el dueño del evento. Vos seguís como administrador
                (el evento queda en tu portafolio).
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Input
                type="email"
                placeholder="email@delcliente.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={transfer.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={transfer.isPending || !email.trim()}>
                {transfer.isPending ? 'Transfiriendo…' : 'Transferir'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
