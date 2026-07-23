import { z } from 'zod';
import {
  DEFAULT_LOCALE,
  LIMIT_CODES,
  bytesToGb,
  gbToBytes,
  limitValue,
  localized,
  toMajorUnits,
  toMinorUnits,
  type LimitEffect,
  type LocalizedText,
} from '@/shared/catalog';
import type { Addon, AddonWriteModel } from '../domain';

/**
 * Zod schema + RHF types for the Addon form. Reuses the shared money/limit
 * conversions; adds addon-only fields (compatible plans, increment labels). All
 * messages in Spanish; the domain re-guards the same invariants.
 */
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

export const addonFormSchema = z.object({
  nameEs: z.string().trim().min(1, 'El nombre en español es obligatorio.').max(120, 'Máximo 120 caracteres.'),
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
  amount: z.coerce.number({ invalid_type_error: 'Ingresa un monto válido.' }).min(0, 'El precio no puede ser negativo.'),

  // Increments (delta_qty) the addon adds to each limit dimension.
  participants: optionalNonNegInt,
  storageGb: optionalNonNegNumber,
  retentionDays: optionalNonNegInt,

  // Compatible plans: "todos" (all) or an explicit selection.
  allPlans: z.boolean(),
  compatiblePlanIds: z.array(z.string()),
});

export type AddonFormValues = z.infer<typeof addonFormSchema>;

export const emptyAddonForm: AddonFormValues = {
  nameEs: '',
  nameEn: '',
  descriptionEs: '',
  descriptionEn: '',
  status: 'draft',
  visibility: 'public',
  sortOrder: 0,
  currency: 'CLP',
  amount: 0,
  participants: undefined,
  storageGb: undefined,
  retentionDays: undefined,
  allPlans: true,
  compatiblePlanIds: [],
};

/** Hydrates the form from an existing addon. `allPlanIds` resolves the "todos" flag. */
export function addonToFormValues(addon: Addon, allPlanIds: string[]): AddonFormValues {
  const price = addon.prices[0] ?? null;
  const storage = limitValue(addon.limits, LIMIT_CODES.storageBytes);
  const coversAll =
    allPlanIds.length > 0 && allPlanIds.every((id) => addon.compatiblePlanIds.includes(id));
  return {
    nameEs: localized(addon.name, 'es'),
    nameEn: addon.name.en ?? '',
    descriptionEs: addon.description ? localized(addon.description, 'es') : '',
    descriptionEn: addon.description?.en ?? '',
    status: addon.status === 'active' ? 'active' : 'draft',
    visibility: addon.visibility,
    sortOrder: addon.sortOrder,
    currency: price?.currency ?? 'CLP',
    amount: price ? toMajorUnits(price.amountMinor) : 0,
    participants: limitValue(addon.limits, LIMIT_CODES.guests) ?? undefined,
    storageGb: storage !== null ? bytesToGb(storage) : undefined,
    retentionDays: limitValue(addon.limits, LIMIT_CODES.retentionDays) ?? undefined,
    allPlans: coversAll,
    compatiblePlanIds: addon.compatiblePlanIds,
  };
}

function buildLocalized(es: string, en?: string): LocalizedText {
  const text: LocalizedText = { [DEFAULT_LOCALE]: es.trim() };
  if (en && en.trim()) text.en = en.trim();
  return text;
}

/** Translates validated form values into the domain write model. */
export function formValuesToWriteModel(values: AddonFormValues): AddonWriteModel {
  const limits: LimitEffect[] = [];
  if (values.participants !== undefined) {
    limits.push({ limitTypeCode: LIMIT_CODES.guests, deltaQty: values.participants });
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
    compatiblePlanIds: values.compatiblePlanIds,
  };
}
