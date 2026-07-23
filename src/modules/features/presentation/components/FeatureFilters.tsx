import { FilterX } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Select } from '@/shared/components/ui/select';
import { VALUE_TYPES, valueTypeLabel } from '@/shared/catalog';
import type { FeatureStatus, ValueType } from '../../domain';

interface FeatureFiltersProps {
  status: FeatureStatus | 'all';
  valueType: ValueType | 'all';
  onStatusChange: (status: FeatureStatus | 'all') => void;
  onValueTypeChange: (valueType: ValueType | 'all') => void;
  onClear: () => void;
  canClear: boolean;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activas' },
  { value: 'archived', label: 'Archivadas' },
];

/** Status + value-type facets for the Features list. */
export function FeatureFilters({
  status, valueType, onStatusChange, onValueTypeChange, onClear, canClear,
}: FeatureFiltersProps) {
  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    ...VALUE_TYPES.map((t) => ({ value: t, label: valueTypeLabel(t) })),
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        options={STATUS_OPTIONS}
        value={status}
        onChange={(e) => onStatusChange(e.target.value as FeatureStatus | 'all')}
        aria-label="Filtrar por estado"
        className="w-40"
      />
      <Select
        options={typeOptions}
        value={valueType}
        onChange={(e) => onValueTypeChange(e.target.value as ValueType | 'all')}
        aria-label="Filtrar por tipo"
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
