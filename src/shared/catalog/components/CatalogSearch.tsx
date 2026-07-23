import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/cn';

/**
 * Debounced search box for catalog lists. Keeps a snappy local value and only
 * pushes changes upward after a pause, so the list query doesn't fire per keypress.
 */
export function CatalogSearch({
  value,
  onChange,
  placeholder = 'Buscar por nombre…',
  className,
  delay = 300,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
}) {
  const [term, setTerm] = useState(value);

  useEffect(() => setTerm(value), [value]);

  useEffect(() => {
    if (term === value) return;
    const id = setTimeout(() => onChange(term), delay);
    return () => clearTimeout(id);
  }, [term, value, onChange, delay]);

  return (
    <div className={cn('relative w-full sm:max-w-xs', className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="pl-8 pr-8"
        aria-label="Buscar"
      />
      {term ? (
        <button
          type="button"
          onClick={() => setTerm('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Limpiar búsqueda"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
