import { formatMoney, formatDate } from '@/shared/catalog';

export { formatDate };

/** Formats a minor amount + currency. */
export function money(currency: string, minor: number): string {
  return formatMoney({ currency, amountMinor: minor, region: null });
}

/** Short day label, e.g. "12 jul". */
export function shortDay(iso: string): string {
  return new Intl.DateTimeFormat('es-419', { day: '2-digit', month: 'short' }).format(new Date(iso));
}

/** Relative-ish datetime for lists. */
export function dateTime(iso: string): string {
  return new Intl.DateTimeFormat('es-419', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}
