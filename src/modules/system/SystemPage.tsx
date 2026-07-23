import { Server } from 'lucide-react';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export function SystemPage() {
  return (
    <ModulePlaceholder
      title="System"
      description="Estado del sistema, auditoría y salud de la plataforma."
      icon={Server}
      phase="Billing 3.1 (Complete Backoffice)"
    />
  );
}
