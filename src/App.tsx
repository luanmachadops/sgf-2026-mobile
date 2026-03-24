import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { HomePage } from '@/pages/HomePage';
import { StartTripPage } from '@/pages/StartTripPage';
import { ActiveTripPage } from '@/pages/ActiveTripPage';
import { ChecklistPage } from '@/pages/ChecklistPage';
import { RefuelingPage } from '@/pages/RefuelingPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ProfilePage } from '@/pages/ProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/viagens/nova" element={<StartTripPage />} />
          <Route path="/viagens/ativa" element={<ActiveTripPage />} />
          <Route path="/checklists/:type" element={<ChecklistPage />} />
          <Route path="/abastecimentos/novo" element={<RefuelingPage />} />
          <Route path="/historico" element={<HistoryPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
