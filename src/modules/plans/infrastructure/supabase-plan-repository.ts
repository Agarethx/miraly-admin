import type {
  Plan,
  PlanListQuery,
  PlanOrder,
  PlanPage,
  PlanStatus,
  PlanVisibility,
  PlanWriteModel,
} from '../domain';
import type { PlanRepository } from '../application';
import { queryPlanById, queryPlanPage } from './queries';
import {
  duplicatePlanProduct,
  insertPlanProduct,
  updatePlanOrders,
  updatePlanProduct,
  updatePlanStatus,
  updatePlanVisibility,
} from './mutations';
import { toPlan, toPlanSummary } from './plan-mapper';

/**
 * SupabasePlanRepository — the Supabase adapter of the PlanRepository port. It is
 * the ONLY class in the module that touches the database; everything above it
 * speaks the domain model. Reads/writes go through the admin's authenticated
 * Supabase session (RLS applies — see PLAN_AUDIT.md for the write-path note).
 */
export class SupabasePlanRepository implements PlanRepository {
  async list(query: PlanListQuery): Promise<PlanPage> {
    const { rows, total } = await queryPlanPage(query);
    return {
      items: rows.map(toPlanSummary),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getById(id: string): Promise<Plan> {
    return toPlan(await queryPlanById(id));
  }

  async create(input: PlanWriteModel): Promise<Plan> {
    const id = await insertPlanProduct(input);
    return this.getById(id);
  }

  async update(id: string, input: PlanWriteModel): Promise<Plan> {
    await updatePlanProduct(id, input);
    return this.getById(id);
  }

  async setStatus(id: string, status: PlanStatus): Promise<Plan> {
    await updatePlanStatus(id, status);
    return this.getById(id);
  }

  async setVisibility(id: string, visibility: PlanVisibility): Promise<Plan> {
    await updatePlanVisibility(id, visibility);
    return this.getById(id);
  }

  async duplicate(id: string): Promise<Plan> {
    const source = await queryPlanById(id);
    const newId = await duplicatePlanProduct(source);
    return this.getById(newId);
  }

  async reorder(orders: PlanOrder[]): Promise<void> {
    await updatePlanOrders(orders);
  }
}
