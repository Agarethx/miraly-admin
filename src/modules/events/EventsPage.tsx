import { CalendarDays } from 'lucide-react';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export function EventsPage() {
  return (
    <ModulePlaceholder
      title="Events"
      description="Eventos de la plataforma (vista de billing)."
      icon={CalendarDays}
      phase="Billing 3.1 (Complete Backoffice)"
    />
  );
}
