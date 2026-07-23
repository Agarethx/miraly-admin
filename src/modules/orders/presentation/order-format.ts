import { formatMoney, valueTypeLabel } from '@/shared/catalog';
import type { SnapshotEntitlement } from '../domain';

export { formatDate } from '@/shared/catalog';
export { valueTypeLabel };

/** Formats a minor amount + currency. */
export function orderMoney(currency: string, minor: number): string {
  return formatMoney({ currency, amountMinor: minor, region: null });
}

/** Human display of a frozen entitlement value. */
export function formatSnapshotValue(e: SnapshotEntitlement): string {
  if (e.unlimited) return 'Ilimitado';
  switch (e.valueType) {
    case 'BOOLEAN': return e.value ? 'Sí' : 'No';
    case 'INTEGER':
    case 'DECIMAL': return e.value === null ? '—' : new Intl.NumberFormat('es-419').format(Number(e.value));
    case 'STRING': return e.value === null ? '—' : String(e.value);
    case 'JSON': return e.value === null ? '—' : JSON.stringify(e.value);
    case 'UNLIMITED': return 'Ilimitado';
  }
}
