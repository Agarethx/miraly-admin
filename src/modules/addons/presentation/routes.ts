/**
 * Route constants + deep-link builders for the Addons module. Base path under
 * `/billing/addons` to match the existing Billing menu group.
 */
export const ADDONS_BASE = '/billing/addons';

export const addonRoutes = {
  list: ADDONS_BASE,
  new: `${ADDONS_BASE}/new`,
  detail: (id: string) => `${ADDONS_BASE}/${id}`,
  edit: (id: string) => `${ADDONS_BASE}/${id}/edit`,
} as const;

export const ADDON_ID_PARAM = 'addonId';
