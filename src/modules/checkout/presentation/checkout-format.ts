import { formatMoney, valueTypeLabel } from '@/shared/catalog';
import type { CheckoutEntitlement } from '../domain';

export { valueTypeLabel };

/** Formats a minor amount + currency. */
export function checkoutMoney(currency: string, minor: number): string {
  return formatMoney({ currency, amountMinor: minor, region: null });
}

/** Human display of a resolved entitlement value. */
export function formatEntitlement(e: CheckoutEntitlement): string {
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
