import type { PlanRepository } from '../application';
import { SupabasePlanRepository } from './supabase-plan-repository';

/**
 * Composition root for the Plans module. Swap the implementation here (e.g. for a
 * service-role HTTP adapter) without touching hooks, use cases or components.
 */
export const planRepository: PlanRepository = new SupabasePlanRepository();

export { SupabasePlanRepository } from './supabase-plan-repository';
export { toPlan, toPlanSummary } from './plan-mapper';
