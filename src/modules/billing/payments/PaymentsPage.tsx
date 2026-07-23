import { Wallet } from 'lucide-react';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export function PaymentsPage() {
  return (
    <ModulePlaceholder
      title="Payments"
      description="Pagos y reembolsos."
      icon={Wallet}
      phase="Billing 2.0 (Flow Integration)"
    />
  );
}
