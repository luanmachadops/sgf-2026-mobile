import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentTrip } from '@/hooks/useDriverData';

const schema = z.object({
  liters: z.coerce.number().min(0.1),
  totalCost: z.coerce.number().min(0.01),
  odometer: z.coerce.number().min(0),
  fuelType: z.string().min(1),
  supplierName: z.string().min(2)
});

type FormData = z.infer<typeof schema>;
type FormInput = z.input<typeof schema>;

export function RefuelingPage() {
  const { driver } = useAuth();
  const { data: currentTrip } = useCurrentTrip();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fuelType: 'GASOLINE'
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!currentTrip?.vehicle_id) {
        throw new Error('Uma viagem ativa ou veiculo selecionado sera necessario na proxima iteracao.');
      }

      const { error } = await supabase.from('refuelings').insert({
        vehicle_id: currentTrip.vehicle_id,
        driver_id: driver!.id,
        trip_id: currentTrip.id,
        liters: data.liters,
        total_cost: data.totalCost,
        odometer: data.odometer,
        fuel_type: data.fuelType,
        supplier_name: data.supplierName,
        photo_dashboard_url: '',
        photo_receipt_url: ''
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['refueling-history', driver?.id] });
      toast.success('Abastecimento salvo.');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Nao foi possivel salvar o abastecimento.';
      toast.error(message);
    }
  });

  return (
    <div className="stack-lg">
      <form className="card stack" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <h2>Novo abastecimento</h2>

        <label className="field">
          <span>Litros</span>
          <input type="number" step="0.01" {...register('liters')} />
          {errors.liters && <small>{errors.liters.message}</small>}
        </label>

        <label className="field">
          <span>Valor total</span>
          <input type="number" step="0.01" {...register('totalCost')} />
          {errors.totalCost && <small>{errors.totalCost.message}</small>}
        </label>

        <label className="field">
          <span>Odometro</span>
          <input type="number" {...register('odometer')} />
          {errors.odometer && <small>{errors.odometer.message}</small>}
        </label>

        <label className="field">
          <span>Combustivel</span>
          <select {...register('fuelType')}>
            <option value="GASOLINE">Gasolina</option>
            <option value="ETHANOL">Etanol</option>
            <option value="DIESEL">Diesel</option>
            <option value="FLEX">Flex</option>
          </select>
        </label>

        <label className="field">
          <span>Fornecedor</span>
          <input type="text" {...register('supplierName')} />
          {errors.supplierName && <small>{errors.supplierName.message}</small>}
        </label>

        <button type="submit" className="primary-button" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando...' : 'Registrar abastecimento'}
        </button>
      </form>
    </div>
  );
}
