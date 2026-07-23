import { Badge, type BadgeTone } from '@/shared/components/ui/badge';
import type { CommercialStatus } from '../../domain';

const STATUS: Record<CommercialStatus, { label: string; tone: BadgeTone; dot: boolean }> = {
  DRAFT: { label: 'Borrador', tone: 'neutral', dot: false },
  CONFIGURING: { label: 'Configurando', tone: 'solid', dot: false },
  READY_FOR_CHECKOUT: { label: 'Listo p/ checkout', tone: 'accent', dot: false },
  PENDING_PAYMENT: { label: 'Pago pendiente', tone: 'accent', dot: true },
  ACTIVE: { label: 'Activo', tone: 'accent', dot: true },
  EXPIRED: { label: 'Expirado', tone: 'danger', dot: false },
  CANCELLED: { label: 'Cancelado', tone: 'danger', dot: false },
};

/** Badge for the commercial (configuration) status of an event billing. */
export function CommercialStatusBadge({ status }: { status: CommercialStatus }) {
  const { label, tone, dot } = STATUS[status];
  return <Badge tone={tone} dot={dot}>{label}</Badge>;
}
