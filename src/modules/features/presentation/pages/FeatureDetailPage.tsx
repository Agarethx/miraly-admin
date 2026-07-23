import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertTriangle, Pencil, Power, PowerOff } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getErrorMessage } from '@/shared/utils/errors';
import { ProductStatusBadge, formatDate } from '@/shared/catalog';
import { useFeature, useFeatureMutations } from '../hooks';
import { FEATURE_CODE_PARAM, featureRoutes } from '../routes';
import { FeatureBreadcrumb, FeatureValueTypeBadge } from '../components';

/** FeatureDetailPage — the full read view of a feature. */
export function FeatureDetailPage() {
  const navigate = useNavigate();
  const { [FEATURE_CODE_PARAM]: code } = useParams();
  const { data: feature, isLoading, isError, error } = useFeature(code);
  const { toggle } = useFeatureMutations();

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando feature…
        </div>
      </PageContainer>
    );
  }

  if (isError || !feature) {
    return (
      <PageContainer>
        <EmptyState
          icon={AlertTriangle}
          title="Feature no encontrada"
          description={isError ? getErrorMessage(error) : 'La feature que buscas no existe.'}
          action={<Button variant="outline" size="sm" onClick={() => navigate(featureRoutes.list)}>Volver a features</Button>}
        />
      </PageContainer>
    );
  }

  const isActive = feature.status === 'active';

  return (
    <PageContainer className="max-w-3xl">
      <FeatureBreadcrumb trail={[{ label: feature.name }]} />
      <PageHeader
        title={feature.name}
        description={`Código ${feature.code}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(featureRoutes.edit(feature.code))}>
              <Pencil className="size-4" /> Editar
            </Button>
            <Button
              variant={isActive ? 'ghost' : 'default'}
              onClick={() => toggle.mutate({ code: feature.code, current: feature.status })}
            >
              {isActive ? <PowerOff className="size-4" /> : <Power className="size-4" />}
              {isActive ? 'Desactivar' : 'Activar'}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Estado</span>
              <ProductStatusBadge status={feature.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Tipo</span>
              <FeatureValueTypeBadge valueType={feature.valueType} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Agregación</span>
              <span>{feature.aggregation}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Unidad</span>
              <span>{feature.unit ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Orden</span>
              <span className="tabular-nums">{feature.sortOrder}</span>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              Creado {formatDate(feature.createdAt)}
              {feature.updatedAt ? ` · Actualizado ${formatDate(feature.updatedAt)}` : ''}
            </div>
          </CardContent>
        </Card>

        {feature.description ? (
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">{feature.description}</CardContent>
          </Card>
        ) : null}
      </div>
    </PageContainer>
  );
}
