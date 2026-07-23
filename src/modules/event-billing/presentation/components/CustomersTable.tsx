import { Link } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { formatDate } from '@/shared/catalog';
import type { BillingAccountSummary } from '../../domain';
import { customersRoutes } from '../routes';
import { AccountStatusBadge } from './AccountStatusBadge';

/** CustomersTable — the Billing Accounts table. */
export function CustomersTable({ accounts }: { accounts: BillingAccountSummary[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
            <th className="px-3 py-2.5 text-left font-medium">Cuenta</th>
            <th className="px-3 py-2.5 text-left font-medium">Owner</th>
            <th className="px-3 py-2.5 text-right font-medium">Eventos</th>
            <th className="px-3 py-2.5 text-left font-medium">Plan actual</th>
            <th className="px-3 py-2.5 text-right font-medium">Activos</th>
            <th className="px-3 py-2.5 text-right font-medium">Facturación total</th>
            <th className="px-3 py-2.5 text-left font-medium">Estado</th>
            <th className="px-3 py-2.5 text-left font-medium">Creación</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.id} className={cn('border-b transition-colors last:border-0 hover:bg-muted/30')}>
              <td className="px-3 py-2">
                <Link to={customersRoutes.account(a.id)} className="font-medium text-foreground hover:underline">
                  {a.displayName || a.ownerName || a.ownerEmail}
                </Link>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{a.ownerEmail}</td>
              <td className="px-3 py-2 text-right tabular-nums">{a.eventCount}</td>
              <td className="px-3 py-2">{a.currentPlanLabel ?? '—'}</td>
              <td className="px-3 py-2 text-right tabular-nums">{a.activeEventCount}</td>
              <td className="px-3 py-2 text-right text-muted-foreground">—</td>
              <td className="px-3 py-2"><AccountStatusBadge status={a.status} /></td>
              <td className="px-3 py-2 text-muted-foreground">{formatDate(a.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
