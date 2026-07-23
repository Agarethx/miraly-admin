import type { BillingMetrics } from '../domain';

/** CSV-escapes a value (quotes when it contains comma/quote/newline). */
function esc(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function row(cells: (string | number)[]): string {
  return cells.map(esc).join(',');
}

/** Amounts export as major units (minor/100) so spreadsheets read them as money. */
function major(minor: number): string {
  return (minor / 100).toFixed(2);
}

/** Builds a sectioned CSV report from the dashboard metrics. */
export function buildDashboardCsv(m: BillingMetrics): string {
  const lines: string[] = [];

  lines.push(row(['KPI', 'Valor', 'Moneda']));
  lines.push(row(['Ventas hoy', major(m.salesTodayMinor), m.currency]));
  lines.push(row(['Ventas mes', major(m.salesMonthMinor), m.currency]));
  lines.push(row(['MRR (aprox)', major(m.mrrMinor), m.currency]));
  lines.push(row(['Revenue (período)', major(m.revenueMinor), m.currency]));
  lines.push(row(['Ticket promedio', major(m.avgTicketMinor), m.currency]));
  lines.push(row(['Órdenes pagadas (período)', m.paidOrders, '']));
  lines.push(row(['Eventos activos', m.activeEvents, '']));
  lines.push(row(['Eventos pagados', m.paidEvents, '']));
  lines.push(row(['Eventos pendientes', m.pendingEvents, '']));

  lines.push('');
  lines.push(row(['Top planes', 'Ventas', 'Revenue', 'Moneda']));
  for (const p of m.topPlans) lines.push(row([p.label, p.count, major(p.revenueMinor), m.currency]));

  lines.push('');
  lines.push(row(['Top addons', 'Ventas', 'Revenue', 'Moneda']));
  for (const a of m.topAddons) lines.push(row([a.label, a.count, major(a.revenueMinor), m.currency]));

  lines.push('');
  lines.push(row(['Últimos pagos', 'Proveedor', 'Estado', 'Monto', 'Moneda', 'Fecha']));
  for (const pay of m.recentPayments) {
    lines.push(row([pay.orderNumber ?? '', pay.provider, pay.status, major(pay.amountMinor), pay.currency, pay.createdAt]));
  }

  return lines.join('\n');
}

/** Triggers a client-side CSV download. */
export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
