import type { Money } from '@/shared/catalog';
import {
  computeEventBillingPreview,
  configureEventBilling,
  transitionEventBilling,
} from '@/modules/event-billing/application';
import { billingCatalogRepository, eventBillingRepository } from '@/modules/event-billing/infrastructure';
import { cancelOrder, createOrder } from '@/modules/orders/application';
import { orderRepository, orderSnapshotRepository } from '@/modules/orders/infrastructure';
import type { CheckoutGateway, PlaceOrderInput } from '../application';
import {
  buildPriceBreakdown,
  categorizeAddon,
  type AddonOption,
  type CheckoutData,
  type CheckoutPreview,
} from '../domain';

function priceIn(prices: Money[], currency: string): number {
  const match = prices.find((p) => p.currency === currency && p.region === null)
    ?? prices.find((p) => p.currency === currency);
  return match ? match.amountMinor : 0;
}

/**
 * DefaultCheckoutGateway — orchestrates the existing subdomains. It never
 * reimplements pricing, snapshotting or order creation: it delegates to Event
 * Billing (config + Pricing Engine), Catalog (products) and Orders (create/cancel).
 */
export class DefaultCheckoutGateway implements CheckoutGateway {
  async load(eventBillingId: string): Promise<CheckoutData> {
    const eb = await eventBillingRepository.getById(eventBillingId);

    const plans = await billingCatalogRepository.listActivePlans();
    const planEntry = plans.find((p) => p.product.id === eb.selectedPlanId) ?? null;
    const plan =
      planEntry?.product ??
      (eb.selectedPlanId ? await billingCatalogRepository.getProduct(eb.selectedPlanId) : null);

    const currency = eb.currency ?? plan?.prices[0]?.currency ?? 'USD';
    const allowedAddonIds = planEntry?.allowedAddonIds ?? [];
    const addonProducts = await billingCatalogRepository.getProducts(allowedAddonIds);

    const availableAddons: AddonOption[] = addonProducts.map((a) => ({
      id: a.id,
      label: a.label,
      category: categorizeAddon(a.entitlements.map((e) => e.featureCode)),
      priceMinor: priceIn(a.prices, currency),
    }));

    const open = await orderRepository.findOpenByEventBilling(eventBillingId);

    return {
      accountId: eb.accountId,
      eventId: eb.eventId,
      eventBillingId: eb.id,
      commercialStatus: eb.commercialStatus,
      planId: eb.selectedPlanId,
      planLabel: plan?.label ?? null,
      currency,
      availableAddons,
      selectedAddonIds: eb.selectedAddonIds,
      openOrder: open
        ? {
            id: open.id,
            orderNumber: open.orderNumber,
            status: open.status,
            totalMinor: open.totalMinor,
            currency: open.currency,
          }
        : null,
    };
  }

  async computePreview(
    planId: string | null,
    addonIds: string[],
    currency: string,
  ): Promise<CheckoutPreview> {
    const preview = await computeEventBillingPreview(billingCatalogRepository, planId, addonIds, currency);
    const priceByProduct = new Map(preview.pricing.lines.map((l) => [l.productId, l.priceMinor]));

    const breakdown = buildPriceBreakdown({
      currency: preview.pricing.currency,
      plan: preview.plan
        ? { label: preview.plan.label, amountMinor: priceByProduct.get(preview.plan.id) ?? 0 }
        : null,
      addons: preview.addons.map((a) => ({
        category: categorizeAddon(a.entitlements.map((e) => e.featureCode)),
        amountMinor: priceByProduct.get(a.id) ?? 0,
      })),
      discountMinor: 0,
      taxMinor: 0,
    });

    return {
      currency: preview.pricing.currency,
      breakdown,
      entitlements: preview.entitlements.map((e) => ({
        featureCode: e.featureCode,
        valueType: e.valueType,
        value: e.value,
        unlimited: e.unlimited,
      })),
      totalMinor: breakdown.totalMinor,
    };
  }

  async placeOrder(input: PlaceOrderInput): Promise<{ orderId: string }> {
    if (!input.eventId) {
      throw new Error('El event billing no tiene un evento asociado.');
    }
    // 1) Persist the selection on the Event Billing (reuse; sets CONFIGURING + snapshot).
    await configureEventBilling(eventBillingRepository, billingCatalogRepository, {
      eventId: input.eventId,
      accountId: input.accountId,
      config: { selectedPlanId: input.planId, selectedAddonIds: input.addonIds },
    });
    // 2) Mark ready for checkout (reuse; validates pricing present).
    await transitionEventBilling(eventBillingRepository, input.eventBillingId, 'READY_FOR_CHECKOUT');
    // 3) Generate the immutable Order (reuse; ends PENDING_PAYMENT, atomic).
    const order = await createOrder(orderRepository, orderSnapshotRepository, input.eventBillingId);
    return { orderId: order.id };
  }

  async cancelOpenOrder(orderId: string): Promise<void> {
    await cancelOrder(orderRepository, orderId);
  }
}
