import { AlertTriangle } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingTable } from '@/shared/components/LoadingTable';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { Select } from '@/shared/components/ui/select';
import { getErrorMessage } from '@/shared/utils/errors';
import { CatalogSearch, DataPagination } from '@/shared/catalog';
import { Users2 } from 'lucide-react';
import { pageCount, type AccountStatus } from '../../domain';
import { useAccountListQuery, useBillingAccounts } from '../hooks';
import { CustomersTable, CustomerCard } from '../components';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activas' },
  { value: 'suspended', label: 'Suspendidas' },
  { value: 'closed', label: 'Cerradas' },
];

/** CustomersListPage — Billing → Customers: the Billing Accounts list. */
export function CustomersListPage() {
  const { query, setSearch, setStatus, setPage, isFiltered, clear } = useAccountListQuery();
  const { data, isLoading, isError, error, refetch } = useBillingAccounts(query);

  const items = data?.items ?? [];
  const totalPages = data ? pageCount(data) : 1;

  return (
    <PageContainer>
      <PageHeader
        title="Customers"
        description="Cuentas de facturación. Cada organizer tiene una cuenta; cada cuenta agrupa sus eventos."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CatalogSearch value={query.search} onChange={setSearch} placeholder="Buscar por nombre de cuenta…" />
        <Select
          options={STATUS_OPTIONS}
          value={query.status}
          onChange={(e) => setStatus(e.target.value as AccountStatus | 'all')}
          aria-label="Filtrar por estado"
          className="w-44"
        />
      </div>

      {isLoading ? (
        <LoadingTable rows={8} columns={7} />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="No se pudieron cargar las cuentas"
          description={getErrorMessage(error)}
          action={<Button variant="outline" size="sm" onClick={() => void refetch()}>Reintentar</Button>}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="Sin cuentas"
          description={isFiltered ? 'Ninguna cuenta coincide con los filtros.' : 'Todavía no hay cuentas de facturación.'}
          action={isFiltered ? <Button variant="outline" size="sm" onClick={clear}>Limpiar filtros</Button> : undefined}
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <CustomersTable accounts={items} />
          </div>
          <div className="grid gap-3 lg:hidden">
            {items.map((account) => <CustomerCard key={account.id} account={account} />)}
          </div>
          <DataPagination
            page={query.page}
            totalPages={totalPages}
            total={data?.total ?? 0}
            showing={items.length}
            unit={['cuenta', 'cuentas']}
            onPageChange={setPage}
          />
        </>
      )}
    </PageContainer>
  );
}
