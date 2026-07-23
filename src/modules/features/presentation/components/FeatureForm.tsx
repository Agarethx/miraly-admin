import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { FormField } from '@/shared/components/FormField';
import { Select } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { VALUE_TYPES, valueTypeLabel } from '@/shared/catalog';
import { featureFormSchema, type FeatureFormValues } from '../feature-form-schema';

interface FeatureFormProps {
  defaultValues: FeatureFormValues;
  /** Code is the PK: editable only on create. */
  codeEditable: boolean;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: FeatureFormValues) => void;
  onCancel: () => void;
}

const TYPE_OPTIONS = VALUE_TYPES.map((t) => ({ value: t, label: `${valueTypeLabel(t)} (${t})` }));
const AGGREGATION_OPTIONS = [
  { value: 'sum', label: 'Suma (sum)' },
  { value: 'max', label: 'Máximo (max)' },
];

/** FeatureForm — create/edit form. Fully typed via RHF + Zod. */
export function FeatureForm({ defaultValues, codeEditable, submitLabel, submitting, onSubmit, onCancel }: FeatureFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FeatureFormValues>({
    resolver: zodResolver(featureFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Identidad</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Código"
            htmlFor="code"
            required
            error={errors.code?.message}
            hint={codeEditable ? 'MAYÚSCULAS, inmutable luego.' : 'No se puede cambiar.'}
          >
            <Input id="code" {...register('code')} className="font-mono uppercase" disabled={!codeEditable} placeholder="PHOTO_UPLOAD" />
          </FormField>
          <FormField label="Nombre" htmlFor="name" required error={errors.name?.message}>
            <Input id="name" {...register('name')} placeholder="Subida de fotos" />
          </FormField>
          <FormField label="Descripción" htmlFor="description" error={errors.description?.message} className="sm:col-span-2">
            <Textarea id="description" {...register('description')} rows={3} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipo y resolución</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tipo de valor" htmlFor="valueType" error={errors.valueType?.message}>
            <Select id="valueType" options={TYPE_OPTIONS} {...register('valueType')} />
          </FormField>
          <FormField
            label="Agregación"
            htmlFor="aggregation"
            error={errors.aggregation?.message}
            hint="Cómo se combinan los incrementos (sum / max)."
          >
            <Select id="aggregation" options={AGGREGATION_OPTIONS} {...register('aggregation')} />
          </FormField>
          <FormField label="Unidad" htmlFor="unit" error={errors.unit?.message} hint="Opcional (bytes, days, count…).">
            <Input id="unit" {...register('unit')} placeholder="bytes" />
          </FormField>
          <FormField label="Orden" htmlFor="sortOrder" error={errors.sortOrder?.message} hint="Menor = primero.">
            <Input id="sortOrder" type="number" min={0} step={1} {...register('sortOrder')} />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancelar</Button>
        <Button type="submit" disabled={submitting || !isDirty}>
          {submitting ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
