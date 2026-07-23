import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { navigation } from '@/shared/config/navigation';

/**
 * Breadcrumb — derives "Group / Page" from the current route using the same
 * navigation config the sidebar uses, so labels never drift.
 */
export function Breadcrumb() {
  const { pathname } = useLocation();

  // Longest matching nav item wins, so sub-routes (e.g. /billing/plans/new)
  // still resolve to their parent ("Billing / Plans") instead of falling back.
  for (const group of navigation) {
    const item = [...group.items]
      .filter((i) => pathname === i.to || pathname.startsWith(`${i.to}/`))
      .sort((a, b) => b.to.length - a.to.length)[0];
    if (item) {
      return (
        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <span className="text-muted-foreground">{group.label}</span>
          <ChevronRight className="size-3.5 text-muted-foreground/60" />
          <span className="font-medium text-foreground">{item.label}</span>
        </nav>
      );
    }
  }

  return <span className="text-sm font-medium text-foreground">Backoffice</span>;
}
