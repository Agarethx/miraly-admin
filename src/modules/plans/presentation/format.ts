/**
 * Plan formatters — re-exported from the shared catalog kernel. Kept as a module
 * entry point so existing imports (`../format`) are unchanged.
 */
export {
  formatMoney,
  toMinorUnits,
  toMajorUnits,
  formatBytes,
  gbToBytes,
  bytesToGb,
  formatCount,
  formatDays,
  formatDate,
  formatGbCompact,
} from '@/shared/catalog';
