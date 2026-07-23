import { assertValidProductWriteBase } from '@/shared/catalog';
import type { PlanWriteModel } from './plan';

/** Plan write invariants — the shared product guards (a Plan adds none extra). */
export function assertValidPlanWriteModel(model: PlanWriteModel): void {
  assertValidProductWriteBase(model);
}
