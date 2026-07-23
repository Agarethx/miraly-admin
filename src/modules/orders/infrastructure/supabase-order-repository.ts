import { supabase } from '@/shared/services/supabase';
import { mapCatalogError } from '@/shared/catalog';
import type { OrderRepository } from '../application';
import type {
  Order,
  OrderDraft,
  OrderItem,
  OrderListQuery,
  OrderPage,
  OrderSnapshot,
  OrderStatus,
  OrderSummary,
} from '../domain';

const ORDERS = 'billing_orders';
const LABELS = { record: 'la orden', collection: 'las órdenes' };

const ORDER_STATUSES: OrderStatus[] = ['DRAFT', 'PENDING_PAYMENT', 'PAID', 'EXPIRED', 'CANCELLED', 'REFUNDED'];
function toStatus(v: string): OrderStatus {
  return ORDER_STATUSES.includes(v as OrderStatus) ? (v as OrderStatus) : 'DRAFT';
}

interface ItemRow {
  id: string;
  product_id: string | null;
  snapshot_type: string;
  snapshot_name: string;
  unit_amount_minor: number;
  quantity: number;
  currency: string;
  snapshot_value: unknown | null;
  sort_order: number;
}
interface OrderRow {
  id: string;
  order_number: string;
  account_id: string;
  event_billing_id: string | null;
  event_id: string | null;
  order_status: string;
  currency: string;
  subtotal_minor: number;
  discount_minor: number;
  tax_minor: number;
  total_minor: number;
  snapshot: unknown | null;
  created_at: string;
  expires_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  items?: ItemRow[];
}

const ORDER_SELECT = `
  id, order_number, account_id, event_billing_id, event_id, order_status, currency,
  subtotal_minor, discount_minor, tax_minor, total_minor, snapshot,
  created_at, expires_at, paid_at, cancelled_at, updated_at, deleted_at,
  items:billing_order_items(id, product_id, snapshot_type, snapshot_name, unit_amount_minor, quantity, currency, snapshot_value, sort_order)
`;

function toItem(row: ItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    type: row.snapshot_type === 'addon' ? 'addon' : 'plan',
    name: row.snapshot_name,
    unitAmountMinor: row.unit_amount_minor,
    quantity: row.quantity,
    currency: row.currency,
    value: (row.snapshot_value ?? null) as OrderItem['value'],
    sortOrder: row.sort_order,
  };
}

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    billingAccountId: row.account_id,
    eventBillingId: row.event_billing_id,
    eventId: row.event_id,
    currency: row.currency,
    subtotalMinor: row.subtotal_minor,
    discountMinor: row.discount_minor,
    taxMinor: row.tax_minor,
    totalMinor: row.total_minor,
    status: toStatus(row.order_status),
    snapshot: (row.snapshot ?? null) as OrderSnapshot | null,
    items: (row.items ?? []).map(toItem).sort((a, b) => a.sortOrder - b.sortOrder),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    paidAt: row.paid_at,
    cancelledAt: row.cancelled_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export class SupabaseOrderRepository implements OrderRepository {
  async list(query: OrderListQuery): Promise<OrderPage> {
    let builder = supabase
      .from(ORDERS)
      .select(
        `id, order_number, order_status, currency, total_minor, created_at,
         account:billing_accounts(display_name, owner:organizers(email, full_name)),
         event:events(name)`,
        { count: 'exact' },
      )
      .is('deleted_at', null);

    if (query.status !== 'all') builder = builder.eq('order_status', query.status);
    if (query.search.trim()) builder = builder.ilike('order_number', `%${query.search.trim()}%`);

    const from = (query.page - 1) * query.pageSize;
    const { data, error, count } = await builder
      .order('created_at', { ascending: false })
      .range(from, from + query.pageSize - 1);
    if (error) throw mapCatalogError(error, { labels: LABELS });

    const items: OrderSummary[] = ((data ?? []) as unknown as {
      id: string; order_number: string; order_status: string; currency: string;
      total_minor: number; created_at: string;
      account: { display_name: string | null; owner: { email: string; full_name: string | null } | null } | null;
      event: { name: string } | null;
    }[]).map((r) => ({
      id: r.id,
      orderNumber: r.order_number,
      status: toStatus(r.order_status),
      currency: r.currency,
      totalMinor: r.total_minor,
      customerLabel:
        r.account?.display_name || r.account?.owner?.full_name || r.account?.owner?.email || '—',
      eventName: r.event?.name ?? null,
      createdAt: r.created_at,
    }));

    return { items, total: count ?? 0, page: query.page, pageSize: query.pageSize };
  }

  async getById(id: string): Promise<Order> {
    const { data, error } = await supabase.from(ORDERS).select(ORDER_SELECT).eq('id', id).single();
    if (error) throw mapCatalogError(error, { id, labels: LABELS });
    return toOrder(data as unknown as OrderRow);
  }

  async findOpenByEventBilling(eventBillingId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from(ORDERS)
      .select(ORDER_SELECT)
      .eq('event_billing_id', eventBillingId)
      .in('order_status', ['DRAFT', 'PENDING_PAYMENT'])
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw mapCatalogError(error, { id: eventBillingId, labels: LABELS });
    return data ? toOrder(data as unknown as OrderRow) : null;
  }

  async create(draft: OrderDraft, expiresAt: string): Promise<Order> {
    const { data, error } = await supabase.rpc('create_billing_order', {
      p_account_id: draft.billingAccountId,
      p_event_id: draft.eventId,
      p_event_billing_id: draft.eventBillingId,
      p_currency: draft.currency,
      p_subtotal_minor: draft.subtotalMinor,
      p_discount_minor: draft.discountMinor,
      p_tax_minor: draft.taxMinor,
      p_total_minor: draft.totalMinor,
      p_snapshot: draft.snapshot,
      p_items: draft.items.map((i) => ({
        product_id: i.productId,
        snapshot_type: i.type,
        snapshot_name: i.name,
        unit_amount_minor: i.unitAmountMinor,
        quantity: i.quantity,
        currency: i.currency,
        snapshot_value: i.value,
        sort_order: i.sortOrder,
      })),
      p_expires_at: expiresAt,
    });
    if (error) throw mapCatalogError(error, { labels: LABELS });
    return this.getById(data as string);
  }

  async transition(id: string, to: OrderStatus): Promise<Order> {
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { order_status: to, updated_at: now };
    if (to === 'PAID') patch.paid_at = now;
    if (to === 'CANCELLED') patch.cancelled_at = now;
    const { error } = await supabase.from(ORDERS).update(patch).eq('id', id);
    if (error) throw mapCatalogError(error, { id, labels: LABELS });
    return this.getById(id);
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from(ORDERS)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw mapCatalogError(error, { id, labels: LABELS });
  }
}
