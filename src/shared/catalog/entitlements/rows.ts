import type { Entitlement, EntitlementMode, ValueType } from './entitlement';

/** Persistence row of `billing_product_entitlements`. */
export interface EntitlementRow {
  product_id: string;
  feature_code: string;
  value_type: string;
  mode: string;
  value_bool: boolean | null;
  value_int: number | null;
  value_decimal: number | null;
  value_text: string | null;
  value_json: unknown | null;
}

export const ENTITLEMENT_SELECT =
  'feature_code, value_type, mode, value_bool, value_int, value_decimal, value_text, value_json';

/** A selectable feature for the entitlement editor (from `billing_features`). */
export interface FeatureOption {
  code: string;
  name: string;
  valueType: ValueType;
  unit: string | null;
}

export interface FeatureOptionRow {
  code: string;
  name: string;
  value_type: string;
  unit: string | null;
}

function toValueType(v: string): ValueType {
  return (['BOOLEAN', 'INTEGER', 'DECIMAL', 'STRING', 'JSON', 'UNLIMITED'] as const).includes(
    v as ValueType,
  )
    ? (v as ValueType)
    : 'BOOLEAN';
}

function toMode(v: string): EntitlementMode {
  return (['override', 'increment', 'replace', 'boolean'] as const).includes(v as EntitlementMode)
    ? (v as EntitlementMode)
    : 'override';
}

/** Row → domain Entitlement. */
export function toEntitlement(row: EntitlementRow): Entitlement {
  return {
    featureCode: row.feature_code,
    valueType: toValueType(row.value_type),
    mode: toMode(row.mode),
    valueBool: row.value_bool,
    valueInt: row.value_int,
    valueDecimal: row.value_decimal,
    valueText: row.value_text,
    valueJson: row.value_json,
  };
}

/** Domain Entitlement → insert row payload for a given product. */
export function toEntitlementRow(productId: string, e: Entitlement): EntitlementRow {
  return {
    product_id: productId,
    feature_code: e.featureCode,
    value_type: e.valueType,
    mode: e.mode,
    value_bool: e.valueType === 'BOOLEAN' ? e.valueBool : null,
    value_int: e.valueType === 'INTEGER' ? e.valueInt : null,
    value_decimal: e.valueType === 'DECIMAL' ? e.valueDecimal : null,
    value_text: e.valueType === 'STRING' ? e.valueText : null,
    value_json: e.valueType === 'JSON' ? e.valueJson : null,
  };
}

/** Row → feature option. */
export function toFeatureOption(row: FeatureOptionRow): FeatureOption {
  return { code: row.code, name: row.name, valueType: toValueType(row.value_type), unit: row.unit };
}
