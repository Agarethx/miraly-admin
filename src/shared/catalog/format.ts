import type { Money } from './product';

/**
 * Catalog presentation formatters. Pure, locale-aware. Money is always stored as
 * integer minor units; conversion to a human amount lives here so no component
 * does arithmetic inline. Shared by every product module.
 */

const BYTES_PER_GB = 1024 ** 3;
const MINOR_PER_MAJOR = 100; // 2-decimal ISO-4217 assumption

export function formatMoney(money: Money | null): string {
  if (!money) return '—';
  try {
    return new Intl.NumberFormat('es-419', {
      style: 'currency',
      currency: money.currency,
    }).format(money.amountMinor / MINOR_PER_MAJOR);
  } catch {
    return `${(money.amountMinor / MINOR_PER_MAJOR).toFixed(2)} ${money.currency}`;
  }
}

export function toMinorUnits(amountMajor: number): number {
  return Math.round(amountMajor * MINOR_PER_MAJOR);
}

export function toMajorUnits(amountMinor: number): number {
  return amountMinor / MINOR_PER_MAJOR;
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes === 0) return '0 GB';
  const gb = bytes / BYTES_PER_GB;
  if (gb >= 1) return `${Number.isInteger(gb) ? gb : gb.toFixed(1)} GB`;
  const mb = bytes / 1024 ** 2;
  return `${Math.round(mb)} MB`;
}

export function gbToBytes(gb: number): number {
  return Math.round(gb * BYTES_PER_GB);
}

export function bytesToGb(bytes: number): number {
  return Math.round((bytes / BYTES_PER_GB) * 100) / 100;
}

export function formatCount(value: number | null): string {
  return value === null ? '—' : new Intl.NumberFormat('es-419').format(value);
}

export function formatDays(value: number | null): string {
  return value === null ? '—' : `${new Intl.NumberFormat('es-419').format(value)} días`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-419', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

/** Formats a byte count as a whole-GB label for compact table cells. */
export function formatGbCompact(bytes: number | null): string {
  return bytes === null ? '—' : `${Math.round(bytes / BYTES_PER_GB)} GB`;
}
