import type {
  Addon,
  AddonListQuery,
  AddonPage,
  AddonStatus,
  AddonVisibility,
  AddonWriteModel,
  PlanOption,
} from '../domain';
import type { AddonRepository } from '../application';
import type { ProductOrder } from '@/shared/catalog';
import { queryAddonById, queryAddonPage, queryPlanOptions } from './queries';
import {
  duplicateAddonProduct,
  insertAddonProduct,
  updateAddonOrders,
  updateAddonProduct,
  updateAddonStatus,
  updateAddonVisibility,
} from './mutations';
import { toAddon, toAddonSummary } from './addon-mapper';

/**
 * SupabaseAddonRepository — the Supabase adapter of the AddonRepository port. The
 * only class in the module that touches the database. Reuses the shared catalog
 * data-source for the product/prices/limits; adds the compatible-plans relation.
 */
export class SupabaseAddonRepository implements AddonRepository {
  async list(query: AddonListQuery): Promise<AddonPage> {
    const { rows, total } = await queryAddonPage(query);
    return {
      items: rows.map(toAddonSummary),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getById(id: string): Promise<Addon> {
    return toAddon(await queryAddonById(id));
  }

  async create(input: AddonWriteModel): Promise<Addon> {
    const id = await insertAddonProduct(input);
    return this.getById(id);
  }

  async update(id: string, input: AddonWriteModel): Promise<Addon> {
    await updateAddonProduct(id, input);
    return this.getById(id);
  }

  async setStatus(id: string, status: AddonStatus): Promise<Addon> {
    await updateAddonStatus(id, status);
    return this.getById(id);
  }

  async setVisibility(id: string, visibility: AddonVisibility): Promise<Addon> {
    await updateAddonVisibility(id, visibility);
    return this.getById(id);
  }

  async duplicate(id: string): Promise<Addon> {
    const source = await queryAddonById(id);
    const newId = await duplicateAddonProduct(source);
    return this.getById(newId);
  }

  async reorder(orders: ProductOrder[]): Promise<void> {
    await updateAddonOrders(orders);
  }

  listPlanOptions(): Promise<PlanOption[]> {
    return queryPlanOptions();
  }
}
