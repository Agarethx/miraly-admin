import { useMemo, useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/cn';
import {
  defaultModeForType,
  modesForType,
  type Entitlement,
  type EntitlementMode,
} from '../entitlement';
import { validateEntitlement } from '../validation';
import { modeLabel, valueTypeLabel } from '../format';
import type { FeatureOption } from '../rows';

interface EntitlementEditorProps {
  entitlements: Entitlement[];
  featureOptions: FeatureOption[];
  saving: boolean;
  loading?: boolean;
  onSave: (next: Entitlement[]) => void;
}

/** Serializes the set so we can detect external resets and dirtiness. */
function signature(list: Entitlement[]): string {
  return JSON.stringify(list.map((e) => [e.featureCode, e.valueType, e.mode, e.valueBool, e.valueInt, e.valueDecimal, e.valueText, e.valueJson]));
}

/**
 * EntitlementEditor — real UI (never a JSON blob) to assign typed, moded
 * entitlements to a product. Enforces the same rules as the domain/DB: no
 * duplicate features, type↔mode compatibility, typed values. Shared by Plans and
 * Addons.
 */
export function EntitlementEditor({
  entitlements, featureOptions, saving, loading, onSave,
}: EntitlementEditorProps) {
  const [draft, setDraft] = useState<Entitlement[]>(entitlements);
  const [jsonText, setJsonText] = useState<Record<number, string>>({});
  const serverSig = signature(entitlements);
  const [appliedSig, setAppliedSig] = useState(serverSig);

  // Reset the draft when the server set changes (save/reload) — React's
  // "adjust state during render" pattern, no effect needed.
  if (serverSig !== appliedSig) {
    setAppliedSig(serverSig);
    setDraft(entitlements);
    setJsonText({});
  }

  const featureByCode = useMemo(
    () => new Map(featureOptions.map((f) => [f.code, f])),
    [featureOptions],
  );
  const usedCodes = new Set(draft.map((e) => e.featureCode));
  const dirty = signature(draft) !== serverSig;

  function update(index: number, patch: Partial<Entitlement>) {
    setDraft((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function pickFeature(index: number, code: string) {
    const option = featureByCode.get(code);
    if (!option) return;
    const valueType = option.valueType;
    update(index, {
      featureCode: code,
      valueType,
      mode: defaultModeForType(valueType),
      valueBool: valueType === 'BOOLEAN' ? true : null,
      valueInt: valueType === 'INTEGER' ? 0 : null,
      valueDecimal: valueType === 'DECIMAL' ? 0 : null,
      valueText: valueType === 'STRING' ? '' : null,
      valueJson: null,
    });
    setJsonText((prev) => ({ ...prev, [index]: '' }));
  }

  function addRow() {
    const firstFree = featureOptions.find((f) => !usedCodes.has(f.code));
    if (!firstFree) return;
    const vt = firstFree.valueType;
    setDraft((prev) => [
      ...prev,
      {
        featureCode: firstFree.code,
        valueType: vt,
        mode: defaultModeForType(vt),
        valueBool: vt === 'BOOLEAN' ? true : null,
        valueInt: vt === 'INTEGER' ? 0 : null,
        valueDecimal: vt === 'DECIMAL' ? 0 : null,
        valueText: vt === 'STRING' ? '' : null,
        valueJson: null,
      },
    ]);
  }

  function removeRow(index: number) {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  }

  function setJson(index: number, raw: string) {
    setJsonText((prev) => ({ ...prev, [index]: raw }));
    try {
      update(index, { valueJson: raw.trim() === '' ? null : JSON.parse(raw) });
    } catch {
      update(index, { valueJson: null });
    }
  }

  const rowErrors = draft.map((e, i) => {
    if (e.valueType === 'JSON') {
      const raw = jsonText[i];
      if (raw !== undefined && raw.trim() !== '' && e.valueJson === null) return 'JSON inválido.';
    }
    return validateEntitlement(e);
  });
  const hasErrors = rowErrors.some((err) => err !== null);
  const canAdd = featureOptions.some((f) => !usedCodes.has(f.code));

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando entitlements…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {draft.length === 0 ? (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Este producto no entrega entitlements todavía.
        </p>
      ) : (
        <div className="space-y-2">
          {draft.map((e, index) => {
            const options = featureOptions.filter(
              (f) => f.code === e.featureCode || !usedCodes.has(f.code),
            );
            return (
              <div key={index} className="rounded-md border p-3">
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-44 flex-1">
                    <label className="mb-1 block text-xs text-muted-foreground">Feature</label>
                    <Select
                      options={options.map((f) => ({ value: f.code, label: `${f.name} (${f.code})` }))}
                      value={e.featureCode}
                      onChange={(ev) => pickFeature(index, ev.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Tipo</label>
                    <Badge tone="solid" className="h-9">{valueTypeLabel(e.valueType)}</Badge>
                  </div>
                  <div className="w-36">
                    <label className="mb-1 block text-xs text-muted-foreground">Modo</label>
                    <Select
                      options={modesForType(e.valueType).map((m) => ({ value: m, label: modeLabel(m) }))}
                      value={e.mode}
                      onChange={(ev) => update(index, { mode: ev.target.value as EntitlementMode })}
                    />
                  </div>
                  <div className="w-40">
                    <label className="mb-1 block text-xs text-muted-foreground">Valor</label>
                    <EntitlementValueInput
                      entitlement={e}
                      jsonRaw={jsonText[index] ?? ''}
                      onBool={(v) => update(index, { valueBool: v })}
                      onInt={(v) => update(index, { valueInt: v })}
                      onDecimal={(v) => update(index, { valueDecimal: v })}
                      onText={(v) => update(index, { valueText: v })}
                      onJson={(raw) => setJson(index, raw)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(index)}
                    aria-label="Quitar entitlement"
                    className="text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                {rowErrors[index] ? (
                  <p className="mt-1.5 text-xs text-destructive">{rowErrors[index]}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={!canAdd}>
          <Plus className="size-4" /> Agregar entitlement
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => onSave(draft)}
          disabled={!dirty || hasErrors || saving}
        >
          {saving ? 'Guardando…' : 'Guardar entitlements'}
        </Button>
      </div>
    </div>
  );
}

function EntitlementValueInput({
  entitlement, jsonRaw, onBool, onInt, onDecimal, onText, onJson,
}: {
  entitlement: Entitlement;
  jsonRaw: string;
  onBool: (v: boolean) => void;
  onInt: (v: number) => void;
  onDecimal: (v: number) => void;
  onText: (v: string) => void;
  onJson: (raw: string) => void;
}) {
  switch (entitlement.valueType) {
    case 'BOOLEAN':
      return (
        <Select
          options={[{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }]}
          value={entitlement.valueBool ? 'true' : 'false'}
          onChange={(e) => onBool(e.target.value === 'true')}
        />
      );
    case 'INTEGER':
      return (
        <Input
          type="number"
          step={1}
          value={entitlement.valueInt ?? ''}
          onChange={(e) => onInt(Math.trunc(Number(e.target.value)))}
        />
      );
    case 'DECIMAL':
      return (
        <Input
          type="number"
          step="any"
          value={entitlement.valueDecimal ?? ''}
          onChange={(e) => onDecimal(Number(e.target.value))}
        />
      );
    case 'STRING':
      return (
        <Input value={entitlement.valueText ?? ''} onChange={(e) => onText(e.target.value)} />
      );
    case 'JSON':
      return (
        <Input value={jsonRaw} placeholder='{"k":1}' onChange={(e) => onJson(e.target.value)} className={cn('font-mono')} />
      );
    case 'UNLIMITED':
      return <Badge tone="accent" className="h-9">Ilimitado</Badge>;
  }
}
