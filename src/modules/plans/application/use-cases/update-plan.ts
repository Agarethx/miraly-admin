import { assertValidPlanWriteModel, type Plan, type PlanWriteModel } from '../../domain';
import type { PlanRepository } from '../ports';

/** UpdatePlan — validates invariants, then persists changes to an existing plan. */
export function updatePlan(repo: PlanRepository, id: string, input: PlanWriteModel): Promise<Plan> {
  assertValidPlanWriteModel(input);
  return repo.update(id, input);
}
