import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/cn';
import { ProductStatusBadge, formatDate } from '@/shared/catalog';
import type { Feature } from '../../domain';
import { featureRoutes } from '../routes';
import { FeatureValueTypeBadge } from './FeatureValueTypeBadge';
import { FeatureActionsMenu } from './FeatureActionsMenu';

interface FeatureCardProps {
  feature: Feature;
  onView: (feature: Feature) => void;
  onEdit: (feature: Feature) => void;
  onToggle: (feature: Feature) => void;
  busy?: boolean;
}

/** FeatureCard — the card form of a feature row for the responsive list. */
export function FeatureCard({ feature, onView, onEdit, onToggle, busy }: FeatureCardProps) {
  return (
    <Card className={cn('transition-opacity', busy && 'opacity-50')}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <Link to={featureRoutes.detail(feature.code)} className="block truncate font-medium hover:underline">
              {feature.name}
            </Link>
            <code className="font-mono text-xs text-muted-foreground">{feature.code}</code>
          </div>
          <FeatureActionsMenu
            status={feature.status}
            disabled={busy}
            onView={() => onView(feature)}
            onEdit={() => onEdit(feature)}
            onToggle={() => onToggle(feature)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FeatureValueTypeBadge valueType={feature.valueType} />
          <ProductStatusBadge status={feature.status} />
          <span className="ml-auto text-xs text-muted-foreground">{formatDate(feature.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
