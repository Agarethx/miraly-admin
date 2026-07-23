import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { PlanOption } from '../../domain';

interface AddonPlanSelectorProps {
  options: PlanOption[];
  value: string[];
  allPlans: boolean;
  loading?: boolean;
  onChange: (ids: string[], allPlans: boolean) => void;
}

/**
 * AddonPlanSelector — the "planes compatibles" multi-select. Supports "todos los
 * planes" (a convenience that selects every plan) or an explicit subset. Native
 * checkboxes: accessible, keyboard-friendly, zero extra deps.
 */
export function AddonPlanSelector({ options, value, allPlans, loading, onChange }: AddonPlanSelectorProps) {
  const allIds = options.map((o) => o.id);
  const selected = new Set(value);

  function toggleAll(checked: boolean) {
    if (checked) onChange(allIds, true);
    else onChange([], false);
  }

  function togglePlan(id: string, checked: boolean) {
    const next = checked ? [...value, id] : value.filter((v) => v !== id);
    onChange(next, next.length > 0 && next.length === allIds.length);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-md border p-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando planes…
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        No hay planes disponibles para asociar.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <label className="flex cursor-pointer items-center gap-2 border-b px-3 py-2.5 text-sm font-medium">
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={allPlans}
          onChange={(e) => toggleAll(e.target.checked)}
        />
        Todos los planes
        <span className="ml-auto text-xs font-normal text-muted-foreground">
          {allPlans ? 'Aplica a todos' : `${value.length} de ${options.length}`}
        </span>
      </label>
      <div
        className={cn(
          'max-h-56 space-y-0.5 overflow-y-auto p-1.5',
          allPlans && 'pointer-events-none opacity-50',
        )}
        aria-hidden={allPlans}
      >
        {options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-muted/60"
          >
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={allPlans || selected.has(option.id)}
              disabled={allPlans}
              onChange={(e) => togglePlan(option.id, e.target.checked)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}
