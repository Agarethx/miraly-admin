import { ToggleRight } from 'lucide-react';
import { CatalogEmptyState } from '@/shared/catalog';
import { featureRoutes } from '../routes';

/** Feature-specific copy over the shared CatalogEmptyState. */
export function FeatureEmptyState({ filtered, onClearFilters }: { filtered: boolean; onClearFilters: () => void }) {
  return (
    <CatalogEmptyState
      filtered={filtered}
      onClearFilters={onClearFilters}
      createHref={featureRoutes.new}
      emptyIcon={ToggleRight}
      emptyTitle="Todavía no hay features"
      emptyDescription="Registra la primera feature (capacidad o límite) del catálogo."
      createLabel="Crear feature"
    />
  );
}
