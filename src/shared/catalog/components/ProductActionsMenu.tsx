import {
  MoreHorizontal, Eye, Pencil, Copy, EyeOff, Archive, ArchiveRestore,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import type { ProductStatus, ProductVisibility } from '../product';

interface ProductActionsMenuProps {
  product: { status: ProductStatus; visibility: ProductVisibility };
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onArchive: () => void;
  onRestore: () => void;
  disabled?: boolean;
}

/**
 * The per-row action menu for any catalog product. Presentational: it decides
 * which items apply to the given status/visibility and calls the parent handlers.
 */
export function ProductActionsMenu({
  product, onView, onEdit, onDuplicate, onToggleVisibility, onArchive, onRestore, disabled,
}: ProductActionsMenuProps) {
  const isArchived = product.status === 'archived';
  const isPublic = product.visibility === 'public';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Acciones" disabled={disabled}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onView}>
          <Eye /> Ver detalle
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDuplicate}>
          <Copy /> Duplicar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onToggleVisibility}>
          {isPublic ? <EyeOff /> : <Eye />}
          {isPublic ? 'Ocultar' : 'Mostrar'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isArchived ? (
          <DropdownMenuItem onSelect={onRestore}>
            <ArchiveRestore /> Restaurar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={onArchive} className="text-destructive focus:text-destructive">
            <Archive /> Archivar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
