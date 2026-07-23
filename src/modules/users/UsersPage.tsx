import { UserCog } from 'lucide-react';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export function UsersPage() {
  return (
    <ModulePlaceholder
      title="Users"
      description="Usuarios y administradores (RBAC)."
      icon={UserCog}
      phase="Billing 3.1 (Complete Backoffice)"
    />
  );
}
