import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/components/ui/button';
import {
  ProductStatusBadge,
  ProductVisibilityBadge,
  ProductPrice,
  ProductActionsMenu,
  SortHeader,
  formatCount,
  formatDate,
  formatGbCompact,
} from '@/shared/catalog';
import {
  localized,
  type PlanSortField,
  type PlanSummary,
  type SortDirection,
} from '../../domain';
import { planRoutes } from '../routes';

interface PlanTableProps {
  plans: PlanSummary[];
  sortBy: PlanSortField;
  sortDir: SortDirection;
  onSort: (field: PlanSortField) => void;
  reorderable: boolean;
  onMoveUp: (plan: PlanSummary) => void;
  onMoveDown: (plan: PlanSummary) => void;
  onView: (plan: PlanSummary) => void;
  onEdit: (plan: PlanSummary) => void;
  onDuplicate: (plan: PlanSummary) => void;
  onToggleVisibility: (plan: PlanSummary) => void;
  onArchive: (plan: PlanSummary) => void;
  onRestore: (plan: PlanSummary) => void;
  busyId?: string | null;
}

/**
 * PlanTable — the catalog table. Wide by design; it scrolls horizontally inside
 * its own container so the page never does. Built from the shared catalog
 * components (badges, price, actions, sort header); only the columns are plan-specific.
 */
export function PlanTable(props: PlanTableProps) {
  const {
    plans, sortBy, sortDir, onSort, reorderable,
    onMoveUp, onMoveDown, onView, onEdit, onDuplicate,
    onToggleVisibility, onArchive, onRestore, busyId,
  } = props;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[1100px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
            <th className="w-16 px-3 py-2.5 text-left font-medium">Orden</th>
            <SortHeader label="Nombre" field="name" activeField={sortBy} dir={sortDir} onSort={onSort} />
            <th className="px-3 py-2.5 text-left font-medium">Código</th>
            <SortHeader label="Estado" field="status" activeField={sortBy} dir={sortDir} onSort={onSort} />
            <th className="px-3 py-2.5 text-left font-medium">Visible</th>
            <th className="px-3 py-2.5 text-right font-medium">Precio</th>
            <th className="px-3 py-2.5 text-left font-medium">Moneda</th>
            <th className="px-3 py-2.5 text-right font-medium">Invitados</th>
            <th className="px-3 py-2.5 text-right font-medium">Storage</th>
            <th className="px-3 py-2.5 text-right font-medium">Retención</th>
            <th className="px-3 py-2.5 text-right font-medium">Features</th>
            <th className="px-3 py-2.5 text-right font-medium">Addons</th>
            <SortHeader label="Creación" field="createdAt" activeField={sortBy} dir={sortDir} onSort={onSort} />
            <th className="w-12 px-3 py-2.5 text-right font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, index) => {
            const busy = busyId === plan.id;
            return (
              <tr
                key={plan.id}
                className={cn(
                  'border-b transition-colors last:border-0 hover:bg-muted/30',
                  busy && 'opacity-50',
                )}
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      disabled={!reorderable || index === 0 || busy}
                      onClick={() => onMoveUp(plan)}
                      aria-label="Subir"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      disabled={!reorderable || index === plans.length - 1 || busy}
                      onClick={() => onMoveDown(plan)}
                      aria-label="Bajar"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Link
                    to={planRoutes.detail(plan.id)}
                    className="font-medium text-foreground hover:underline"
                  >
                    {localized(plan.name) || 'Sin nombre'}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {plan.code.slice(0, 8)}
                  </code>
                </td>
                <td className="px-3 py-2">
                  <ProductStatusBadge status={plan.status} />
                </td>
                <td className="px-3 py-2">
                  <ProductVisibilityBadge visibility={plan.visibility} />
                </td>
                <td className="px-3 py-2 text-right">
                  <ProductPrice price={plan.primaryPrice} />
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {plan.primaryPrice?.currency ?? '—'}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{formatCount(plan.guests)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatGbCompact(plan.storageBytes)}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {plan.retentionDays === null ? '—' : plan.retentionDays}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{plan.featureCount}</td>
                <td className="px-3 py-2 text-right tabular-nums">{plan.allowedAddonCount}</td>
                <td className="px-3 py-2 text-muted-foreground">{formatDate(plan.createdAt)}</td>
                <td className="px-3 py-2 text-right">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
