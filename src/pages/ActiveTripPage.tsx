import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentTrip } from '@/hooks/useDriverData';

const schema = z.object({
  endOdometer: z.coerce.number().min(0, 'Odometro invalido')
});

type FormData = z.infer<typeof schema>;
type FormInput = z.input<typeof schema>;

export function ActiveTripPage() {
  const { driver } = useAuth();
  const queryClient = useQueryClient();
  const { data: currentTrip, isLoading } = useCurrentTrip();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!currentTrip) {
        throw new Error('Nenhuma viagem ativa encontrada.');
      }

      const { error } = await supabase
        .from('trips')
        .update({
          end_odometer: data.endOdometer,
          actual_distance_km: data.endOdometer - currentTrip.start_odometer,
          end_time: new Date().toISOString(),
          status: 'COMPLETED'
        })
        .eq('id', currentTrip.id);

      if (error) {
        throw error;
      }

      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: 'AVAILABLE', current_odometer: data.endOdometer })
        .eq('id', currentTrip.vehicle_id);

      if (vehicleError) {
        throw vehicleError;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['current-trip', driver?.id] });
      await queryClient.invalidateQueries({ queryKey: ['trip-history', driver?.id] });
      toast.success('Viagem finalizada.');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Nao foi possivel finalizar a viagem.';
      toast.error(message);
    }
  });

  if (isLoading) {
    return <div className="card">Carregando viagem ativa...</div>;
  }

  if (!currentTrip) {
    return (
      <div className="card stack">
        <h2>Nenhuma viagem ativa</h2>
        <p className="muted">Inicie uma nova viagem para continuar.</p>
        <Link to="/viagens/nova" className="primary-button">Nova viagem</Link>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <section className="card stack">
        <h2>Viagem em andamento</h2>
        <p><strong>Destino:</strong> {currentTrip.destination}</p>
        <p><strong>Odometro inicial:</strong> {currentTrip.start_odometer}</p>
        <p><strong>Inicio:</strong> {new Date(currentTrip.start_time).toLocaleString('pt-BR')}</p>
      </section>

      <form className="card stack" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <label className="field">
          <span>Odometro final</span>
          <input type="number" {...register('endOdometer')} />
          {errors.endOdometer && <small>{errors.endOdometer.message}</small>}
        </label>

        <button type="submit" className="primary-button" disabled={mutation.isPending}>
          {mutation.isPending ? 'Finalizando...' : 'Finalizar viagem'}
        </button>
      </form>
    </div>
  );
}
