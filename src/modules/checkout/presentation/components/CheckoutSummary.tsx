import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { PriceBreakdown } from '../../domain';
import { PriceBreakdownView } from './PriceBreakdownView';

/**
 * CheckoutSummary — the always-visible order summary. Sticky on desktop so the
 * total stays in view while the user edits addons.
 */
export function CheckoutSummary({
  breakdown,
  loading,
}: {
  breakdown: PriceBreakdown | null;
  loading?: boolean;
}) {
  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader>
        <CardTitle>Resumen de compra</CardTitle>
      </CardHeader>
      <CardContent>
        {loading || !breakdown ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Calculando…
          </div>
        ) : (
          <>
            <PriceBreakdownView breakdown={breakdown} />
            <p className="mt-3 text-xs text-muted-foreground">
              No se cobra nada ahora. La orden queda en pago pendiente.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
