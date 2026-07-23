import { CatalogValidationError } from '../errors';
import { isModeAllowed, typeHasValue, type Entitlement } from './entitlement';

/**
 * Entitlement validation — the same rules the DB CHECK constraints enforce, but in
 * the domain (and reusable by the UI). `validateEntitlement` returns a Spanish
 * message or null (for inline UI); the `assert*` variants throw for use cases.
 */
export function validateEntitlement(e: Entitlement): string | null {
  if (!e.featureCode.trim()) return 'Elige una feature.';

  if (!isModeAllowed(e.valueType, e.mode)) {
    if (e.valueType === 'BOOLEAN') return 'Una feature BOOLEAN solo admite el modo "boolean".';
    if (e.valueType === 'UNLIMITED') return 'Una feature UNLIMITED solo admite el modo "override".';
    if (e.mode === 'increment') return 'El modo "increment" no aplica a este tipo.';
    if (e.mode === 'replace') return 'El modo "replace" no aplica a este tipo.';
    return 'El modo no es compatible con el tipo de la feature.';
  }

  switch (e.valueType) {
    case 'BOOLEAN':
      if (e.valueBool === null) return 'Define el valor booleano.';
      break;
    case 'INTEGER':
      if (e.valueInt === null || !Number.isInteger(e.valueInt)) return 'Ingresa un entero.';
      break;
    case 'DECIMAL':
      if (e.valueDecimal === null || Number.isNaN(e.valueDecimal)) return 'Ingresa un número.';
      break;
    case 'STRING':
      if (e.valueText === null || e.valueText.trim() === '') return 'Ingresa un texto.';
      break;
    case 'JSON':
      if (e.valueJson === null || e.valueJson === undefined) return 'Ingresa un JSON válido.';
      break;
    case 'UNLIMITED':
      break;
  }
  return null;
}

/** Throws on the first invalid entitlement. */
export function assertValidEntitlement(e: Entitlement): void {
  const message = validateEntitlement(e);
  if (message) throw new CatalogValidationError(message);
}

/** Throws if two entitlements target the same feature (no duplicates per product). */
export function assertNoDuplicateFeatures(entitlements: Entitlement[]): void {
  const codes = entitlements.map((e) => e.featureCode);
  if (new Set(codes).size !== codes.length) {
    throw new CatalogValidationError('No puede haber dos entitlements para la misma feature.');
  }
}

/** Validates the whole set (duplicates + each entitlement). Used by use cases. */
export function assertValidEntitlements(entitlements: Entitlement[]): void {
  assertNoDuplicateFeatures(entitlements);
  for (const e of entitlements) assertValidEntitlement(e);
}

/** Normalizes an entitlement so only the value field of its type is populated. */
export function normalizeEntitlement(e: Entitlement): Entitlement {
  const hasValue = typeHasValue(e.valueType);
  return {
    featureCode: e.featureCode,
    valueType: e.valueType,
    mode: e.mode,
    valueBool: e.valueType === 'BOOLEAN' ? e.valueBool : null,
    valueInt: e.valueType === 'INTEGER' ? e.valueInt : null,
    valueDecimal: e.valueType === 'DECIMAL' ? e.valueDecimal : null,
    valueText: e.valueType === 'STRING' ? e.valueText : null,
    valueJson: hasValue && e.valueType === 'JSON' ? e.valueJson : null,
  };
}
