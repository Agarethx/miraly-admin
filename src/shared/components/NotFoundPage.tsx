import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-3xl font-semibold tracking-tight">404</p>
      <p className="text-sm text-muted-foreground">La página que buscas no existe.</p>
      <Button asChild variant="secondary">
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
