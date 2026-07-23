import { Settings } from 'lucide-react';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export function SettingsPage() {
  return (
    <ModulePlaceholder
      title="Settings"
      description="Configuración del Backoffice (monedas, impuestos, proveedores)."
      icon={Settings}
      phase="Billing 3.1 (Complete Backoffice)"
    />
  );
}
