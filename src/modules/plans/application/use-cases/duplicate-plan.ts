import type { Plan } from '../../domain';
import type { PlanRepository } from '../ports';

/**
 * DuplicatePlan — deep-copies an existing plan (prices, limits, features, allowed
 * addons) as a new `draft`, so admins iterate on a variant without risk.
 */
export function duplicatePlan(repo: PlanRepository, id: string): Promise<Plan> {
  return repo.duplicate(id);
}
