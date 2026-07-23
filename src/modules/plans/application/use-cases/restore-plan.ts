import type { Plan } from '../../domain';
import type { PlanRepository } from '../ports';

/**
 * RestorePlan — brings an archived plan back to `draft` (never straight to
 * `active`, so a human re-publishes deliberately).
 */
export function restorePlan(repo: PlanRepository, id: string): Promise<Plan> {
  return repo.setStatus(id, 'draft');
}
