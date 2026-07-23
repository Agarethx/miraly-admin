import { DEFAULT_LOCALE, type ProductWriteBase } from './product';
import { CatalogValidationError } from './errors';

/**
 * Pure domain guards for any catalog product write. The last line of defense
 * behind each module's Zod schema, so invariants hold regardless of the UI (or a
 * future API) driving the write.
 */
export function assertValidProductWriteBase(model: ProductWriteBase): void {
  if (!model.name[DEFAULT_LOCALE]?.trim()) {
    throw new CatalogValidationError('El nombre (español) es obligatorio.');
  }

  if (model.sortOrder < 0 || !Number.isInteger(model.sortOrder)) {
    throw new CatalogValidationError('El orden debe ser un entero mayor o igual a cero.');
  }

  for (const price of model.prices) {
    if (!/^[A-Z]{3}$/.test(price.currency)) {
      throw new CatalogValidationError('La moneda debe ser un código ISO-4217 de 3 letras.');
    }
    if (price.amountMinor < 0 || !Number.isInteger(price.amountMinor)) {
      throw new CatalogValidationError('El precio debe ser un entero (en unidades menores) mayor o igual a cero.');
    }
  }

  const currencies = model.prices.map((p) => `${p.currency}:${p.region ?? ''}`);
  if (new Set(currencies).size !== currencies.length) {
    throw new CatalogValidationError('No puede haber precios duplicados para la misma moneda y región.');
  }

  for (const limit of model.limits) {
    if (limit.deltaQty < 0 || !Number.isInteger(limit.deltaQty)) {
      throw new CatalogValidationError('Los límites deben ser enteros mayores o iguales a cero.');
    }
  }
}
