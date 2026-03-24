import { useRefuelingHistory, useTripHistory } from '@/hooks/useDriverData';

export function HistoryPage() {
  const { data: trips, isLoading: tripsLoading } = useTripHistory();
  const { data: refuelings, isLoading: refuelingsLoading } = useRefuelingHistory();

  return (
    <div className="stack-lg">
      <section className="card stack">
        <h2>Viagens</h2>
        {tripsLoading ? (
          <p className="muted">Carregando viagens...</p>
        ) : (
          <ul className="simple-list">
            {trips?.map((trip) => (
              <li key={trip.id}>
                {trip.destination} • {trip.status}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card stack">
        <h2>Abastecimentos</h2>
        {refuelingsLoading ? (
          <p className="muted">Carregando abastecimentos...</p>
        ) : (
          <ul className="simple-list">
            {refuelings?.map((refueling) => (
              <li key={refueling.id}>
                {refueling.supplier_name} • R$ {refueling.total_cost}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
