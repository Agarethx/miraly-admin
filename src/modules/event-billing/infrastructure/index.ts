import type {
  BillingAccountRepository,
  BillingCatalogRepository,
  EventBillingRepository,
} from '../application';
import { SupabaseBillingAccountRepository } from './supabase-billing-account-repository';
import { SupabaseEventBillingRepository } from './supabase-event-billing-repository';
import { SupabaseBillingCatalogRepository } from './supabase-billing-catalog-repository';

/** Composition root for the Event Billing module. */
export const billingAccountRepository: BillingAccountRepository = new SupabaseBillingAccountRepository();
export const eventBillingRepository: EventBillingRepository = new SupabaseEventBillingRepository();
export const billingCatalogRepository: BillingCatalogRepository = new SupabaseBillingCatalogRepository();
