import { AlertTriangle, Receipt } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingTable } from '@/shared/components/LoadingTable';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { Select } from '@/shared/components/ui/select';
import { getErrorMessage } from '@/shared/utils/errors';
import { CatalogSearch, DataPagination } from '@/shared/catalog';
import { pageCount, type OrderStatus } from '../../domain';
import { useOrderListQuery, useOrders } from '../hooks';
import { OrdersTable } from '../components';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PENDING_PAYMENT', label: 'Pago pendiente' },
  { value: 'PAID', label: 'Pagada' },
  { value: 'EXPIRED', label: 'Expirada' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'REFUNDED', label: 'Reembolsada' },
];

/** OrderListPage — Billing → Orders. */
export function OrderListPage() {
  const { query, setSearch, setStatus, setPage, isFiltered, clear } = useOrderListQuery();
  const { data, isLoading, isError, error, refetch } = useOrders(query);

  const items = data?.items ?? [];
  const totalPages = data ? pageCount(data) : 1;

  return (
    <PageContainer>
      <PageHeader
        title="Orders"
        description="Contratos comerciales. Cada orden es un snapshot inmutable de una compra."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CatalogSearch value={query.search} onChange={setSearch} placeholder="Buscar por número…" />
        <Select
          options={STATUS_OPTIONS}
          value={query.status}
          onChange={(e) => setStatus(e.target.value as OrderStatus | 'all')}
          aria-label="Filtrar por estado"
          className="w-48"
        />
      </div>

      {isLoading ? (
        <LoadingTable rows={8} columns={7} />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="No se pudieron cargar las órdenes"
          description={getErrorMessage(error)}
          action={<Button variant="outline" size="sm" onClick={() => void refetch()}>Reintentar</Button>}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sin órdenes"
          description={isFiltered ? 'Ninguna orden coincide con los filtros.' : 'Las órdenes se generan desde el Event Billing de un evento.'}
          action={isFiltered ? <Button variant="outline" size="sm" onClick={clear}>Limpiar filtros</Button> : undefined}
        />
      ) : (
        <>
          <OrdersTable orders={items} />
          <DataPagination
            page={query.page}
            totalPages={totalPages}
            total={data?.total ?? 0}
            showing={items.length}
            unit={['orden', 'órdenes']}
            onPageChange={setPage}
          />
        </>
      )}
    </PageContainer>
  );
}
