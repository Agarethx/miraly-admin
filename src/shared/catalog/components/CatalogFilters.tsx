import { FilterX } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Select } from '@/shared/components/ui/select';
import type { ProductStatus, ProductVisibility } from '../product';

interface CatalogFiltersProps {
  status: ProductStatus | 'all';
  visibility: ProductVisibility | 'all';
  onStatusChange: (status: ProductStatus | 'all') => void;
  onVisibilityChange: (visibility: ProductVisibility | 'all') => void;
  onClear: () => void;
  canClear: boolean;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activo' },
  { value: 'draft', label: 'Borrador' },
  { value: 'archived', label: 'Archivado' },
];

const VISIBILITY_OPTIONS = [
  { value: 'all', label: 'Toda visibilidad' },
  { value: 'public', label: 'Visible' },
  { value: 'private', label: 'Privado' },
  { value: 'hidden', label: 'Oculto' },
];

/** Status + visibility facets with a one-click reset. Shared by catalog lists. */
export function CatalogFilters({
  status, visibility, onStatusChange, onVisibilityChange, onClear, canClear,
}: CatalogFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        options={STATUS_OPTIONS}
        value={status}
        onChange={(e) => onStatusChange(e.target.value as ProductStatus | 'all')}
        aria-label="Filtrar por estado"
        className="w-40"
      />
      <Select
        options={VISIBILITY_OPTIONS}
        value={visibility}
        onChange={(e) => onVisibilityChange(e.target.value as ProductVisibility | 'all')}
        aria-label="Filtrar por visibilidad"
        className="w-40"
      />
      {canClear ? (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <FilterX className="size-4" /> Limpiar
        </Button>
      ) : null}
    </div>
  );
}
