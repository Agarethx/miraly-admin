import type { ProductStatus } from '../product';
import { Badge, type BadgeTone } from '@/shared/components/ui/badge';

const STATUS: Record<ProductStatus, { label: string; tone: BadgeTone; dot: boolean }> = {
  active: { label: 'Activo', tone: 'accent', dot: true },
  draft: { label: 'Borrador', tone: 'neutral', dot: false },
  archived: { label: 'Archivado', tone: 'danger', dot: false },
};

/** Lifecycle status badge for any catalog product. */
export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const { label, tone, dot } = STATUS[status];
  return (
    <Badge tone={tone} dot={dot}>
      {label}
    </Badge>
  );
}
