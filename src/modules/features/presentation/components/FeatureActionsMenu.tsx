import { MoreHorizontal, Eye, Pencil, Power, PowerOff } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import type { FeatureStatus } from '../../domain';

interface FeatureActionsMenuProps {
  status: FeatureStatus;
  onView: () => void;
  onEdit: () => void;
  /** Activar/Desactivar (= restaurar/archivar): flips active ↔ archived. */
  onToggle: () => void;
  disabled?: boolean;
}

/** Per-row action menu for a feature. */
export function FeatureActionsMenu({ status, onView, onEdit, onToggle, disabled }: FeatureActionsMenuProps) {
  const isActive = status === 'active';
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Acciones" disabled={disabled}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onView}><Eye /> Ver detalle</DropdownMenuItem>
        <DropdownMenuItem onSelect={onEdit}><Pencil /> Editar</DropdownMenuItem>
        <DropdownMenuSeparator />
        {isActive ? (
          <DropdownMenuItem onSelect={onToggle} className="text-destructive focus:text-destructive">
            <PowerOff /> Desactivar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={onToggle}><Power /> Activar</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
