import type { AddonRepository } from '../application';
import { SupabaseAddonRepository } from './supabase-addon-repository';

/**
 * Composition root for the Addons module. Swap the implementation here (e.g. for
 * a service-role HTTP adapter) without touching hooks, use cases or components.
 */
export const addonRepository: AddonRepository = new SupabaseAddonRepository();

export { SupabaseAddonRepository } from './supabase-addon-repository';
export { toAddon, toAddonSummary } from './addon-mapper';
