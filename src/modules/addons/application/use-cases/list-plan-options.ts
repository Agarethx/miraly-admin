import type { PlanOption } from '../../domain';
import type { AddonRepository } from '../ports';

/** ListPlanOptions — the plans an addon can be attached to (for the selector). */
export function listPlanOptions(repo: AddonRepository): Promise<PlanOption[]> {
  return repo.listPlanOptions();
}
