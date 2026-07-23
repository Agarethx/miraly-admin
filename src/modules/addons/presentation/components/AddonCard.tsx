import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/cn';
import {
  ProductStatusBadge,
  ProductVisibilityBadge,
  ProductPrice,
  ProductLimits,
  ProductActionsMenu,
  formatDate,
  type LimitLabels,
} from '@/shared/catalog';
import { localized, type AddonSummary } from '../../domain';
import { addonRoutes } from '../routes';

interface AddonCardProps {
  addon: AddonSummary;
  onView: (addon: AddonSummary) => void;
  onEdit: (addon: AddonSummary) => void;
  onDuplicate: (addon: AddonSummary) => void;
  onToggleVisibility: (addon: AddonSummary) => void;
  onArchive: (addon: AddonSummary) => void;
  onRestore: (addon: AddonSummary) => void;
  busy?: boolean;
}

const ADDON_LIMIT_LABELS: LimitLabels = {
  guests: 'Participantes',
  storage: 'Almacenamiento',
  retention: 'Retención',
};

/** AddonCard — the card form of an addon row for the responsive (mobile) list. */
export function AddonCard(props: AddonCardProps) {
  const {
    addon, onView, onEdit, onDuplicate, onToggleVisibility, onArchive, onRestore, busy,
  } = props;

  return (
    <Card className={cn('transition-opacity', busy && 'opacity-50')}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <Link
              to={addonRoutes.detail(addon.id)}
              className="block truncate font-medium hover:underline"
            >
              {localized(addon.name) || 'Sin nombre'}
            </Link>
            <code className="font-mono text-xs text-muted-foreground">{addon.code.slice(0, 8)}</code>
          </div>
          <ProductActionsMenu
            product={addon}
            disabled={busy}
            onView={() => onView(addon)}
            onEdit={() => onEdit(addon)}
            onDuplicate={() => onDuplicate(addon)}
            onToggleVisibility={() => onToggleVisibility(addon)}
            onArchive={() => onArchive(addon)}
            onRestore={() => onRestore(addon)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ProductStatusBadge status={addon.status} />
          <ProductVisibilityBadge visibility={addon.visibility} />
          <ProductPrice price={addon.primaryPrice} showCurrency className="ml-auto font-medium" />
        </div>

        <ProductLimits
          guests={addon.participants}
          storageBytes={addon.storageBytes}
          retentionDays={addon.retentionDays}
          labels={ADDON_LIMIT_LABELS}
          increment
        />

        <div className="flex items-center justify-between border-t pt-3">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Layers className="size-3.5" />
            <span className="tabular-nums text-foreground">{addon.compatiblePlanCount}</span> planes
          </span>
          <span className="text-xs text-muted-foreground">{formatDate(addon.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
