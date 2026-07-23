import type { Addon, AddonWriteModel } from '../../domain';
import { assertValidAddonWriteModel } from '../../domain';
import type { AddonRepository } from '../ports';

/** CreateAddon — validates domain invariants, then persists a new addon. */
export function createAddon(repo: AddonRepository, input: AddonWriteModel): Promise<Addon> {
  assertValidAddonWriteModel(input);
  return repo.create(input);
}
