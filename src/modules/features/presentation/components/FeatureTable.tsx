import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/components/ui/button';
import { ProductStatusBadge, SortHeader, formatDate } from '@/shared/catalog';
import type { Feature, FeatureSortField, SortDirection } from '../../domain';
import { featureRoutes } from '../routes';
import { FeatureValueTypeBadge } from './FeatureValueTypeBadge';
import { FeatureActionsMenu } from './FeatureActionsMenu';

interface FeatureTableProps {
  features: Feature[];
  sortBy: FeatureSortField;
  sortDir: SortDirection;
  onSort: (field: FeatureSortField) => void;
  reorderable: boolean;
  onMoveUp: (feature: Feature) => void;
  onMoveDown: (feature: Feature) => void;
  onView: (feature: Feature) => void;
  onEdit: (feature: Feature) => void;
  onToggle: (feature: Feature) => void;
  busyCode?: string | null;
}

/** FeatureTable — the registry table. Reuses the shared sort header, status badge and date formatting. */
export function FeatureTable({
  features, sortBy, sortDir, onSort, reorderable, onMoveUp, onMoveDown, onView, onEdit, onToggle, busyCode,
}: FeatureTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
            <th className="w-16 px-3 py-2.5 text-left font-medium">Orden</th>
            <SortHeader label="Código" field="code" activeField={sortBy} dir={sortDir} onSort={onSort} />
            <SortHeader label="Nombre" field="name" activeField={sortBy} dir={sortDir} onSort={onSort} />
            <th className="px-3 py-2.5 text-left font-medium">Tipo</th>
            <th className="px-3 py-2.5 text-left font-medium">Unidad</th>
            <th className="px-3 py-2.5 text-left font-medium">Agregación</th>
            <th className="px-3 py-2.5 text-left font-medium">Estado</th>
            <SortHeader label="Creación" field="createdAt" activeField={sortBy} dir={sortDir} onSort={onSort} />
            <th className="w-12 px-3 py-2.5 text-right font-medium"><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => {
            const busy = busyCode === feature.code;
            return (
              <tr key={feature.code} className={cn('border-b transition-colors last:border-0 hover:bg-muted/30', busy && 'opacity-50')}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="size-6" disabled={!reorderable || index === 0 || busy} onClick={() => onMoveUp(feature)} aria-label="Subir">
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-6" disabled={!reorderable || index === features.length - 1 || busy} onClick={() => onMoveDown(feature)} aria-label="Bajar">
                      <ArrowDown className="size-3.5" />
                    </Button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Link to={featureRoutes.detail(feature.code)} className="font-mono text-xs font-medium hover:underline">
                    {feature.code}
                  </Link>
                </td>
                <td className="px-3 py-2 font-medium">{feature.name}</td>
                <td className="px-3 py-2"><FeatureValueTypeBadge valueType={feature.valueType} /></td>
                <td className="px-3 py-2 text-muted-foreground">{feature.unit ?? '—'}</td>
                <td className="px-3 py-2 text-muted-foreground">{feature.aggregation}</td>
                <td className="px-3 py-2"><ProductStatusBadge status={feature.status} /></td>
                <td className="px-3 py-2 text-muted-foreground">{formatDate(feature.createdAt)}</td>
                <td className="px-3 py-2 text-right">
                  <FeatureActionsMenu
                    status={feature.status}
                    disabled={busy}
                    onView={() => onView(feature)}
                    onEdit={() => onEdit(feature)}
                    onToggle={() => onToggle(feature)}
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
