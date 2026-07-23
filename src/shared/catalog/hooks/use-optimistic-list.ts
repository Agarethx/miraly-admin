import { useQueryClient } from '@tanstack/react-query';
import type { CatalogPage } from '../list-query';

/**
 * The optimistic-update mechanics shared by every catalog module's mutations:
 * patch all cached list pages, snapshot for rollback, reconcile on settle. Bind
 * it to a resource's `lists()` key and use it inside `onMutate/onError/onSettled`.
 */
export function useOptimisticList<T>(listsKey: readonly unknown[]) {
  const queryClient = useQueryClient();

  /** Applies `updater` to every cached list page (all filter/page variants). */
  function patchLists(updater: (items: T[]) => T[]) {
    queryClient.setQueriesData<CatalogPage<T>>({ queryKey: listsKey }, (old) =>
      old ? { ...old, items: updater(old.items) } : old,
    );
  }

  /** Snapshots list caches for rollback, then patches optimistically. */
  async function optimisticPatch(updater: (items: T[]) => T[]) {
    await queryClient.cancelQueries({ queryKey: listsKey });
    const snapshot = queryClient.getQueriesData<CatalogPage<T>>({ queryKey: listsKey });
    patchLists(updater);
    return snapshot;
  }

  type ListSnapshot = ReturnType<typeof queryClient.getQueriesData<CatalogPage<T>>>;

  function rollback(snapshot: ListSnapshot | undefined) {
    snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
  }

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: listsKey });
  }

  return { queryClient, patchLists, optimisticPatch, rollback, invalidate };
}
