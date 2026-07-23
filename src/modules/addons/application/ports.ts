import type {
  Addon,
  AddonListQuery,
  AddonPage,
  AddonStatus,
  AddonVisibility,
  AddonWriteModel,
  PlanOption,
} from '../domain';
import type { ProductOrder } from '@/shared/catalog';

/**
 * AddonRepository — the port between the application and any persistence adapter.
 * Mirrors the catalog product operations plus the addon-only `listPlanOptions`
 * (feeding the "compatible plans" multi-select). Use cases depend only on this.
 */
export interface AddonRepository {
  list(query: AddonListQuery): Promise<AddonPage>;
  getById(id: string): Promise<Addon>;
  create(input: AddonWriteModel): Promise<Addon>;
  update(id: string, input: AddonWriteModel): Promise<Addon>;
  setStatus(id: string, status: AddonStatus): Promise<Addon>;
  setVisibility(id: string, visibility: AddonVisibility): Promise<Addon>;
  duplicate(id: string): Promise<Addon>;
  reorder(orders: ProductOrder[]): Promise<void>;
  /** All plans that an addon may be attached to (for the selector). */
  listPlanOptions(): Promise<PlanOption[]>;
}
