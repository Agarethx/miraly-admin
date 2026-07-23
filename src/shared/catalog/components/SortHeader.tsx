import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { SortDirection } from '../list-query';

/**
 * A sortable `<th>` for catalog tables. Generic over the sort-field type, so any
 * resource (Products, Features, …) reuses it with its own field union. Clicking
 * toggles direction on re-select.
 */
export function SortHeader<F extends string>({
  label, field, activeField, dir, onSort, className,
}: {
  label: string;
  field: F;
  activeField: F;
  dir: SortDirection;
  onSort: (field: F) => void;
  className?: string;
}) {
  const active = activeField === field;
  const Icon = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;
  return (
    <th className={cn('px-3 py-2.5 text-left font-medium', className)}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          'inline-flex items-center gap-1 transition-colors hover:text-foreground',
          active ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
        <Icon className="size-3.5" />
      </button>
    </th>
  );
}
