import { LogOut } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

export function Layout() {
  const { driver, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">SGF Motorista</p>
          <h1>{driver?.name ?? 'Motorista'}</h1>
        </div>
        <button type="button" className="icon-button" onClick={handleLogout} aria-label="Sair">
          <LogOut size={18} />
        </button>
      </header>

      <main className="app-content">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
