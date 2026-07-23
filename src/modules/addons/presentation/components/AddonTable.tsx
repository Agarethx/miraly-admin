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
  type AddonSortField,
  type AddonSummary,
  type SortDirection,
} from '../../domain';
import { addonRoutes } from '../routes';

interface AddonTableProps {
  addons: AddonSummary[];
  sortBy: AddonSortField;
  sortDir: SortDirection;
  onSort: (field: AddonSortField) => void;
  reorderable: boolean;
  onMoveUp: (addon: AddonSummary) => void;
  onMoveDown: (addon: AddonSummary) => void;
  onView: (addon: AddonSummary) => void;
  onEdit: (addon: AddonSummary) => void;
  onDuplicate: (addon: AddonSummary) => void;
  onToggleVisibility: (addon: AddonSummary) => void;
  onArchive: (addon: AddonSummary) => void;
  onRestore: (addon: AddonSummary) => void;
  busyId?: string | null;
}

/**
 * AddonTable — the catalog table for addons. Same design as PlanTable (shared
 * badges/price/actions/sort header); only the columns differ: increments
 * ("Participantes") and "Planes compatibles" instead of features/addons counts.
 */
export function AddonTable(props: AddonTableProps) {
  const {
    addons, sortBy, sortDir, onSort, reorderable,
    onMoveUp, onMoveDown, onView, onEdit, onDuplicate,
    onToggleVisibility, onArchive, onRestore, busyId,
  } = props;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[1080px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
            <th className="w-16 px-3 py-2.5 text-left font-medium">Orden</th>
            <SortHeader label="Nombre" field="name" activeField={sortBy} dir={sortDir} onSort={onSort} />
            <th className="px-3 py-2.5 text-left font-medium">Código</th>
            <SortHeader label="Estado" field="status" activeField={sortBy} dir={sortDir} onSort={onSort} />
            <th className="px-3 py-2.5 text-left font-medium">Visible</th>
            <th className="px-3 py-2.5 text-right font-medium">Precio</th>
            <th className="px-3 py-2.5 text-left font-medium">Moneda</th>
            <th className="px-3 py-2.5 text-right font-medium">Participantes</th>
            <th className="px-3 py-2.5 text-right font-medium">Storage</th>
            <th className="px-3 py-2.5 text-right font-medium">Retención</th>
            <th className="px-3 py-2.5 text-right font-medium">Planes</th>
            <SortHeader label="Creación" field="createdAt" activeField={sortBy} dir={sortDir} onSort={onSort} />
            <th className="w-12 px-3 py-2.5 text-right font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {addons.map((addon, index) => {
            const busy = busyId === addon.id;
            const inc = (v: number | null) => (v === null ? '—' : `+${formatCount(v)}`);
            return (
              <tr
                key={addon.id}
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
                      onClick={() => onMoveUp(addon)}
                      aria-label="Subir"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      disabled={!reorderable || index === addons.length - 1 || busy}
                      onClick={() => onMoveDown(addon)}
                      aria-label="Bajar"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Link
                    to={addonRoutes.detail(addon.id)}
                    className="font-medium text-foreground hover:underline"
                  >
                    {localized(addon.name) || 'Sin nombre'}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {addon.code.slice(0, 8)}
                  </code>
                </td>
                <td className="px-3 py-2">
                  <ProductStatusBadge status={addon.status} />
                </td>
                <td className="px-3 py-2">
                  <ProductVisibilityBadge visibility={addon.visibility} />
                </td>
                <td className="px-3 py-2 text-right">
                  <ProductPrice price={addon.primaryPrice} />
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {addon.primaryPrice?.currency ?? '—'}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{inc(addon.participants)}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {addon.storageBytes === null ? '—' : `+${formatGbCompact(addon.storageBytes)}`}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{inc(addon.retentionDays)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{addon.compatiblePlanCount}</td>
                <td className="px-3 py-2 text-muted-foreground">{formatDate(addon.createdAt)}</td>
                <td className="px-3 py-2 text-right">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
