import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

/**
 * Badge — a compact status pill built only from design-system tokens (no
 * hardcoded colors). Promoted to shared in Billing 1.3 (used by Plans, Addons, …).
 */
export type BadgeTone = 'neutral' | 'solid' | 'accent' | 'danger';

const TONES: Record<BadgeTone, string> = {
  neutral: 'border border-border bg-transparent text-muted-foreground',
  solid: 'bg-secondary text-secondary-foreground',
  accent: 'bg-foreground/10 text-foreground',
  danger: 'border border-destructive/30 bg-destructive/10 text-destructive',
};

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', dot = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium [&_svg]:size-3',
        TONES[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}
