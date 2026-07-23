import type { Entitlement, EntitlementMode, ValueType } from './entitlement';

const VALUE_TYPE_LABELS: Record<ValueType, string> = {
  BOOLEAN: 'Booleano',
  INTEGER: 'Entero',
  DECIMAL: 'Decimal',
  STRING: 'Texto',
  JSON: 'JSON',
  UNLIMITED: 'Ilimitado',
};

const MODE_LABELS: Record<EntitlementMode, string> = {
  override: 'Override',
  increment: 'Incremento',
  replace: 'Reemplazo',
  boolean: 'Booleano',
};

export function valueTypeLabel(type: ValueType): string {
  return VALUE_TYPE_LABELS[type];
}

export function modeLabel(mode: EntitlementMode): string {
  return MODE_LABELS[mode];
}

/** Human display of an entitlement's value (mode-aware, e.g. "+50"). */
export function formatEntitlementValue(e: Entitlement): string {
  const inc = e.mode === 'increment' ? '+' : '';
  switch (e.valueType) {
    case 'BOOLEAN':
      return e.valueBool ? 'Sí' : 'No';
    case 'INTEGER':
      return e.valueInt === null ? '—' : `${inc}${new Intl.NumberFormat('es-419').format(e.valueInt)}`;
    case 'DECIMAL':
      return e.valueDecimal === null ? '—' : `${inc}${e.valueDecimal}`;
    case 'STRING':
      return e.valueText ?? '—';
    case 'JSON':
      return e.valueJson === null ? '—' : JSON.stringify(e.valueJson);
    case 'UNLIMITED':
      return 'Ilimitado';
  }
}
