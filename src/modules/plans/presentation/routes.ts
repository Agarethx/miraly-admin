/**
 * Route constants + deep-link builders for the Plans module. Centralized so
 * navigation never hardcodes strings and links stay refactor-safe. The base path
 * lives under `/billing/plans` to match the existing Billing menu group.
 */
export const PLANS_BASE = '/billing/plans';

export const planRoutes = {
  list: PLANS_BASE,
  new: `${PLANS_BASE}/new`,
  detail: (id: string) => `${PLANS_BASE}/${id}`,
  edit: (id: string) => `${PLANS_BASE}/${id}/edit`,
} as const;

/** Route param segments, kept next to the builders that mirror them. */
export const PLAN_ID_PARAM = 'planId';
