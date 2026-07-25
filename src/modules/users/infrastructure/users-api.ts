import { supabase } from '@/shared/services/supabase';

/**
 * Users administration data access. Everything goes through the anon client + the
 * admin's session, governed by RLS (the "Admins full access" pattern): platform
 * admins may read organizers, write billing_accounts, and — since migration
 * 20260724000010 — read/insert/delete admin_users. No Edge Function is involved.
 *
 * Model:
 *   - Administrator = a row in public.admin_users (is_platform_admin()).
 *   - Planner       = an organizer whose billing_accounts.account_type = 'wedding_planner'.
 * Both operations act on EXISTING users (looked up by email); no accounts are created.
 */

export interface AdminUser {
  userId: string;
  email: string;
  createdAt: string;
}

export interface PlannerUser {
  accountId: string;
  ownerId: string;
  email: string;
  fullName: string | null;
}

interface OrganizerLite {
  id: string;
  email: string;
  full_name: string | null;
}

/** Case-insensitive lookup of a registered organizer by email. */
async function findOrganizerByEmail(email: string): Promise<OrganizerLite | null> {
  const clean = email.trim();
  if (!clean) return null;
  const { data, error } = await supabase
    .from('organizers')
    .select('id, email, full_name')
    .ilike('email', clean) // no wildcards => case-insensitive equality
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  return (data as OrganizerLite | null) ?? null;
}

// ---------------------------------------------------------------------------
// Administrators
// ---------------------------------------------------------------------------

export async function listAdmins(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, email, created_at')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({ userId: r.user_id, email: r.email, createdAt: r.created_at }));
}

export async function promoteAdmin(email: string): Promise<void> {
  const org = await findOrganizerByEmail(email);
  if (!org) {
    throw new Error('No hay un usuario registrado con ese email.');
  }
  const { data: existing, error: exErr } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', org.id)
    .maybeSingle();
  if (exErr) throw exErr;
  if (existing) throw new Error('Ese usuario ya es administrador.');

  const { error } = await supabase.from('admin_users').insert({ user_id: org.id, email: org.email });
  if (error) throw error;
}

export async function revokeAdmin(userId: string): Promise<void> {
  const { error } = await supabase.from('admin_users').delete().eq('user_id', userId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Planners
// ---------------------------------------------------------------------------

export async function listPlanners(): Promise<PlannerUser[]> {
  const { data, error } = await supabase
    .from('billing_accounts')
    .select('id, owner_id')
    .eq('account_type', 'wedding_planner')
    .is('deleted_at', null);
  if (error) throw error;

  const accounts = (data ?? []) as { id: string; owner_id: string }[];
  const ownerIds = accounts.map((a) => a.owner_id);
  const byId = new Map<string, OrganizerLite>();
  if (ownerIds.length > 0) {
    const { data: orgs, error: orgErr } = await supabase
      .from('organizers')
      .select('id, email, full_name')
      .in('id', ownerIds);
    if (orgErr) throw orgErr;
    for (const o of (orgs ?? []) as OrganizerLite[]) byId.set(o.id, o);
  }

  return accounts.map((a) => ({
    accountId: a.id,
    ownerId: a.owner_id,
    email: byId.get(a.owner_id)?.email ?? '—',
    fullName: byId.get(a.owner_id)?.full_name ?? null,
  }));
}

export async function setPlanner(email: string): Promise<void> {
  const org = await findOrganizerByEmail(email);
  if (!org) {
    throw new Error('No hay un organizador registrado con ese email.');
  }
  const { data: acct, error: acctErr } = await supabase
    .from('billing_accounts')
    .select('id, account_type')
    .eq('owner_id', org.id)
    .is('deleted_at', null)
    .maybeSingle();
  if (acctErr) throw acctErr;

  if (acct) {
    if (acct.account_type === 'wedding_planner') {
      throw new Error('Ese organizador ya es planner.');
    }
    const { error } = await supabase
      .from('billing_accounts')
      .update({ account_type: 'wedding_planner', updated_at: new Date().toISOString() })
      .eq('id', acct.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('billing_accounts')
      .insert({ owner_id: org.id, account_type: 'wedding_planner', status: 'active' });
    if (error) throw error;
  }
}

export async function unsetPlanner(ownerId: string): Promise<void> {
  const { error } = await supabase
    .from('billing_accounts')
    .update({ account_type: 'individual', updated_at: new Date().toISOString() })
    .eq('owner_id', ownerId)
    .is('deleted_at', null);
  if (error) throw error;
}
