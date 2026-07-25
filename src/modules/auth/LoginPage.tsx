import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useSession } from '@/shared/providers/SessionProvider';
import { useNotifications } from '@/shared/providers/NotificationProvider';
import { LoadingPage } from '@/shared/components/LoadingPage';
import { getErrorMessage } from '@/shared/utils/errors';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});
type FormValues = z.infer<typeof schema>;

interface LocationState {
  from?: { pathname: string };
}

/**
 * LoginPage — Supabase Auth sign-in for admins. On success the SessionProvider
 * flips to authenticated and the router lets them through to where they were
 * headed. Already-authenticated visitors are redirected away.
 */
export function LoginPage() {
  const { isAuthenticated, isLoading, isResolvingRoles, isPlatformAdmin, isPlanner, signIn } = useSession();
  const notifications = useNotifications();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  if (isLoading || (isAuthenticated && isResolvingRoles)) {
    return <LoadingPage label="Restaurando sesión…" />;
  }
  if (isAuthenticated) {
    // Route each role to its home. Admin priority; planner to /planner; neither
    // to "/" where ProtectedRoute renders a clean access-denied.
    if (isPlatformAdmin) {
      const to = (location.state as LocationState | null)?.from?.pathname ?? '/';
      return <Navigate to={to} replace />;
    }
    if (isPlanner) return <Navigate to="/planner" replace />;
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
    } catch (err) {
      notifications.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Backoffice</h1>
          <p className="text-sm text-muted-foreground">Ingresa con tu cuenta de administrador.</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" type="email" autoComplete="email" placeholder="admin@empresa.com" {...register('email')} />
                {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
                <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
                {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
