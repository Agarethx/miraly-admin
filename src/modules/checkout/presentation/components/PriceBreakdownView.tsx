import type { PriceBreakdown } from '../../domain';
import { checkoutMoney } from '../checkout-format';

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={muted ? 'text-muted-foreground' : ''}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

/** The full price breakdown: Base + extras + descuentos + impuestos + total. */
export function PriceBreakdownView({ breakdown }: { breakdown: PriceBreakdown }) {
  const m = (v: number) => checkoutMoney(breakdown.currency, v);
  return (
    <div>
      {breakdown.base ? <Row label={breakdown.base.label} value={m(breakdown.base.amountMinor)} /> : (
        <Row label="Base" value="—" muted />
      )}
      {breakdown.extras.map((e) => (
        <Row key={e.key} label={e.label} value={m(e.amountMinor)} />
      ))}

      <div className="my-2 border-t" />
      <Row label="Subtotal" value={m(breakdown.subtotalMinor)} muted />
      <Row label="Descuentos" value={breakdown.discountMinor > 0 ? `- ${m(breakdown.discountMinor)}` : m(0)} muted />
      {/* Estructura de impuestos preparada; hoy 0. */}
      <Row label="Impuestos" value={m(breakdown.taxMinor)} muted />

      <div className="my-2 border-t" />
      <div className="flex items-center justify-between py-1 text-base font-semibold">
        <span>Total</span>
        <span className="tabular-nums">{m(breakdown.totalMinor)}</span>
      </div>
    </div>
  );
}
