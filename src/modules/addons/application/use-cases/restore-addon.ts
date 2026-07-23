import type { Addon } from '../../domain';
import type { AddonRepository } from '../ports';

/** RestoreAddon — brings an archived addon back to `draft`. */
export function restoreAddon(repo: AddonRepository, id: string): Promise<Addon> {
  return repo.setStatus(id, 'draft');
}
