import type { PlanListQuery, PlanPage } from '../../domain';
import type { PlanRepository } from '../ports';

/** ListPlans — paginated, filtered, sorted catalog listing for the table. */
export function listPlans(repo: PlanRepository, query: PlanListQuery): Promise<PlanPage> {
  return repo.list(query);
}
