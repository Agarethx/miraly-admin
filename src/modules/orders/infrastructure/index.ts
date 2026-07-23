import type { OrderRepository, OrderSnapshotRepository } from '../application';
import { SupabaseOrderRepository } from './supabase-order-repository';
import { EventBillingOrderSnapshotRepository } from './event-billing-snapshot-repository';

/** Composition root for the Orders module. */
export const orderRepository: OrderRepository = new SupabaseOrderRepository();
export const orderSnapshotRepository: OrderSnapshotRepository = new EventBillingOrderSnapshotRepository();
