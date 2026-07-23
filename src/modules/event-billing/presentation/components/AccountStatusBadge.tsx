import { Badge, type BadgeTone } from '@/shared/components/ui/badge';
import type { AccountStatus } from '../../domain';

const STATUS: Record<AccountStatus, { label: string; tone: BadgeTone; dot: boolean }> = {
  active: { label: 'Activa', tone: 'accent', dot: true },
  suspended: { label: 'Suspendida', tone: 'danger', dot: false },
  closed: { label: 'Cerrada', tone: 'neutral', dot: false },
};

/** Badge for a billing account's status. */
export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const { label, tone, dot } = STATUS[status];
  return <Badge tone={tone} dot={dot}>{label}</Badge>;
}
