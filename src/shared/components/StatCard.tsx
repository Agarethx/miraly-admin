import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

interface StatCardProps {
  label: string;
  /** The metric. Foundation renders placeholders (e.g. "—"); no data is fetched. */
  value: string;
  hint?: string;
  icon?: LucideIcon;
}

/** A compact KPI tile. In Billing 1.1 values are placeholders only. */
export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon ? <Icon className="size-4 text-muted-foreground/70" /> : null}
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
