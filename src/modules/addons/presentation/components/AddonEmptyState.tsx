import { Puzzle } from 'lucide-react';
import { CatalogEmptyState } from '@/shared/catalog';
import { addonRoutes } from '../routes';

/** Addon-specific copy over the shared CatalogEmptyState. */
export function AddonEmptyState({ filtered, onClearFilters }: { filtered: boolean; onClearFilters: () => void }) {
  return (
    <CatalogEmptyState
      filtered={filtered}
      onClearFilters={onClearFilters}
      createHref={addonRoutes.new}
      emptyIcon={Puzzle}
      emptyTitle="Todavía no hay addons"
      emptyDescription="Crea el primer addon del catálogo para ampliar los planes."
      createLabel="Crear addon"
    />
  );
}
