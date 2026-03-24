import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/hooks/useDriverData';

const schema = z.object({
  vehicleId: z.string().uuid('Selecione um veiculo'),
  destination: z.string().min(3, 'Informe o destino'),
  startOdometer: z.coerce.number().min(0, 'Odometro invalido'),
  estimatedDistanceKm: z.coerce.number().min(0).optional()
});

type FormData = z.infer<typeof schema>;
type FormInput = z.input<typeof schema>;

export function StartTripPage() {
  const { driver } = useAuth();
  const queryClient = useQueryClient();
  const { data: vehicles } = useVehicles();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.from('trips').insert({
        vehicle_id: data.vehicleId,
        driver_id: driver!.id,
        destination: data.destination,
        start_odometer: data.startOdometer,
        estimated_distance_km: data.estimatedDistanceKm || null
      });

      if (error) {
        throw error;
      }

      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: 'IN_USE' })
        .eq('id', data.vehicleId);

      if (vehicleError) {
        throw vehicleError;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['current-trip', driver?.id] });
      toast.success('Viagem iniciada com sucesso.');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Nao foi possivel iniciar a viagem.';
      toast.error(message);
    }
  });

  return (
    <div className="stack-lg">
      <div className="section-head">
        <h2>Iniciar viagem</h2>
      </div>

      <form className="card stack" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <label className="field">
          <span>Veiculo</span>
          <select defaultValue="" {...register('vehicleId')}>
            <option value="" disabled>Selecione</option>
            {vehicles?.filter((vehicle) => vehicle.status === 'AVAILABLE').map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} • {vehicle.brand} {vehicle.model}
              </option>
            ))}
          </select>
          {errors.vehicleId && <small>{errors.vehicleId.message}</small>}
        </label>

        <label className="field">
          <span>Destino</span>
          <input type="text" {...register('destination')} placeholder="Ex.: Secretaria de Saude" />
          {errors.destination && <small>{errors.destination.message}</small>}
        </label>

        <label className="field">
          <span>Odometro inicial</span>
          <input type="number" {...register('startOdometer')} />
          {errors.startOdometer && <small>{errors.startOdometer.message}</small>}
        </label>

        <label className="field">
          <span>Distancia estimada (opcional)</span>
          <input type="number" step="0.1" {...register('estimatedDistanceKm')} />
        </label>

        <button type="submit" className="primary-button" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando...' : 'Iniciar viagem'}
        </button>
      </form>
    </div>
  );
}
