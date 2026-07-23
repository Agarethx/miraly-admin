import { assertValidPlanWriteModel, type Plan, type PlanWriteModel } from '../../domain';
import type { PlanRepository } from '../ports';

/** CreatePlan — validates domain invariants, then persists a new plan. */
export function createPlan(repo: PlanRepository, input: PlanWriteModel): Promise<Plan> {
  assertValidPlanWriteModel(input);
  return repo.create(input);
}
