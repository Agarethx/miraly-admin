/** Route constants + deep-link builders for the Features module. */
export const FEATURES_BASE = '/billing/features';

export const featureRoutes = {
  list: FEATURES_BASE,
  new: `${FEATURES_BASE}/new`,
  detail: (code: string) => `${FEATURES_BASE}/${code}`,
  edit: (code: string) => `${FEATURES_BASE}/${code}/edit`,
} as const;

export const FEATURE_CODE_PARAM = 'featureCode';
