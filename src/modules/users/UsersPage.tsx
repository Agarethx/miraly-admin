import { useState, type FormEvent, type ComponentType } from 'react';
import { Trash2, ShieldCheck, Briefcase } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { useSession } from '@/shared/providers/SessionProvider';
import { useAdmins, usePlanners, useUserMutations } from './presentation/use-users';

/** One row in a management list: a primary label, optional secondary, remove action. */
interface PanelItem {
  id: string;
  primary: string;
  secondary?: string | null;
  canRemove: boolean;
}

interface ManagePanelProps {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  placeholder: string;
  addLabel: string;
  items: PanelItem[];
  isLoading: boolean;
  isAdding: boolean;
  removingId: string | null;
  emptyText: string;
  onAdd: (email: string) => void;
  onRemove: (id: string) => void;
}

function ManagePanel({
  title,
  description,
  icon: Icon,
  placeholder,
  addLabel,
  items,
  isLoading,
  isAdding,
  removingId,
  emptyText,
  onAdd,
  onRemove,
}: ManagePanelProps) {
  const [email, setEmail] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = email.trim();
    if (!clean) return;
    onAdd(clean);
    setEmail('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />
          <Button type="submit" disabled={isAdding || !email.trim()}>
            {isAdding ? 'Agregando…' : addLabel}
          </Button>
        </form>

        <div className="divide-y rounded-md border">
          {isLoading ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">{emptyText}</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.primary}</p>
                  {item.secondary ? (
                    <p className="truncate text-xs text-muted-foreground">{item.secondary}</p>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!item.canRemove || removingId === item.id}
                  onClick={() => onRemove(item.id)}
                  aria-label={`Quitar ${item.primary}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function UsersPage() {
  const { admin } = useSession();
  const admins = useAdmins();
  const planners = usePlanners();
  const { promote, revoke, makePlanner, removePlanner } = useUserMutations();

  const adminItems: PanelItem[] = (admins.data ?? []).map((a) => ({
    id: a.userId,
    primary: a.email,
    secondary: 'Administrador de plataforma',
    canRemove: a.userId !== admin?.id, // never let an admin remove themselves
  }));

  const plannerItems: PanelItem[] = (planners.data ?? []).map((p) => ({
    id: p.ownerId,
    primary: p.fullName?.trim() || p.email,
    secondary: p.fullName?.trim() ? p.email : 'Wedding planner',
    canRemove: true,
  }));

  return (
    <PageContainer>
      <PageHeader
        title="Usuarios"
        description="Administradores de plataforma y wedding planners. Se gestiona por email sobre usuarios ya registrados; no se crean cuentas nuevas desde aquí."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ManagePanel
          title="Administradores"
          description="Acceso completo al Backoffice. Solo un admin puede agregar o quitar otros."
          icon={ShieldCheck}
          placeholder="email@registrado.com"
          addLabel="Agregar admin"
          items={adminItems}
          isLoading={admins.isLoading}
          isAdding={promote.isPending}
          removingId={revoke.isPending ? (revoke.variables ?? null) : null}
          emptyText="Aún no hay administradores."
          onAdd={(email) => promote.mutate(email)}
          onRemove={(userId) => revoke.mutate(userId)}
        />

        <ManagePanel
          title="Planners"
          description="Organizadores marcados como wedding_planner: pagan el precio planner por evento."
          icon={Briefcase}
          placeholder="email@organizador.com"
          addLabel="Marcar planner"
          items={plannerItems}
          isLoading={planners.isLoading}
          isAdding={makePlanner.isPending}
          removingId={removePlanner.isPending ? (removePlanner.variables ?? null) : null}
          emptyText="Aún no hay planners."
          onAdd={(email) => makePlanner.mutate(email)}
          onRemove={(ownerId) => removePlanner.mutate(ownerId)}
        />
      </div>
    </PageContainer>
  );
}
