import { Link } from 'react-router-dom';
import { AlertTriangle, CarFront, ClipboardList, Fuel, PlayCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentTrip } from '@/hooks/useDriverData';

export function HomePage() {
  const { driver } = useAuth();
  const { data: currentTrip, isLoading } = useCurrentTrip();

  const cnhExpiry = driver?.cnh_expiry_date ? new Date(driver.cnh_expiry_date) : null;
  const daysUntilCnh = cnhExpiry ? Math.ceil((cnhExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="stack-lg">
      <section className="hero-card">
        <p className="eyebrow">Bem-vindo</p>
        <h2>{driver?.name}</h2>
        <p className="muted">Matricula {driver?.registration_number} • Score {driver?.score ?? '-'}</p>
      </section>

      {daysUntilCnh !== null && daysUntilCnh <= 30 && (
        <section className="warning-card">
          <AlertTriangle size={18} />
          <div>
            <strong>CNH em alerta</strong>
            <p>Validade em {daysUntilCnh} dias.</p>
          </div>
        </section>
      )}

      <section className="card">
        <div className="section-head">
          <h3>Viagem atual</h3>
          {!currentTrip && !isLoading && <Link to="/viagens/nova">Iniciar</Link>}
        </div>
        {isLoading ? (
          <p className="muted">Carregando viagem ativa...</p>
        ) : currentTrip ? (
          <div className="stack">
            <p><strong>Destino:</strong> {currentTrip.destination}</p>
            <p><strong>Status:</strong> {currentTrip.status}</p>
            <Link className="primary-button" to="/viagens/ativa">Abrir viagem ativa</Link>
          </div>
        ) : (
          <p className="muted">Nenhuma viagem em andamento.</p>
        )}
      </section>

      <section className="quick-grid">
        <Link to="/viagens/nova" className="quick-card">
          <PlayCircle size={20} />
          <span>Iniciar viagem</span>
        </Link>
        <Link to="/checklists/pre-trip" className="quick-card">
          <ClipboardList size={20} />
          <span>Checklist</span>
        </Link>
        <Link to="/abastecimentos/novo" className="quick-card">
          <Fuel size={20} />
          <span>Abastecer</span>
        </Link>
        <Link to="/historico" className="quick-card">
          <CarFront size={20} />
          <span>Historico</span>
        </Link>
      </section>
    </div>
  );
}
