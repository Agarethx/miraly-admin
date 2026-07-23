import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

/**
 * DataPagination — the "N registros · mostrando M" footer + Prev/Next controls
 * shared by catalog lists. Presentational; the page owns the page state.
 */
export function DataPagination({
  page,
  totalPages,
  total,
  showing,
  unit,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  showing: number;
  /** [singular, plural] noun, e.g. ['plan', 'planes']. */
  unit: [string, string];
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {total} {total === 1 ? unit[0] : unit[1]}
        {showing > 0 ? ` · mostrando ${showing}` : ''}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" /> Anterior
        </Button>
        <span className="tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
