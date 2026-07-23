import type { FeatureRepository } from '../application';
import { SupabaseFeatureRepository } from './supabase-feature-repository';

/** Composition root for the Features module. */
export const featureRepository: FeatureRepository = new SupabaseFeatureRepository();

export { SupabaseFeatureRepository } from './supabase-feature-repository';
