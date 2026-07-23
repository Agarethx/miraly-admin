import type { Plan } from '../../domain';
import type { PlanRepository } from '../ports';

/**
 * ArchivePlan — soft, reversible retirement. Sets status to `archived`; the plan
 * is never physically deleted (ADR: catalog history is immutable).
 */
export function archivePlan(repo: PlanRepository, id: string): Promise<Plan> {
  return repo.setStatus(id, 'archived');
}
