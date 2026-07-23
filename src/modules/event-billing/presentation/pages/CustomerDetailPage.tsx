import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertTriangle, CalendarDays } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getErrorMessage } from '@/shared/utils/errors';
import { formatDate } from '@/shared/catalog';
import { useAccountEvents, useBillingAccount } from '../hooks';
import { ACCOUNT_ID_PARAM, customersRoutes } from '../routes';
import { AccountStatusBadge, BillingBreadcrumb, CommercialStatusBadge } from '../components';

/** CustomerDetailPage — a billing account with its events (each links to Event Billing). */
export function CustomerDetailPage() {
  const navigate = useNavigate();
  const { [ACCOUNT_ID_PARAM]: accountId } = useParams();
  const { data: account, isLoading, isError, error } = useBillingAccount(accountId);
  const { data: events = [], isLoading: eventsLoading } = useAccountEvents(accountId);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando cuenta…
        </div>
      </PageContainer>
    );
  }

  if (isError || !account) {
    return (
      <PageContainer>
        <EmptyState
          icon={AlertTriangle}
          title="Cuenta no encontrada"
          description={isError ? getErrorMessage(error) : 'La cuenta que buscas no existe.'}
          action={<Button variant="outline" size="sm" onClick={() => navigate(customersRoutes.list)}>Volver a customers</Button>}
        />
      </PageContainer>
    );
  }

  const title = account.displayName || account.ownerId;

  return (
    <PageContainer className="max-w-4xl">
      <BillingBreadcrumb trail={[{ label: title }]} />
      <PageHeader title={title} description={`Cuenta ${account.id}`} actions={<AccountStatusBadge status={account.status} />} />

      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Moneda</span>
              <span>{account.currency ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">País</span>
              <span>{account.country ?? '—'}</span>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">Creada {formatDate(account.createdAt)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Cargando eventos…
              </div>
            ) : events.length === 0 ? (
              <EmptyState icon={CalendarDays} title="Sin eventos" description="Esta cuenta todavía no tiene eventos." />
            ) : (
              <ul className="divide-y">
                {events.map((ev) => (
                  <li key={ev.eventId} className="flex items-center justify-between gap-3 py-3">
                    <Link
                      to={customersRoutes.eventBilling(account.id, ev.eventId)}
                      className="font-medium hover:underline"
                    >
                      {ev.eventName}
                    </Link>
                    {ev.commercialStatus ? <CommercialStatusBadge status={ev.commercialStatus} /> : (
                      <span className="text-xs text-muted-foreground">Sin billing</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
