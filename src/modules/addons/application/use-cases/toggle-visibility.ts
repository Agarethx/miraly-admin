import { nextVisibility } from '@/shared/catalog';
import type { Addon, AddonVisibility } from '../../domain';
import type { AddonRepository } from '../ports';

export { nextVisibility };

/** ToggleVisibility — flips an addon between shown (`public`) and hidden. */
export function toggleVisibility(repo: AddonRepository, id: string, current: AddonVisibility): Promise<Addon> {
  return repo.setVisibility(id, nextVisibility(current));
}
