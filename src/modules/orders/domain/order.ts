import type { ValueType } from '@/shared/catalog';

/**
 * Order — the immutable commercial contract between a customer and the platform.
 * An Order freezes the whole purchase: the snapshot below is self-contained, so a
 * historical Order renders correctly even if the catalog is fully deleted. Orders
 * owns its snapshot types on purpose (it must not depend on evolving catalog types).
 */
export type OrderStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'DRAFT', 'PENDING_PAYMENT', 'PAID', 'EXPIRED', 'CANCELLED', 'REFUNDED',
];

/** A frozen entitlement value inside a snapshot (JSON-serializable). */
export interface SnapshotEntitlement {
  featureCode: string;
  valueType: ValueType;
  value: number | boolean | string | unknown | null;
  unlimited: boolean;
}

/** A frozen product (plan or addon) inside a snapshot. */
export interface SnapshotProduct {
  productId: string | null;
  name: string;
  type: 'plan' | 'addon';
  unitAmountMinor: number;
}

/** Frozen pricing totals. */
export interface OrderPricingSnapshot {
  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
}

/** The complete frozen purchase. Everything needed to reconstruct the Order. */
export interface OrderSnapshot {
  version: number;
  plan: SnapshotProduct | null;
  addons: SnapshotProduct[];
  entitlements: SnapshotEntitlement[];
  pricing: OrderPricingSnapshot;
}

/** A frozen line item. `productId` is a reference only (no catalog dependency). */
export interface OrderItem {
  id: string;
  productId: string | null;
  type: 'plan' | 'addon';
  name: string;
  unitAmountMinor: number;
  quantity: number;
  currency: string;
  value: SnapshotEntitlement[] | null;
  sortOrder: number;
}

/** Order — the full aggregate (detail). */
export interface Order {
  id: string;
  orderNumber: string;
  billingAccountId: string;
  eventBillingId: string | null;
  eventId: string | null;
  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  status: OrderStatus;
  snapshot: OrderSnapshot | null;
  items: OrderItem[];
  createdAt: string;
  expiresAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

/** Flattened projection for the Orders table. */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  totalMinor: number;
  customerLabel: string;
  eventName: string | null;
  createdAt: string;
}

/** The write model the repository persists (built by the snapshot repository). */
export interface OrderDraft {
  billingAccountId: string;
  eventId: string | null;
  eventBillingId: string;
  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  snapshot: OrderSnapshot;
  items: OrderItemDraft[];
  /** The source Event Billing's commercial status, for the create-time guard. */
  eventBillingStatus: string;
}

export interface OrderItemDraft {
  productId: string | null;
  type: 'plan' | 'addon';
  name: string;
  unitAmountMinor: number;
  quantity: number;
  currency: string;
  value: SnapshotEntitlement[] | null;
  sortOrder: number;
}
