import type { AddonListQuery, AddonPage } from '../../domain';
import type { AddonRepository } from '../ports';

/** ListAddons — paginated, filtered, sorted catalog listing for the table. */
export function listAddons(repo: AddonRepository, query: AddonListQuery): Promise<AddonPage> {
  return repo.list(query);
}
