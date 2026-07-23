import type { Plan } from '../../domain';
import type { PlanRepository } from '../ports';

/** GetPlan — the full aggregate for detail / edit surfaces. */
export function getPlan(repo: PlanRepository, id: string): Promise<Plan> {
  return repo.getById(id);
}
