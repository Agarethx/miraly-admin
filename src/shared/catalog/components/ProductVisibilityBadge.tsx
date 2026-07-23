import { Eye, EyeOff, Lock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ProductVisibility } from '../product';
import { Badge, type BadgeTone } from '@/shared/components/ui/badge';

const VISIBILITY: Record<ProductVisibility, { label: string; tone: BadgeTone; icon: LucideIcon }> = {
  public: { label: 'Visible', tone: 'solid', icon: Eye },
  private: { label: 'Privado', tone: 'neutral', icon: Lock },
  hidden: { label: 'Oculto', tone: 'neutral', icon: EyeOff },
};

/** Visibility badge for any catalog product. */
export function ProductVisibilityBadge({ visibility }: { visibility: ProductVisibility }) {
  const { label, tone, icon: Icon } = VISIBILITY[visibility];
  return (
    <Badge tone={tone}>
      <Icon aria-hidden />
      {label}
    </Badge>
  );
}
