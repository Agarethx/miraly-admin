import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { FormField } from '@/shared/components/FormField';
import { Select } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { planFormSchema, type PlanFormValues } from '../plan-form-schema';

interface PlanFormProps {
  defaultValues: PlanFormValues;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: PlanFormValues) => void;
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
 * PlanForm — the create/edit form. Fully typed via RHF + Zod; no business logic
 * lives here. It emits validated `PlanFormValues`; the page maps them to the
 * write model through a use case. Grouped into clean sections, never a giant modal.
 */
export function PlanForm({ defaultValues, submitLabel, submitting, onSubmit, onCancel }: PlanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
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
          <FormField label="Nombre (ES)" htmlFor="nameEs" required error={errors.nameEs?.message}>
            <Input id="nameEs" {...register('nameEs')} placeholder="Ej. Plan Esencial" />
          </FormField>
          <FormField label="Nombre (EN)" htmlFor="nameEn" error={errors.nameEn?.message} hint="Opcional.">
            <Input id="nameEn" {...register('nameEn')} placeholder="Ej. Essential Plan" />
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
          <FormField
            label="Orden"
            htmlFor="sortOrder"
            error={errors.sortOrder?.message}
            hint="Menor = primero."
          >
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
            hint="En unidades mayores (ej. 49.99)."
          >
            <Input id="amount" type="number" min={0} step="0.01" {...register('amount')} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Límites</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="Invitados"
            htmlFor="guests"
            error={errors.guests?.message}
            hint="Vacío = sin límite definido."
          >
            <Input id="guests" type="number" min={0} step={1} {...register('guests')} />
          </FormField>
          <FormField
            label="Almacenamiento (GB)"
            htmlFor="storageGb"
            error={errors.storageGb?.message}
            hint="Vacío = sin límite definido."
          >
            <Input id="storageGb" type="number" min={0} step="0.1" {...register('storageGb')} />
          </FormField>
          <FormField
            label="Retención (días)"
            htmlFor="retentionDays"
            error={errors.retentionDays?.message}
            hint="Vacío = sin límite definido."
          >
            <Input id="retentionDays" type="number" min={0} step={1} {...register('retentionDays')} />
          </FormField>
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
