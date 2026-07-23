import { NavLink } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { navigation, type NavItem } from '@/shared/config/navigation';

/** One navigation row. Active state comes from the router. */
function SidebarItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
          isActive
            ? 'bg-sidebar-accent text-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

/** A titled group of items. */
function SidebarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-2.5 pb-0.5 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      {children}
    </div>
  );
}

interface SidebarProps {
  /** Mobile drawer open state. */
  open: boolean;
  onClose: () => void;
}

/**
 * Sidebar — the primary navigation. Fixed on desktop; a slide-in drawer on mobile
 * (controlled by the Topbar's menu button).
 */
export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Backoffice</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {navigation.map((group) => (
            <SidebarGroup key={group.label} label={group.label}>
              {group.items.map((item) => (
                <SidebarItem key={item.to} item={item} onNavigate={onClose} />
              ))}
            </SidebarGroup>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <p className="px-1 text-[11px] text-muted-foreground">Billing · v0.1 (Foundation)</p>
        </div>
      </aside>
    </>
  );
}
