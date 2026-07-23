/**
 * BillingAccount — the paying entity. Exactly one (live) account per Organizer;
 * an account owns many events. Built on `billing_accounts` (foundation) enriched
 * in Billing 1.5 (currency, country, tax, status, soft delete).
 */
export type AccountStatus = 'active' | 'suspended' | 'closed';

export const ACCOUNT_STATUSES: readonly AccountStatus[] = ['active', 'suspended', 'closed'];

export interface BillingAccount {
  id: string;
  ownerId: string;
  displayName: string | null;
  currency: string | null;
  country: string | null;
  /** Free-form tax data (JSONB). `unknown`, never `any`. */
  taxInformation: unknown | null;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string | null;
}

/** Flattened projection for the Customers list (with owner + aggregates). */
export interface BillingAccountSummary {
  id: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string | null;
  displayName: string | null;
  currency: string | null;
  status: AccountStatus;
  eventCount: number;
  activeEventCount: number;
  /** Plan name of the account's active event(s), or null / "Varios". */
  currentPlanLabel: string | null;
  createdAt: string;
}
