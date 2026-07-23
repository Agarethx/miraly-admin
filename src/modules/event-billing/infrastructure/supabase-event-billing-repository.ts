import { supabase } from '@/shared/services/supabase';
import { mapCatalogError } from '@/shared/catalog';
import type { EventBillingRepository, EventBillingSnapshot } from '../application';
import type {
  CommercialStatus,
  EventBilling,
  EventBillingConfig,
  ResolvedEntitlement,
} from '../domain';

const TABLE = 'billing_event_billing';
const ADDONS = 'billing_event_billing_addons';
const LABELS = { record: 'el event billing', collection: 'la facturación de eventos' };

interface EventBillingRow {
  id: string;
  event_id: string;
  account_id: string;
  commercial_status: string;
  plan_product_id: string | null;
  currency: string | null;
  estimated_price_minor: number | null;
  final_price_minor: number | null;
  current_entitlements: unknown | null;
  expires_at: string | null;
  activated_at: string | null;
  cancelled_at: string | null;
  has_paid_order: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  addons?: { addon_id: string }[];
}

const SELECT = `
  id, event_id, account_id, commercial_status, plan_product_id, currency,
  estimated_price_minor, final_price_minor, current_entitlements,
  expires_at, activated_at, cancelled_at, has_paid_order, created_at, updated_at, deleted_at,
  addons:billing_event_billing_addons(addon_id)
`;

function toCommercialStatus(v: string): CommercialStatus {
  const all: CommercialStatus[] = ['DRAFT', 'CONFIGURING', 'READY_FOR_CHECKOUT', 'PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'CANCELLED'];
  return all.includes(v as CommercialStatus) ? (v as CommercialStatus) : 'DRAFT';
}

function toEventBilling(row: EventBillingRow): EventBilling {
  return {
    id: row.id,
    eventId: row.event_id,
    accountId: row.account_id,
    commercialStatus: toCommercialStatus(row.commercial_status),
    selectedPlanId: row.plan_product_id,
    selectedAddonIds: (row.addons ?? []).map((a) => a.addon_id),
    currentEntitlements: (row.current_entitlements ?? null) as ResolvedEntitlement[] | null,
    estimatedPriceMinor: row.estimated_price_minor,
    finalPriceMinor: row.final_price_minor,
    currency: row.currency,
    expiresAt: row.expires_at,
    activatedAt: row.activated_at,
    cancelledAt: row.cancelled_at,
    hasPaidOrder: row.has_paid_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

async function readByEventId(eventId: string): Promise<EventBillingRow | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq('event_id', eventId)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw mapCatalogError(error, { id: eventId, labels: LABELS });
  return (data as unknown as EventBillingRow | null) ?? null;
}

async function readById(id: string): Promise<EventBillingRow> {
  const { data, error } = await supabase.from(TABLE).select(SELECT).eq('id', id).single();
  if (error) throw mapCatalogError(error, { id, labels: LABELS });
  return data as unknown as EventBillingRow;
}

/** SupabaseEventBillingRepository — the only class touching the event-billing tables. */
export class SupabaseEventBillingRepository implements EventBillingRepository {
  async getByEventId(eventId: string): Promise<EventBilling | null> {
    const row = await readByEventId(eventId);
    return row ? toEventBilling(row) : null;
  }

  async getById(id: string): Promise<EventBilling> {
    return toEventBilling(await readById(id));
  }

  async ensureForEvent(eventId: string, accountId: string): Promise<EventBilling> {
    const existing = await readByEventId(eventId);
    if (existing) return toEventBilling(existing);
    const { error } = await supabase
      .from(TABLE)
      .insert({ event_id: eventId, account_id: accountId, commercial_status: 'DRAFT' });
    if (error) throw mapCatalogError(error, { id: eventId, labels: LABELS });
    const row = await readByEventId(eventId);
    if (!row) throw mapCatalogError(new Error('No se pudo crear el event billing.'), { labels: LABELS });
    return toEventBilling(row);
  }

  async saveConfiguration(
    id: string,
    config: EventBillingConfig,
    snapshot: EventBillingSnapshot,
    status: CommercialStatus,
  ): Promise<EventBilling> {
    const { error } = await supabase
      .from(TABLE)
      .update({
        plan_product_id: config.selectedPlanId,
        currency: snapshot.currency,
        estimated_price_minor: snapshot.estimatedPriceMinor,
        current_entitlements: snapshot.entitlements,
        commercial_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw mapCatalogError(error, { id, labels: LABELS });

    const del = await supabase.from(ADDONS).delete().eq('event_billing_id', id);
    if (del.error) throw mapCatalogError(del.error, { id, labels: LABELS });
    if (config.selectedAddonIds.length > 0) {
      const ins = await supabase
        .from(ADDONS)
        .insert(config.selectedAddonIds.map((addonId) => ({ event_billing_id: id, addon_id: addonId })));
      if (ins.error) throw mapCatalogError(ins.error, { id, labels: LABELS });
    }

    return this.getById(id);
  }

  async transition(id: string, status: CommercialStatus): Promise<EventBilling> {
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { commercial_status: status, updated_at: now };
    if (status === 'ACTIVE') patch.activated_at = now;
    if (status === 'CANCELLED') patch.cancelled_at = now;
    const { error } = await supabase.from(TABLE).update(patch).eq('id', id);
    if (error) throw mapCatalogError(error, { id, labels: LABELS });
    return this.getById(id);
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw mapCatalogError(error, { id, labels: LABELS });
  }
}
