import { Home, ClipboardList, Fuel, History, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/checklists/pre-trip', label: 'Checklist', icon: ClipboardList },
  { to: '/abastecimentos/novo', label: 'Abastecer', icon: Fuel },
  { to: '/historico', label: 'Historico', icon: History },
  { to: '/perfil', label: 'Perfil', icon: User }
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
