import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { BillingAccountSummary } from '../../domain';
import { customersRoutes } from '../routes';
import { AccountStatusBadge } from './AccountStatusBadge';

/** CustomerCard — the card form of a billing account for the responsive list. */
export function CustomerCard({ account }: { account: BillingAccountSummary }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={customersRoutes.account(account.id)} className="block truncate font-medium hover:underline">
              {account.displayName || account.ownerName || account.ownerEmail}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{account.ownerEmail}</p>
          </div>
          <AccountStatusBadge status={account.status} />
        </div>
        <div className="flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
          <span><span className="tabular-nums text-foreground">{account.eventCount}</span> eventos</span>
          <span><span className="tabular-nums text-foreground">{account.activeEventCount}</span> activos</span>
          <span>{account.currentPlanLabel ?? '—'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
