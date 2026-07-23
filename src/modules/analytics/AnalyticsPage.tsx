import { BarChart3 } from 'lucide-react';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export function AnalyticsPage() {
  return (
    <ModulePlaceholder
      title="Analytics"
      description="Métricas comerciales de la plataforma."
      icon={BarChart3}
      phase="Billing 2.5 (Analytics)"
    />
  );
}
