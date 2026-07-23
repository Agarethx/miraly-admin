import { Package } from 'lucide-react';
import { CatalogEmptyState } from '@/shared/catalog';
import { planRoutes } from '../routes';

/** Plan-specific copy over the shared CatalogEmptyState. */
export function PlanEmptyState({ filtered, onClearFilters }: { filtered: boolean; onClearFilters: () => void }) {
  return (
    <CatalogEmptyState
      filtered={filtered}
      onClearFilters={onClearFilters}
      createHref={planRoutes.new}
      emptyIcon={Package}
      emptyTitle="Todavía no hay planes"
      emptyDescription="Crea el primer plan del catálogo para empezar a comercializar."
      createLabel="Crear plan"
    />
  );
}
