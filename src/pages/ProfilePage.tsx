import { useAuth } from '@/contexts/AuthContext';

export function ProfilePage() {
  const { driver } = useAuth();

  return (
    <div className="card stack">
      <h2>Perfil</h2>
      <p><strong>Nome:</strong> {driver?.name}</p>
      <p><strong>CPF:</strong> {driver?.cpf}</p>
      <p><strong>Matricula:</strong> {driver?.registration_number}</p>
      <p><strong>CNH:</strong> {driver?.cnh_number} • {driver?.cnh_category}</p>
      <p><strong>Validade CNH:</strong> {driver?.cnh_expiry_date}</p>
      <p><strong>Telefone:</strong> {driver?.phone || '-'}</p>
      <p><strong>Email:</strong> {driver?.email || '-'}</p>
      <p><strong>Score:</strong> {driver?.score ?? '-'}</p>
    </div>
  );
}
