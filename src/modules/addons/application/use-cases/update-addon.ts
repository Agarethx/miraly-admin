import type { Addon, AddonWriteModel } from '../../domain';
import { assertValidAddonWriteModel } from '../../domain';
import type { AddonRepository } from '../ports';

/** UpdateAddon — validates invariants, then persists changes to an existing addon. */
export function updateAddon(repo: AddonRepository, id: string, input: AddonWriteModel): Promise<Addon> {
  assertValidAddonWriteModel(input);
  return repo.update(id, input);
}
