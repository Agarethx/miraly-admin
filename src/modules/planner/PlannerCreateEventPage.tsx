import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { FormField } from '@/shared/components/FormField';
import { useCreateEvent, type CreateEventInput } from './use-create-event';

const schema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(255, 'Máximo 255 caracteres.'),
  eventDate: z.string().optional(), // 'YYYY-MM-DD' from the date input; optional
  venue: z.string().trim().max(255, 'Máximo 255 caracteres.').optional().or(z.literal('')),
  address: z.string().trim().max(500, 'Máximo 500 caracteres.').optional().or(z.literal('')),
  description: z.string().trim().max(1000, 'Máximo 1000 caracteres.').optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function PlannerCreateEventPage() {
  const navigate = useNavigate();
  const create = useCreateEvent();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', eventDate: '', venue: '', address: '', description: '' },
  });

  const onSubmit = async (values: FormValues) => {
    const body: CreateEventInput = { name: values.name.trim() };
    // The Edge Function expects a full ISO datetime; the date input gives a day.
    // Noon UTC keeps the calendar day stable across the planner's timezone.
    if (values.eventDate) body.eventDate = `${values.eventDate}T12:00:00.000Z`;
    if (values.venue?.trim()) body.venue = values.venue.trim();
    if (values.address?.trim()) body.address = values.address.trim();
    if (values.description?.trim()) body.description = values.description.trim();

    try {
      await create.mutateAsync(body);
      navigate('/planner');
    } catch {
      /* error toast is emitted by the mutation hook */
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => navigate('/planner')}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Mis eventos
        </button>
        <h1 className="text-xl font-semibold tracking-tight">Crear evento</h1>
        <p className="text-sm text-muted-foreground">
          El evento se crea en borrador. Podrás activarlo (pago) más adelante.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos del evento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nombre" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
              <Input id="name" placeholder="Boda de Ana y Luis" {...register('name')} />
            </FormField>
            <FormField label="Fecha" htmlFor="eventDate" error={errors.eventDate?.message} hint="Opcional.">
              <Input id="eventDate" type="date" {...register('eventDate')} />
            </FormField>
            <FormField label="Lugar" htmlFor="venue" error={errors.venue?.message} hint="Opcional.">
              <Input id="venue" placeholder="Viña Santa Rita" {...register('venue')} />
            </FormField>
            <FormField label="Dirección" htmlFor="address" error={errors.address?.message} hint="Opcional." className="sm:col-span-2">
              <Input id="address" placeholder="Camino Padre Hurtado 0695, Alto Jahuel" {...register('address')} />
            </FormField>
            <FormField label="Descripción" htmlFor="description" error={errors.description?.message} hint="Opcional." className="sm:col-span-2">
              <Textarea id="description" rows={3} {...register('description')} />
            </FormField>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Creando…' : 'Crear evento'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/planner')} disabled={create.isPending}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
