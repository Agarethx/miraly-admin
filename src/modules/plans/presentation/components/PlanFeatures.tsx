import { Puzzle, ToggleRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Badge } from '@/shared/components/ui/badge';

/**
 * PlanFeatures — read-only summary of a plan's feature grants and compatible
 * addons. Editing these belongs to the Features / Addons modules (out of scope
 * for Billing 1.2), so here they are counts (`count`) or code chips (`list`).
 */
interface CountProps {
  variant?: 'count';
  featureCount: number;
  allowedAddonCount: number;
  className?: string;
}

interface ListProps {
  variant: 'list';
  featureCodes: string[];
  className?: string;
}

type PlanFeaturesProps = CountProps | ListProps;

export function PlanFeatures(props: PlanFeaturesProps) {
  if (props.variant === 'list') {
    return (
      <div className={cn('flex flex-wrap gap-1.5', props.className)}>
        {props.featureCodes.length === 0 ? (
          <span className="text-sm text-muted-foreground">Sin features asignadas.</span>
        ) : (
          props.featureCodes.map((code) => (
            <Badge key={code} tone="solid" className="font-mono">
              {code}
            </Badge>
          ))
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 text-sm text-muted-foreground', props.className)}>
      <span className="flex items-center gap-1.5">
        <ToggleRight className="size-3.5" />
        <span className="tabular-nums text-foreground">{props.featureCount}</span> features
      </span>
      <span className="flex items-center gap-1.5">
        <Puzzle className="size-3.5" />
        <span className="tabular-nums text-foreground">{props.allowedAddonCount}</span> addons
      </span>
    </div>
  );
}
