import {
  assertCanCancel,
  assertCanExpire,
  OrderValidationError,
  type Order,
  type OrderListQuery,
  type OrderPage,
} from '../domain';
import type { OrderRepository, OrderSnapshotRepository } from './ports';

/** How long a generated order stays open before it can expire. */
const ORDER_TTL_DAYS = 7;

export function listOrders(repo: OrderRepository, query: OrderListQuery): Promise<OrderPage> {
  return repo.list(query);
}

export function getOrder(repo: OrderRepository, id: string): Promise<Order> {
  return repo.getById(id);
}

/**
 * CreateOrder ("Generar Orden") — reads the Event Billing, resolves pricing,
 * freezes the snapshot and persists the Order + items in ONE atomic operation.
 * Ends in PENDING_PAYMENT (no payment here). Enforces the create-time rules.
 */
export async function createOrder(
  repo: OrderRepository,
  snapshots: OrderSnapshotRepository,
  eventBillingId: string,
): Promise<Order> {
  const draft = await snapshots.buildForEventBilling(eventBillingId);

  if (draft.eventBillingStatus !== 'READY_FOR_CHECKOUT') {
    throw new OrderValidationError('El Event Billing no está listo para checkout (READY_FOR_CHECKOUT).');
  }
  if (!draft.snapshot.plan) {
    throw new OrderValidationError('No se puede crear una orden sin un plan.');
  }
  if (draft.totalMinor <= 0 && draft.snapshot.addons.length === 0) {
    // Pricing must be present/resolved (a plan with a real price or addons).
    throw new OrderValidationError('No se puede crear una orden sin pricing.');
  }

  const existingOpen = await repo.findOpenByEventBilling(eventBillingId);
  if (existingOpen) {
    throw new OrderValidationError('Ya existe una orden abierta para este Event Billing.');
  }

  const expiresAt = new Date(Date.now() + ORDER_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  return repo.create(draft, expiresAt);
}

/** CancelOrder — soft cancel (only while open). */
export async function cancelOrder(repo: OrderRepository, id: string): Promise<Order> {
  const order = await repo.getById(id);
  assertCanCancel(order);
  return repo.transition(id, 'CANCELLED');
}

/** ExpireOrder — mark a pending order expired. */
export async function expireOrder(repo: OrderRepository, id: string): Promise<Order> {
  const order = await repo.getById(id);
  assertCanExpire(order);
  return repo.transition(id, 'EXPIRED');
}
