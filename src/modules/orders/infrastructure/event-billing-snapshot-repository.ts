import type { Entitlement } from '@/shared/catalog';
import { computeEventBillingPreview } from '@/modules/event-billing/application';
import { billingCatalogRepository, eventBillingRepository } from '@/modules/event-billing/infrastructure';
import type { BillingCatalogProduct } from '@/modules/event-billing/domain';
import type { OrderSnapshotRepository } from '../application';
import type {
  OrderDraft,
  OrderItemDraft,
  OrderSnapshot,
  SnapshotEntitlement,
  SnapshotProduct,
} from '../domain';

/**
 * EventBillingOrderSnapshotRepository — builds the frozen Order snapshot by
 * REUSING Event Billing (the configuration) + the Pricing Engine (the fold +
 * estimate). It never reimplements pricing and never modifies Event Billing; it
 * only reads it. The result is fully self-contained (no catalog dependency).
 */
function toSnapshotEntitlement(e: Entitlement): SnapshotEntitlement {
  const value =
    e.valueType === 'BOOLEAN' ? e.valueBool
    : e.valueType === 'INTEGER' ? e.valueInt
    : e.valueType === 'DECIMAL' ? e.valueDecimal
    : e.valueType === 'STRING' ? e.valueText
    : e.valueType === 'JSON' ? e.valueJson
    : null;
  return { featureCode: e.featureCode, valueType: e.valueType, value, unlimited: e.valueType === 'UNLIMITED' };
}

export class EventBillingOrderSnapshotRepository implements OrderSnapshotRepository {
  async buildForEventBilling(eventBillingId: string): Promise<OrderDraft> {
    const eb = await eventBillingRepository.getById(eventBillingId);
    const preview = await computeEventBillingPreview(
      billingCatalogRepository,
      eb.selectedPlanId,
      eb.selectedAddonIds,
      eb.currency ?? undefined,
    );

    const currency = preview.pricing.currency;
    const priceByProduct = new Map(preview.pricing.lines.map((l) => [l.productId, l.priceMinor]));
    const priceOf = (id: string) => priceByProduct.get(id) ?? 0;

    const plan: SnapshotProduct | null = preview.plan
      ? { productId: preview.plan.id, name: preview.plan.label, type: 'plan', unitAmountMinor: priceOf(preview.plan.id) }
      : null;
    const addons: SnapshotProduct[] = preview.addons.map((a) => ({
      productId: a.id, name: a.label, type: 'addon', unitAmountMinor: priceOf(a.id),
    }));

    const subtotal = preview.pricing.estimatedPriceMinor;
    const snapshot: OrderSnapshot = {
      version: 1,
      plan,
      addons,
      entitlements: preview.entitlements.map((e) => ({
        featureCode: e.featureCode, valueType: e.valueType, value: e.value, unlimited: e.unlimited,
      })),
      pricing: { currency, subtotalMinor: subtotal, discountMinor: 0, taxMinor: 0, totalMinor: subtotal },
    };

    const toItem = (p: BillingCatalogProduct, type: 'plan' | 'addon', sortOrder: number): OrderItemDraft => ({
      productId: p.id,
      type,
      name: p.label,
      unitAmountMinor: priceOf(p.id),
      quantity: 1,
      currency,
      value: p.entitlements.map(toSnapshotEntitlement),
      sortOrder,
    });

    const items: OrderItemDraft[] = [];
    if (preview.plan) items.push(toItem(preview.plan, 'plan', 0));
    preview.addons.forEach((a, i) => items.push(toItem(a, 'addon', i + 1)));

    return {
      billingAccountId: eb.accountId,
      eventId: eb.eventId,
      eventBillingId: eb.id,
      currency,
      subtotalMinor: subtotal,
      discountMinor: 0,
      taxMinor: 0,
      totalMinor: subtotal,
      snapshot,
      items,
      eventBillingStatus: eb.commercialStatus,
    };
  }
}
