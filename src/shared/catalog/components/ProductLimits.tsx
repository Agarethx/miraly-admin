import { Users, HardDrive, CalendarClock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatBytes, formatCount, formatDays } from '../format';

export interface LimitLabels {
  guests: string;
  storage: string;
  retention: string;
}

const DEFAULT_LABELS: LimitLabels = {
  guests: 'Invitados',
  storage: 'Almacenamiento',
  retention: 'Retención',
};

interface ProductLimitsProps {
  guests: number | null;
  storageBytes: number | null;
  retentionDays: number | null;
  /** `inline` = compact row; `stack` = labeled cards. */
  variant?: 'inline' | 'stack';
  /** Override labels (e.g. Addon uses "Participantes"). */
  labels?: LimitLabels;
  /** When true, values are increments and render with a leading "+". */
  increment?: boolean;
  className?: string;
}

interface Item {
  icon: LucideIcon;
  label: string;
  value: string;
}

/** The three quantitative dimensions of a product (guests/storage/retention). */
export function ProductLimits({
  guests,
  storageBytes,
  retentionDays,
  variant = 'inline',
  labels = DEFAULT_LABELS,
  increment = false,
  className,
}: ProductLimitsProps) {
  const plus = (raw: string, present: boolean) => (increment && present ? `+${raw}` : raw);
  const items: Item[] = [
    { icon: Users, label: labels.guests, value: plus(formatCount(guests), guests !== null) },
    { icon: HardDrive, label: labels.storage, value: plus(formatBytes(storageBytes), storageBytes !== null) },
    { icon: CalendarClock, label: labels.retention, value: plus(formatDays(retentionDays), retentionDays !== null) },
  ];

  if (variant === 'stack') {
    return (
      <dl className={cn('grid gap-3 sm:grid-cols-3', className)}>
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-md border p-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="size-3.5" />
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-4 text-sm', className)}>
      {items.map(({ icon: Icon, label, value }) => (
        <span key={label} className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="size-3.5" />
          <span className="tabular-nums text-foreground">{value}</span>
        </span>
      ))}
    </div>
  );
}
