import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useFeatureOptions, useProductEntitlements, useSaveEntitlements } from '../hooks';
import { EntitlementEditor } from './EntitlementEditor';

/**
 * ProductEntitlementsCard — the "Features" section for a product (Plan or Addon).
 * Self-contained: reads the product's entitlements + the active feature registry,
 * and saves via the shared use case. Real UI (never JSON). Reused by both modules.
 */
export function ProductEntitlementsCard({ productId }: { productId: string }) {
  const { data: entitlements = [], isLoading } = useProductEntitlements(productId);
  const { data: featureOptions = [], isLoading: optionsLoading } = useFeatureOptions();
  const save = useSaveEntitlements(productId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Features (entitlements)</CardTitle>
      </CardHeader>
      <CardContent>
        <EntitlementEditor
          entitlements={entitlements}
          featureOptions={featureOptions}
          loading={isLoading || optionsLoading}
          saving={save.isPending}
          onSave={(next) => save.mutate(next)}
        />
      </CardContent>
    </Card>
  );
}
