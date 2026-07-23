import { formatMoney, valueTypeLabel } from '@/shared/catalog';
import type { ResolvedEntitlement } from '../domain';

export { valueTypeLabel };

/** Formats a minor-unit amount + currency, or "—" when missing. */
export function formatMinor(currency: string | null, minor: number | null): string {
  if (minor === null || currency === null) return '—';
  return formatMoney({ currency, amountMinor: minor, region: null });
}

/** Human display of a resolved entitlement value. */
export function formatResolvedValue(e: ResolvedEntitlement): string {
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
