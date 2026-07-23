import type { BillingDashboardRepository } from '../application';
import { SupabaseBillingDashboardRepository } from './supabase-dashboard-repository';

/** Composition root for the Billing Dashboard module. */
export const billingDashboardRepository: BillingDashboardRepository =
  new SupabaseBillingDashboardRepository();
