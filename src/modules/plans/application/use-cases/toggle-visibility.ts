import { nextVisibility } from '@/shared/catalog';
import type { Plan, PlanVisibility } from '../../domain';
import type { PlanRepository } from '../ports';

export { nextVisibility };

/** ToggleVisibility — flips a plan between shown (`public`) and hidden. */
export function toggleVisibility(repo: PlanRepository, id: string, current: PlanVisibility): Promise<Plan> {
  return repo.setVisibility(id, nextVisibility(current));
}
