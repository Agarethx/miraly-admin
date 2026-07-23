import { Package, SearchX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';

interface CatalogEmptyStateProps {
  filtered: boolean;
  onClearFilters: () => void;
  /** The create screen link (empty, non-filtered state). */
  createHref: string;
  /** Copy for the truly-empty state. */
  emptyIcon?: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  createLabel: string;
}

/**
 * Two shapes: a truly-empty catalog (with a create CTA) and a "no results for
 * these filters" state. Shared by catalog lists; copy is passed in.
 */
export function CatalogEmptyState({
  filtered, onClearFilters, createHref, emptyIcon = Package, emptyTitle, emptyDescription, createLabel,
}: CatalogEmptyStateProps) {
  if (filtered) {
    return (
      <EmptyState
        icon={SearchX}
        title="Sin resultados"
        description="Ningún registro coincide con la búsqueda o los filtros actuales."
        action={
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={emptyIcon}
      title={emptyTitle}
      description={emptyDescription}
      action={
        <Button asChild size="sm">
          <Link to={createHref}>{createLabel}</Link>
        </Button>
      }
    />
  );
}
