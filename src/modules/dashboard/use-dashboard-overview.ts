import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/services/supabase';

export interface DashboardOverview {
  activePlans: number;
  orders: number;
  payments: number;
  customers: number;
}

/**
 * Home KPIs: active plans, orders, payments and customers, read straight from
 * the billing tables (the same tables the Billing dashboard reads). These are
 * exact-count head queries — no rows are transferred. A table that RLS hides
 * returns count 0 rather than an error.
 */
export function useDashboardOverview() {
  return useQuery<DashboardOverview>({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const [activePlans, orders, payments, customers] = await Promise.all([
        supabase
          .from('billing_products')
          .select('*', { count: 'exact', head: true })
          .eq('product_type', 'plan')
          .eq('status', 'active'),
        supabase
          .from('billing_orders')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null),
        supabase.from('billing_payments').select('*', { count: 'exact', head: true }),
        supabase.from('billing_accounts').select('*', { count: 'exact', head: true }),
      ]);

      for (const r of [activePlans, orders, payments, customers]) {
        if (r.error) throw r.error;
      }

      return {
        activePlans: activePlans.count ?? 0,
        orders: orders.count ?? 0,
        payments: payments.count ?? 0,
        customers: customers.count ?? 0,
      };
    },
  });
}
