import { supabase } from '@/shared/services/supabase';
import { localized, mapCatalogError, type LocalizedText } from '@/shared/catalog';
import type { BillingAccountRepository } from '../application';
import type {
  AccountEvent,
  AccountStatus,
  BillingAccount,
  BillingAccountListQuery,
  BillingAccountPage,
  BillingAccountSummary,
  CommercialStatus,
} from '../domain';

const TABLE = 'billing_accounts';
const EB = 'billing_event_billing';
const LABELS = { record: 'la cuenta', collection: 'las cuentas de facturación' };

interface OwnerEmbed { email: string; full_name: string | null }
interface AccountRow {
  id: string;
  owner_id: string;
  display_name: string | null;
  currency: string | null;
  country: string | null;
  tax_information: unknown | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  owner: OwnerEmbed | null;
}

function toStatus(v: string): AccountStatus {
  return v === 'suspended' || v === 'closed' ? v : 'active';
}

function toAccount(row: AccountRow): BillingAccount {
  return {
    id: row.id,
    ownerId: row.owner_id,
    displayName: row.display_name,
    currency: row.currency,
    country: row.country,
    taxInformation: row.tax_information,
    status: toStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const ACCOUNT_SELECT =
  'id, owner_id, display_name, currency, country, tax_information, status, created_at, updated_at, owner:organizers(email, full_name)';

export class SupabaseBillingAccountRepository implements BillingAccountRepository {
  async list(query: BillingAccountListQuery): Promise<BillingAccountPage> {
    let builder = supabase
      .from(TABLE)
      .select(ACCOUNT_SELECT, { count: 'exact' })
      .is('deleted_at', null);

    if (query.status !== 'all') builder = builder.eq('status', query.status);
    if (query.search.trim()) builder = builder.ilike('display_name', `%${query.search.trim()}%`);

    const from = (query.page - 1) * query.pageSize;
    const { data, error, count } = await builder
      .order('created_at', { ascending: false })
      .range(from, from + query.pageSize - 1);
    if (error) throw mapCatalogError(error, { labels: LABELS });

    const rows = (data ?? []) as unknown as AccountRow[];
    const accountIds = rows.map((r) => r.id);
    const items = await this.decorate(rows, accountIds);
    return { items, total: count ?? 0, page: query.page, pageSize: query.pageSize };
  }

  /** Folds per-account event counts + current plan onto the summaries. */
  private async decorate(rows: AccountRow[], accountIds: string[]): Promise<BillingAccountSummary[]> {
    if (accountIds.length === 0) return [];

    const { data: ebData, error: ebError } = await supabase
      .from(EB)
      .select('account_id, commercial_status, plan_product_id')
      .in('account_id', accountIds)
      .is('deleted_at', null);
    if (ebError) throw mapCatalogError(ebError, { labels: LABELS });
    const ebs = (ebData ?? []) as { account_id: string; commercial_status: string; plan_product_id: string | null }[];

    const planIds = [...new Set(ebs.map((e) => e.plan_product_id).filter((v): v is string => Boolean(v)))];
    const planNames = new Map<string, string>();
    if (planIds.length > 0) {
      const { data: planData, error: planError } = await supabase
        .from('billing_products')
        .select('id, name')
        .in('id', planIds);
      if (planError) throw mapCatalogError(planError, { labels: LABELS });
      for (const p of (planData ?? []) as { id: string; name: LocalizedText }[]) {
        planNames.set(p.id, localized(p.name) || 'Sin nombre');
      }
    }

    return rows.map((row) => {
      const accountEbs = ebs.filter((e) => e.account_id === row.id);
      const active = accountEbs.filter((e) => e.commercial_status === 'ACTIVE');
      const activePlanIds = [...new Set(active.map((e) => e.plan_product_id).filter((v): v is string => Boolean(v)))];
      const currentPlanLabel =
        activePlanIds.length === 1 ? (planNames.get(activePlanIds[0]) ?? null)
        : activePlanIds.length > 1 ? 'Varios'
        : null;
      return {
        id: row.id,
        ownerId: row.owner_id,
        ownerEmail: row.owner?.email ?? '—',
        ownerName: row.owner?.full_name ?? null,
        displayName: row.display_name,
        currency: row.currency,
        status: toStatus(row.status),
        eventCount: accountEbs.length,
        activeEventCount: active.length,
        currentPlanLabel,
        createdAt: row.created_at,
      };
    });
  }

  async getById(id: string): Promise<BillingAccount> {
    const { data, error } = await supabase.from(TABLE).select(ACCOUNT_SELECT).eq('id', id).single();
    if (error) throw mapCatalogError(error, { id, labels: LABELS });
    return toAccount(data as unknown as AccountRow);
  }

  async getByOwner(ownerId: string): Promise<BillingAccount | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(ACCOUNT_SELECT)
      .eq('owner_id', ownerId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw mapCatalogError(error, { id: ownerId, labels: LABELS });
    return data ? toAccount(data as unknown as AccountRow) : null;
  }

  async listEvents(accountId: string): Promise<AccountEvent[]> {
    const { data, error } = await supabase
      .from(EB)
      .select('id, event_id, commercial_status, plan_product_id, event:events(name)')
      .eq('account_id', accountId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw mapCatalogError(error, { id: accountId, labels: LABELS });

    return ((data ?? []) as unknown as {
      id: string; event_id: string; commercial_status: string; plan_product_id: string | null;
      event: { name: string } | null;
    }[]).map((r) => ({
      eventId: r.event_id,
      eventName: r.event?.name ?? 'Evento',
      eventBillingId: r.id,
      commercialStatus: r.commercial_status as CommercialStatus,
      selectedPlanId: r.plan_product_id,
    }));
  }
}
