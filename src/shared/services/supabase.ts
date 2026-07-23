import { createClient } from '@supabase/supabase-js';
import { env } from '@/shared/config/env';

/**
 * Supabase client for the Backoffice. Uses the anon key + the admin's own session
 * (Supabase Auth); row access is governed by RLS. The admin acts as an
 * authenticated user, distinct from a mobile organizer — see the Admin concept in
 * the auth module. Privileged catalog writes go through backend endpoints
 * (service role), never the anon client, per Billing 1.0's RLS design.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
