import type { CatalogListQuery } from '../list-query';

/**
 * Builds a hierarchical React Query key set for a catalog resource. Every module
 * calls this instead of inlining `['<resource>', …]` arrays, so invalidations
 * (`keys.lists()`, `keys.detail(id)`) are precise and refactor-safe.
 */
export function makeResourceKeys(resource: string) {
  const all = [resource] as const;
  return {
    all,
    lists: () => [...all, 'list'] as const,
    list: (query: CatalogListQuery) => [...all, 'list', query] as const,
    details: () => [...all, 'detail'] as const,
    detail: (id: string) => [...all, 'detail', id] as const,
  };
}

export type ResourceKeys = ReturnType<typeof makeResourceKeys>;
