import { z } from 'zod';
import {
  DEFAULT_LOCALE,
  LIMIT_CODES,
  limitValue,
  localized,
  type LocalizedText,
  type Plan,
  type PlanLimit,
  type PlanWriteModel,
} from '../domain';
import { bytesToGb, gbToBytes, toMajorUnits, toMinorUnits } from './format';

/**
 * Zod schema + RHF types for the Plan form. All messages are in Spanish. This is
 * the presentation-side validation; the domain re-guards the same invariants in
 * `assertValidPlanWriteModel` so business rules never depend on the UI.
 */

/** Turns '' | null | undefined into undefined so optional coercion works cleanly. */
const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);

const optionalNonNegInt = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ invalid_type_error: 'Ingresa un número válido.' })
    .int('Debe ser un número entero.')
    .min(0, 'No puede ser negativo.')
    .optional(),
);

const optionalNonNegNumber = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ invalid_type_error: 'Ingresa un número válido.' })
    .min(0, 'No puede ser negativo.')
    .optional(),
);

export const planFormSchema = z.object({
  nameEs: z
    .string()
    .trim()
    .min(1, 'El nombre en español es obligatorio.')
    .max(120, 'Máximo 120 caracteres.'),
  nameEn: z.string().trim().max(120, 'Máximo 120 caracteres.').optional().or(z.literal('')),
  descriptionEs: z.string().trim().max(2000, 'Máximo 2000 caracteres.').optional().or(z.literal('')),
  descriptionEn: z.string().trim().max(2000, 'Máximo 2000 caracteres.').optional().or(z.literal('')),

  status: z.enum(['draft', 'active'], { required_error: 'Elige un estado.' }),
  visibility: z.enum(['public', 'private', 'hidden'], { required_error: 'Elige una visibilidad.' }),
  sortOrder: z.coerce
    .number({ invalid_type_error: 'Ingresa un número válido.' })
    .int('Debe ser un número entero.')
    .min(0, 'No puede ser negativo.'),

  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, 'Usa un código ISO-4217 de 3 letras (ej. CLP).'),
  amount: z.coerce
    .number({ invalid_type_error: 'Ingresa un monto válido.' })
    .min(0, 'El precio no puede ser negativo.'),

  guests: optionalNonNegInt,
  storageGb: optionalNonNegNumber,
  retentionDays: optionalNonNegInt,
});

export type PlanFormValues = z.infer<typeof planFormSchema>;

/** The empty form for the create screen. */
export const emptyPlanForm: PlanFormValues = {
  nameEs: '',
  nameEn: '',
  descriptionEs: '',
  descriptionEn: '',
  status: 'draft',
  visibility: 'public',
  sortOrder: 0,
  currency: 'CLP',
  amount: 0,
  guests: undefined,
  storageGb: undefined,
  retentionDays: undefined,
};

/** Hydrates the form from an existing plan (edit screen). */
export function planToFormValues(plan: Plan): PlanFormValues {
  const price = plan.prices[0] ?? null;
  return {
    nameEs: localized(plan.name, 'es'),
    nameEn: plan.name.en ?? '',
    descriptionEs: plan.description ? localized(plan.description, 'es') : '',
    descriptionEn: plan.description?.en ?? '',
    status: plan.status === 'active' ? 'active' : 'draft',
    visibility: plan.visibility,
    sortOrder: plan.sortOrder,
    currency: price?.currency ?? 'CLP',
    amount: price ? toMajorUnits(price.amountMinor) : 0,
    guests: limitValue(plan.limits, LIMIT_CODES.guests) ?? undefined,
    storageGb:
      limitValue(plan.limits, LIMIT_CODES.storageBytes) !== null
        ? bytesToGb(limitValue(plan.limits, LIMIT_CODES.storageBytes) as number)
        : undefined,
    retentionDays: limitValue(plan.limits, LIMIT_CODES.retentionDays) ?? undefined,
  };
}

function buildLocalized(es: string, en?: string): LocalizedText {
  const text: LocalizedText = { [DEFAULT_LOCALE]: es.trim() };
  if (en && en.trim()) text.en = en.trim();
  return text;
}

/** Translates validated form values into the domain write model. */
export function formValuesToWriteModel(values: PlanFormValues): PlanWriteModel {
  const limits: PlanLimit[] = [];
  if (values.guests !== undefined) {
    limits.push({ limitTypeCode: LIMIT_CODES.guests, deltaQty: values.guests });
  }
  if (values.storageGb !== undefined) {
    limits.push({ limitTypeCode: LIMIT_CODES.storageBytes, deltaQty: gbToBytes(values.storageGb) });
  }
  if (values.retentionDays !== undefined) {
    limits.push({ limitTypeCode: LIMIT_CODES.retentionDays, deltaQty: values.retentionDays });
  }

  const description =
    values.descriptionEs?.trim() || values.descriptionEn?.trim()
      ? buildLocalized(values.descriptionEs ?? '', values.descriptionEn)
      : null;

  return {
    name: buildLocalized(values.nameEs, values.nameEn),
    description,
    status: values.status,
    visibility: values.visibility,
    sortOrder: values.sortOrder,
    prices: [{ currency: values.currency, amountMinor: toMinorUnits(values.amount), region: null }],
    limits,
  };
}
