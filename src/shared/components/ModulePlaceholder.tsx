import type { LucideIcon } from 'lucide-react';
import { PageContainer } from './PageContainer';
import { PageHeader } from './PageHeader';
import { EmptyState } from './EmptyState';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Which future phase brings this module to life. */
  phase: string;
}

/**
 * ModulePlaceholder — the consistent empty screen every not-yet-built module
 * renders in Billing 1.1. No data, no CRUD; it only establishes the route and the
 * page chrome so navigation is complete.
 */
export function ModulePlaceholder({ title, description, icon, phase }: ModulePlaceholderProps) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title="En construcción"
        description={`Este módulo se implementa en ${phase}. La fundación (layout, navegación, auth y design system) ya está lista.`}
      />
    </PageContainer>
  );
}
