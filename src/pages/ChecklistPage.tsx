import { useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentTrip } from '@/hooks/useDriverData';

const checklistTemplate = [
  { itemId: 'tires', name: 'Pneus', isCritical: true },
  { itemId: 'lights', name: 'Iluminacao', isCritical: true },
  { itemId: 'brakes', name: 'Freios', isCritical: true },
  { itemId: 'documents', name: 'Documentacao', isCritical: false }
];

export function ChecklistPage() {
  const { type = 'pre-trip' } = useParams();
  const { driver } = useAuth();
  const { data: currentTrip } = useCurrentTrip();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!currentTrip?.vehicle_id) {
        throw new Error('Inicie uma viagem antes de salvar o checklist.');
      }

      const items = checklistTemplate.map((item) => ({
        ...item,
        status: 'OK',
        notes: '',
        photoUrl: ''
      }));

      const { error } = await supabase.from('checklists').insert({
        vehicle_id: currentTrip.vehicle_id,
        driver_id: driver!.id,
        trip_id: currentTrip?.id ?? null,
        type: type === 'post-trip' ? 'POST_TRIP' : 'PRE_TRIP',
        has_issues: false,
        items
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Checklist salvo.');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Nao foi possivel salvar o checklist.';
      toast.error(message);
    }
  });

  return (
    <div className="stack-lg">
      <section className="card stack">
        <h2>Checklist {type === 'post-trip' ? 'pos-viagem' : 'pre-viagem'}</h2>
        <p className="muted">Estrutura inicial criada. O proximo passo e transformar este esqueleto em formulario dinamico com fotos e notas por item.</p>
        <ul className="simple-list">
          {checklistTemplate.map((item) => (
            <li key={item.itemId}>
              {item.name} {item.isCritical ? '• Critico' : ''}
            </li>
          ))}
        </ul>
        <button type="button" className="primary-button" onClick={() => mutation.mutate()} disabled={mutation.isPending || !currentTrip?.vehicle_id}>
          {mutation.isPending ? 'Salvando...' : 'Salvar checklist base'}
        </button>
      </section>
    </div>
  );
}
