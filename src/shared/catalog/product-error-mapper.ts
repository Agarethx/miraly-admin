import {
  CatalogError,
  CatalogForbiddenError,
  CatalogNotFoundError,
  CatalogRepositoryError,
} from './errors';

interface PostgrestLikeError {
  code?: string;
  message?: string;
  details?: string;
}

function isPostgrestLikeError(value: unknown): value is PostgrestLikeError {
  return typeof value === 'object' && value !== null && 'message' in value;
}

/** Labels used to build resource-aware messages (e.g. "el plan", "el addon"). */
export interface CatalogErrorLabels {
  /** The record, for not-found (e.g. "el plan"). */
  record?: string;
  /** The collection, for forbidden (e.g. "el catálogo de planes"). */
  collection?: string;
}

/**
 * Turns any Supabase failure into a typed catalog error, so the app never sees
 * raw PostgREST codes. Shared by every product module.
 */
export function mapCatalogError(
  error: unknown,
  context: { id?: string; labels?: CatalogErrorLabels } = {},
): CatalogError {
  if (error instanceof CatalogError) return error;

  const { record, collection } = context.labels ?? {};

  if (isPostgrestLikeError(error)) {
    const code = error.code ?? '';
    if (code === '42501' || code === 'PGRST301' || code === 'PGRST302') {
      return new CatalogForbiddenError(collection);
    }
    if (code === 'PGRST116') {
      return new CatalogNotFoundError(context.id ?? 'desconocido', record);
    }
    return new CatalogRepositoryError(error.message ?? 'Error de persistencia.');
  }

  if (error instanceof Error) return new CatalogRepositoryError(error.message);
  return new CatalogRepositoryError('Error de persistencia desconocido.');
}
