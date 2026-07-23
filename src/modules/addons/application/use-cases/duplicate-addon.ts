import type { Addon } from '../../domain';
import type { AddonRepository } from '../ports';

/** DuplicateAddon — deep-copies an addon (prices, limits, compatible plans) as draft. */
export function duplicateAddon(repo: AddonRepository, id: string): Promise<Addon> {
  return repo.duplicate(id);
}
