import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { FormField } from '@/shared/components/FormField';
import { Select } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import type { PlanOption } from '../../domain';
import { addonFormSchema, type AddonFormValues } from '../addon-form-schema';
import { AddonPlanSelector } from './AddonPlanSelector';

interface AddonFormProps {
  defaultValues: AddonFormValues;
  submitLabel: string;
  submitting: boolean;
  planOptions: PlanOption[];
  planOptionsLoading: boolean;
  onSubmit: (values: AddonFormValues) => void;
  onCancel: () => void;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Visible (público)' },
  { value: 'private', label: 'Privado' },
  { value: 'hidden', label: 'Oculto' },
];

/**
 * AddonForm — create/edit form. Same design as PlanForm (shared FormField/Select/
 * Textarea); the fields and labels differ: increments ("Participantes") and the
 * compatible-plans multi-select. Fully typed via RHF + Zod.
 */
export function AddonForm({
  defaultValues, submitLabel, submitting, planOptions, planOptionsLoading, onSubmit, onCancel,
}: AddonFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AddonFormValues>({
    resolver: zodResolver(addonFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const allPlans = watch('allPlans');
  const compatiblePlanIds = watch('compatiblePlanIds');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Identidad</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre (ES)" htmlFor="nameEs" required error={errors.nameEs?.message}>
            <Input id="nameEs" {...register('nameEs')} placeholder="Ej. Pack Invitados Extra" />
          </FormField>
          <FormField label="Nombre (EN)" htmlFor="nameEn" error={errors.nameEn?.message} hint="Opcional.">
            <Input id="nameEn" {...register('nameEn')} placeholder="Ej. Extra Guests Pack" />
          </FormField>
          <FormField
            label="Descripción (ES)"
            htmlFor="descriptionEs"
            error={errors.descriptionEs?.message}
            className="sm:col-span-2"
          >
            <Textarea id="descriptionEs" {...register('descriptionEs')} rows={3} />
          </FormField>
          <FormField
            label="Descripción (EN)"
            htmlFor="descriptionEn"
            error={errors.descriptionEn?.message}
            hint="Opcional."
            className="sm:col-span-2"
          >
            <Textarea id="descriptionEn" {...register('descriptionEn')} rows={3} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publicación</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <FormField label="Estado" htmlFor="status" error={errors.status?.message}>
            <Select id="status" options={STATUS_OPTIONS} {...register('status')} />
          </FormField>
          <FormField label="Visibilidad" htmlFor="visibility" error={errors.visibility?.message}>
            <Select id="visibility" options={VISIBILITY_OPTIONS} {...register('visibility')} />
          </FormField>
          <FormField label="Orden" htmlFor="sortOrder" error={errors.sortOrder?.message} hint="Menor = primero.">
            <Input id="sortOrder" type="number" min={0} step={1} {...register('sortOrder')} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precio</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Moneda"
            htmlFor="currency"
            error={errors.currency?.message}
            hint="Código ISO-4217 (ej. CLP, USD, EUR). Flow cobra en CLP."
          >
            <Input id="currency" maxLength={3} {...register('currency')} className="uppercase" />
          </FormField>
          <FormField
            label="Monto"
            htmlFor="amount"
            error={errors.amount?.message}
            hint="En unidades mayores (ej. 9.99)."
          >
            <Input id="amount" type="number" min={0} step="0.01" {...register('amount')} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incrementos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="Participantes"
            htmlFor="participants"
            error={errors.participants?.message}
            hint="Suma al límite del plan. Vacío = no incrementa."
          >
            <Input id="participants" type="number" min={0} step={1} {...register('participants')} />
          </FormField>
          <FormField
            label="Almacenamiento (GB)"
            htmlFor="storageGb"
            error={errors.storageGb?.message}
            hint="Vacío = no incrementa."
          >
            <Input id="storageGb" type="number" min={0} step="0.1" {...register('storageGb')} />
          </FormField>
          <FormField
            label="Retención (días)"
            htmlFor="retentionDays"
            error={errors.retentionDays?.message}
            hint="Vacío = no incrementa."
          >
            <Input id="retentionDays" type="number" min={0} step={1} {...register('retentionDays')} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planes compatibles</CardTitle>
        </CardHeader>
        <CardContent>
          <AddonPlanSelector
            options={planOptions}
            value={compatiblePlanIds}
            allPlans={allPlans}
            loading={planOptionsLoading}
            onChange={(ids, all) => {
              setValue('compatiblePlanIds', ids, { shouldDirty: true });
              setValue('allPlans', all, { shouldDirty: true });
            }}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting || !isDirty}>
          {submitting ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
