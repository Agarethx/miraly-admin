/** Terms acceptance checkbox. Required before generating the order. */
export function TermsCheckbox({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm">
      <input
        type="checkbox"
        className="mt-0.5 size-4 accent-primary"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-muted-foreground">
        Acepto los términos y condiciones y confirmo la configuración de esta compra.
      </span>
    </label>
  );
}
