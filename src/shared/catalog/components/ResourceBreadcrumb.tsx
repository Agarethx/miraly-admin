import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

interface Crumb {
  label: string;
  to?: string;
}

/**
 * In-page breadcrumb trail for a resource's deep routes (create/edit/detail),
 * where the topbar breadcrumb only resolves to the section. Adds the base
 * segment + the record-specific trail. Shared by catalog modules.
 */
export function ResourceBreadcrumb({
  baseLabel,
  baseHref,
  trail,
}: {
  baseLabel: string;
  baseHref: string;
  trail: Crumb[];
}) {
  const crumbs: Crumb[] = [{ label: baseLabel, to: baseHref }, ...trail];
  return (
    <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Ruta">
      {crumbs.map((crumb, i) => {
        const last = i === crumbs.length - 1;
        return (
          <Fragment key={`${crumb.label}-${i}`}>
            {i > 0 ? <ChevronRight className="size-3.5 text-muted-foreground/60" /> : null}
            {crumb.to && !last ? (
              <Link to={crumb.to} className="transition-colors hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span className={last ? 'font-medium text-foreground' : undefined}>{crumb.label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
