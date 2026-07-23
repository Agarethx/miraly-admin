import type { Addon } from '../../domain';
import type { AddonRepository } from '../ports';

/** ArchiveAddon — soft, reversible retirement (status `archived`). Never deletes. */
export function archiveAddon(repo: AddonRepository, id: string): Promise<Addon> {
  return repo.setStatus(id, 'archived');
}
