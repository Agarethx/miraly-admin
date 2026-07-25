import { supabase } from '@/shared/services/supabase';
import type { ProductOrder, ProductStatus, ProductVisibility, ProductWriteBase } from './product';
import { mapCatalogError, type CatalogErrorLabels } from './product-error-mapper';
import type { ProductRowBase } from './rows';

const PRODUCTS = 'billing_products';
const PRICES = 'billing_product_prices';
const LIMITS = 'billing_product_limit_effects';

/** Config a module passes so generic mutations tag rows with the right type. */
export interface ProductMutationConfig {
  productType: 'plan' | 'addon';
  labels?: CatalogErrorLabels;
}

function nowIso(): string {
  return new Date().toISOString();
}

function fail(error: unknown, config: ProductMutationConfig, id?: string): never {
  throw mapCatalogError(error, { id, labels: config.labels });
}

/** Rewrites the price rows of a product (delete-all then insert the new set). */
export async function replacePrices(
  productId: string,
  prices: ProductWriteBase['prices'],
  config: ProductMutationConfig,
): Promise<void> {
  const del = await supabase.from(PRICES).delete().eq('product_id', productId);
  if (del.error) fail(del.error, config, productId);
  if (prices.length === 0) return;
  const ins = await supabase.from(PRICES).insert(
    prices.map((p) => ({
      product_id: productId,
      currency: p.currency,
      amount_minor: p.amountMinor,
      region: p.region,
      audience: p.audience ?? 'standard',
    })),
  );
  if (ins.error) fail(ins.error, config, productId);
}

/** Rewrites the limit-effect rows of a product. */
export async function replaceLimits(
  productId: string,
  limits: ProductWriteBase['limits'],
  config: ProductMutationConfig,
): Promise<void> {
  const del = await supabase.from(LIMITS).delete().eq('product_id', productId);
  if (del.error) fail(del.error, config, productId);
  if (limits.length === 0) return;
  const ins = await supabase.from(LIMITS).insert(
    limits.map((l) => ({
      product_id: productId,
      limit_type_code: l.limitTypeCode,
      delta_qty: l.deltaQty,
    })),
  );
  if (ins.error) fail(ins.error, config, productId);
}

/** Inserts the base product row + prices + limits, returning the new id. */
export async function insertProductBase(
  config: ProductMutationConfig,
  input: ProductWriteBase,
): Promise<string> {
  const { data, error } = await supabase
    .from(PRODUCTS)
    .insert({
      product_type: config.productType,
      name: input.name,
      description: input.description,
      status: input.status,
      visibility: input.visibility,
      sort_order: input.sortOrder,
    })
    .select('id')
    .single();
  if (error) fail(error, config);
  const id = (data as { id: string }).id;
  await replacePrices(id, input.prices, config);
  await replaceLimits(id, input.limits, config);
  return id;
}

/** Updates the base product row and rewrites its price / limit children. */
export async function updateProductBase(
  config: ProductMutationConfig,
  id: string,
  input: ProductWriteBase,
): Promise<void> {
  const { error } = await supabase
    .from(PRODUCTS)
    .update({
      name: input.name,
      description: input.description,
      status: input.status,
      visibility: input.visibility,
      sort_order: input.sortOrder,
      updated_at: nowIso(),
    })
    .eq('id', id)
    .eq('product_type', config.productType);
  if (error) fail(error, config, id);
  await replacePrices(id, input.prices, config);
  await replaceLimits(id, input.limits, config);
}

/** Patches only the status column (archive / restore). */
export async function setProductStatus(
  config: ProductMutationConfig,
  id: string,
  status: ProductStatus,
): Promise<void> {
  const { error } = await supabase
    .from(PRODUCTS)
    .update({ status, updated_at: nowIso() })
    .eq('id', id)
    .eq('product_type', config.productType);
  if (error) fail(error, config, id);
}

/** Patches only the visibility column (show / hide). */
export async function setProductVisibility(
  config: ProductMutationConfig,
  id: string,
  visibility: ProductVisibility,
): Promise<void> {
  const { error } = await supabase
    .from(PRODUCTS)
    .update({ visibility, updated_at: nowIso() })
    .eq('id', id)
    .eq('product_type', config.productType);
  if (error) fail(error, config, id);
}

/** Persists a batch of (id, sortOrder) updates for reordering. */
export async function reorderProducts(
  config: ProductMutationConfig,
  orders: ProductOrder[],
): Promise<void> {
  for (const { id, sortOrder } of orders) {
    const { error } = await supabase
      .from(PRODUCTS)
      .update({ sort_order: sortOrder, updated_at: nowIso() })
      .eq('id', id)
      .eq('product_type', config.productType);
    if (error) fail(error, config, id);
  }
}

/**
 * Copies the base product row + prices + limits into a new `draft`, returning the
 * new id. The caller copies any resource-specific relations afterwards.
 */
export async function duplicateProductBase(
  config: ProductMutationConfig,
  source: ProductRowBase,
  nameSuffix: string,
): Promise<string> {
  const copyName: Record<string, string> = {};
  for (const [locale, value] of Object.entries(source.name)) {
    copyName[locale] = `${value}${nameSuffix}`;
  }

  const { data, error } = await supabase
    .from(PRODUCTS)
    .insert({
      product_type: config.productType,
      name: copyName,
      description: source.description,
      status: 'draft',
      visibility: source.visibility,
      sort_order: source.sort_order + 1,
    })
    .select('id')
    .single();
  if (error) fail(error, config);
  const newId = (data as { id: string }).id;

  if (source.prices.length > 0) {
    const ins = await supabase.from(PRICES).insert(
      source.prices.map((p) => ({
        product_id: newId,
        currency: p.currency,
        amount_minor: p.amount_minor,
        region: p.region,
        audience: p.audience ?? 'standard',
      })),
    );
    if (ins.error) fail(ins.error, config, newId);
  }
  if (source.limits.length > 0) {
    const ins = await supabase.from(LIMITS).insert(
      source.limits.map((l) => ({
        product_id: newId,
        limit_type_code: l.limit_type_code,
        delta_qty: l.delta_qty,
      })),
    );
    if (ins.error) fail(ins.error, config, newId);
  }

  return newId;
}
