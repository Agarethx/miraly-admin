import type { Addon } from '../../domain';
import type { AddonRepository } from '../ports';

/** GetAddon — the full aggregate for detail / edit surfaces. */
export function getAddon(repo: AddonRepository, id: string): Promise<Addon> {
  return repo.getById(id);
}
