import { z } from 'zod';
import { VALUE_TYPES } from '@/shared/catalog';
import type { Feature, FeatureWriteModel } from '../domain';

/** Zod schema + RHF types for the Feature form. Spanish messages. */
export const featureFormSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z][A-Z0-9_]*$/, 'MAYÚSCULAS con guiones bajos (ej. PHOTO_UPLOAD).')
    .max(64, 'Máximo 64 caracteres.'),
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(120, 'Máximo 120 caracteres.'),
  description: z.string().trim().max(2000, 'Máximo 2000 caracteres.').optional().or(z.literal('')),
  valueType: z.enum(VALUE_TYPES as unknown as [string, ...string[]], {
    required_error: 'Elige un tipo.',
  }),
  unit: z.string().trim().max(32, 'Máximo 32 caracteres.').optional().or(z.literal('')),
  aggregation: z.enum(['sum', 'max'], { required_error: 'Elige una agregación.' }),
  sortOrder: z.coerce
    .number({ invalid_type_error: 'Ingresa un número válido.' })
    .int('Debe ser un número entero.')
    .min(0, 'No puede ser negativo.'),
});

export type FeatureFormValues = z.infer<typeof featureFormSchema>;

export const emptyFeatureForm: FeatureFormValues = {
  code: '',
  name: '',
  description: '',
  valueType: 'BOOLEAN',
  unit: '',
  aggregation: 'sum',
  sortOrder: 0,
};

export function featureToFormValues(feature: Feature): FeatureFormValues {
  return {
    code: feature.code,
    name: feature.name,
    description: feature.description ?? '',
    valueType: feature.valueType,
    unit: feature.unit ?? '',
    aggregation: feature.aggregation,
    sortOrder: feature.sortOrder,
  };
}

export function formValuesToWriteModel(values: FeatureFormValues): FeatureWriteModel {
  return {
    code: values.code,
    name: values.name.trim(),
    description: values.description?.trim() ? values.description.trim() : null,
    valueType: values.valueType as FeatureWriteModel['valueType'],
    unit: values.unit?.trim() ? values.unit.trim() : null,
    aggregation: values.aggregation,
    sortOrder: values.sortOrder,
  };
}
