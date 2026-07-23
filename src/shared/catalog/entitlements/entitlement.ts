/**
 * Entitlement kernel — the typed, data-driven model of "what a product grants".
 *
 * A Feature declares a VALUE TYPE; a product's Entitlement provides a typed value
 * for that feature plus a MODE describing how it folds into the resolved
 * entitlement (override / increment / replace / boolean). This is the persistence
 * shape of `billing_product_entitlements` (Billing 1.4). No business rule ever
 * branches on a product name — everything is a feature + value + mode.
 */

export type ValueType = 'BOOLEAN' | 'INTEGER' | 'DECIMAL' | 'STRING' | 'JSON' | 'UNLIMITED';
export type EntitlementMode = 'override' | 'increment' | 'replace' | 'boolean';

export const VALUE_TYPES: readonly ValueType[] = [
  'BOOLEAN', 'INTEGER', 'DECIMAL', 'STRING', 'JSON', 'UNLIMITED',
];
export const ENTITLEMENT_MODES: readonly EntitlementMode[] = [
  'override', 'increment', 'replace', 'boolean',
];

/**
 * The modes each value type permits. Encodes the business rules once:
 *   - BOOLEAN   → boolean only (no increment/replace on a flag)
 *   - UNLIMITED → override only (never increment/replace)
 *   - INTEGER/DECIMAL → override | increment | replace
 *   - STRING/JSON     → override | replace (no increment)
 */
export const MODES_BY_TYPE: Record<ValueType, readonly EntitlementMode[]> = {
  BOOLEAN: ['boolean'],
  UNLIMITED: ['override'],
  INTEGER: ['override', 'increment', 'replace'],
  DECIMAL: ['override', 'increment', 'replace'],
  STRING: ['override', 'replace'],
  JSON: ['override', 'replace'],
};

export function modesForType(type: ValueType): readonly EntitlementMode[] {
  return MODES_BY_TYPE[type];
}

export function defaultModeForType(type: ValueType): EntitlementMode {
  return MODES_BY_TYPE[type][0];
}

export function isModeAllowed(type: ValueType, mode: EntitlementMode): boolean {
  return MODES_BY_TYPE[type].includes(mode);
}

/** Whether this value type carries a value column (UNLIMITED does not). */
export function typeHasValue(type: ValueType): boolean {
  return type !== 'UNLIMITED';
}

/**
 * Entitlement — one typed grant of a product. Exactly the value field matching
 * `valueType` is populated (UNLIMITED populates none). JSON is `unknown`, never `any`.
 */
export interface Entitlement {
  featureCode: string;
  valueType: ValueType;
  mode: EntitlementMode;
  valueBool: boolean | null;
  valueInt: number | null;
  valueDecimal: number | null;
  valueText: string | null;
  valueJson: unknown | null;
}

/** Builds an empty entitlement for a feature, with a sensible default mode/value. */
export function emptyEntitlement(featureCode: string, valueType: ValueType): Entitlement {
  return {
    featureCode,
    valueType,
    mode: defaultModeForType(valueType),
    valueBool: valueType === 'BOOLEAN' ? true : null,
    valueInt: valueType === 'INTEGER' ? 0 : null,
    valueDecimal: valueType === 'DECIMAL' ? 0 : null,
    valueText: valueType === 'STRING' ? '' : null,
    valueJson: null,
  };
}
