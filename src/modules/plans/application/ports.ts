import type {
  Plan,
  PlanOrder,
  PlanStatus,
  PlanVisibility,
  PlanWriteModel,
} from '../domain';
import type { PlanListQuery, PlanPage } from '../domain';

/**
 * PlanRepository — the port (hexagonal boundary) between the application and any
 * persistence adapter. Use cases depend ONLY on this interface; the Supabase
 * implementation lives in `infrastructure/`. Swapping to a service-role HTTP
 * endpoint later means writing another adapter, nothing else changes.
 *
 * Every method speaks the domain model — never rows, never Supabase types.
 */
export interface PlanRepository {
  list(query: PlanListQuery): Promise<PlanPage>;
  getById(id: string): Promise<Plan>;
  create(input: PlanWriteModel): Promise<Plan>;
  update(id: string, input: PlanWriteModel): Promise<Plan>;
  /** Archive / restore are status transitions; physical deletion is never exposed. */
  setStatus(id: string, status: PlanStatus): Promise<Plan>;
  setVisibility(id: string, visibility: PlanVisibility): Promise<Plan>;
  /** Deep-copies a plan (name suffixed, status draft) including its effects. */
  duplicate(id: string): Promise<Plan>;
  reorder(orders: PlanOrder[]): Promise<void>;
}
