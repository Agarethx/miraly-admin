import { supabase } from '@/shared/services/supabase';
import { mapCatalogError } from '@/shared/catalog';
import type {
  Feature,
  FeatureListQuery,
  FeatureOrder,
  FeatureSortField,
  FeatureStatus,
  FeatureWriteModel,
  ValueType,
} from '../domain';

const TABLE = 'billing_features';
const LABELS = { record: 'la feature', collection: 'el registro de features' };

interface FeatureRow {
  code: string;
  name: string;
  description: string | null;
  value_type: string;
  status: string;
  unit: string | null;
  aggregation: string;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
}

function toValueType(v: string): ValueType {
  return (['BOOLEAN', 'INTEGER', 'DECIMAL', 'STRING', 'JSON', 'UNLIMITED'] as const).includes(
    v as ValueType,
  )
    ? (v as ValueType)
    : 'BOOLEAN';
}

function toFeature(row: FeatureRow): Feature {
  return {
    code: row.code,
    name: row.name,
    description: row.description,
    valueType: toValueType(row.value_type),
    status: row.status === 'archived' ? 'archived' : 'active',
    unit: row.unit,
    aggregation: row.aggregation === 'max' ? 'max' : 'sum',
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sortColumn(sortBy: FeatureSortField): string {
  switch (sortBy) {
    case 'code': return 'code';
    case 'name': return 'name';
    case 'createdAt': return 'created_at';
    case 'sortOrder':
    default: return 'sort_order';
  }
}

export async function queryFeaturePage(query: FeatureListQuery): Promise<{ rows: Feature[]; total: number }> {
  let builder = supabase.from(TABLE).select('*', { count: 'exact' });

  if (query.status !== 'all') builder = builder.eq('status', query.status);
  if (query.valueType !== 'all') builder = builder.eq('value_type', query.valueType);
  if (query.search.trim()) {
    const term = `%${query.search.trim()}%`;
    builder = builder.or(`code.ilike.${term},name.ilike.${term}`);
  }

  const from = (query.page - 1) * query.pageSize;
  const { data, error, count } = await builder
    .order(sortColumn(query.sortBy), { ascending: query.sortDir === 'asc' })
    .range(from, from + query.pageSize - 1);

  if (error) throw mapCatalogError(error, { labels: LABELS });
  return { rows: ((data ?? []) as FeatureRow[]).map(toFeature), total: count ?? 0 };
}

export async function queryFeatureByCode(code: string): Promise<Feature> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('code', code).single();
  if (error) throw mapCatalogError(error, { id: code, labels: LABELS });
  return toFeature(data as FeatureRow);
}

function writePayload(input: FeatureWriteModel) {
  return {
    name: input.name,
    description: input.description,
    value_type: input.valueType,
    unit: input.unit,
    aggregation: input.aggregation,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString(),
  };
}

export async function insertFeature(input: FeatureWriteModel): Promise<string> {
  const { error } = await supabase.from(TABLE).insert({ code: input.code, ...writePayload(input) });
  if (error) throw mapCatalogError(error, { labels: LABELS });
  return input.code;
}

export async function updateFeatureRow(code: string, input: FeatureWriteModel): Promise<void> {
  const { error } = await supabase.from(TABLE).update(writePayload(input)).eq('code', code);
  if (error) throw mapCatalogError(error, { id: code, labels: LABELS });
}

export async function setFeatureStatus(code: string, status: FeatureStatus): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('code', code);
  if (error) throw mapCatalogError(error, { id: code, labels: LABELS });
}

export async function reorderFeatureRows(orders: FeatureOrder[]): Promise<void> {
  for (const { code, sortOrder } of orders) {
    const { error } = await supabase
      .from(TABLE)
      .update({ sort_order: sortOrder, updated_at: new Date().toISOString() })
      .eq('code', code);
    if (error) throw mapCatalogError(error, { id: code, labels: LABELS });
  }
}
