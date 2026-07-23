import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/cn';
import {
  ProductStatusBadge,
  ProductVisibilityBadge,
  ProductPrice,
  ProductLimits,
  ProductActionsMenu,
  formatDate,
} from '@/shared/catalog';
import { localized, type PlanSummary } from '../../domain';
import { planRoutes } from '../routes';
import { PlanFeatures } from './PlanFeatures';

interface PlanCardProps {
  plan: PlanSummary;
  onView: (plan: PlanSummary) => void;
  onEdit: (plan: PlanSummary) => void;
  onDuplicate: (plan: PlanSummary) => void;
  onToggleVisibility: (plan: PlanSummary) => void;
  onArchive: (plan: PlanSummary) => void;
  onRestore: (plan: PlanSummary) => void;
  busy?: boolean;
}

/** PlanCard — the card form of a plan row for the responsive (mobile) list. */
export function PlanCard(props: PlanCardProps) {
  const {
    plan, onView, onEdit, onDuplicate, onToggleVisibility, onArchive, onRestore, busy,
  } = props;

  return (
    <Card className={cn('transition-opacity', busy && 'opacity-50')}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <Link
              to={planRoutes.detail(plan.id)}
              className="block truncate font-medium hover:underline"
            >
              {localized(plan.name) || 'Sin nombre'}
            </Link>
            <code className="font-mono text-xs text-muted-foreground">{plan.code.slice(0, 8)}</code>
          </div>
          <ProductActionsMenu
            product={plan}
            disabled={busy}
            onView={() => onView(plan)}
            onEdit={() => onEdit(plan)}
            onDuplicate={() => onDuplicate(plan)}
            onToggleVisibility={() => onToggleVisibility(plan)}
            onArchive={() => onArchive(plan)}
            onRestore={() => onRestore(plan)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ProductStatusBadge status={plan.status} />
          <ProductVisibilityBadge visibility={plan.visibility} />
          <ProductPrice price={plan.primaryPrice} showCurrency className="ml-auto font-medium" />
        </div>

        <ProductLimits
          guests={plan.guests}
          storageBytes={plan.storageBytes}
          retentionDays={plan.retentionDays}
        />

        <div className="flex items-center justify-between border-t pt-3">
          <PlanFeatures featureCount={plan.featureCount} allowedAddonCount={plan.allowedAddonCount} />
          <span className="text-xs text-muted-foreground">{formatDate(plan.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
