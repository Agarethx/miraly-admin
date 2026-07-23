import { Badge } from '@/shared/components/ui/badge';
import { valueTypeLabel } from '@/shared/catalog';
import type { ValueType } from '../../domain';

/** Badge for a feature's value type (Booleano, Entero, …). */
export function FeatureValueTypeBadge({ valueType }: { valueType: ValueType }) {
  return <Badge tone="neutral" className="font-mono">{valueTypeLabel(valueType)}</Badge>;
}
