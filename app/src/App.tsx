import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider, useSession } from './context/SessionContext';
import { ModalProvider } from './components/modal/ModalProvider';
import { AuthScreen } from './features/auth/AuthScreen';
import { AppShell } from './components/shell/AppShell';
import { ComingSoon } from './routes/ComingSoon';

function Gate() {
  const { session, loading } = useSession();
  if (loading) return null;
  if (!session) return <AuthScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<ComingSoon title="Ágora" />} />
          <Route path="covens" element={<ComingSoon title="Covens & Terreiros" />} />
          <Route path="trilhas" element={<ComingSoon title="Trilhas" />} />
          <Route path="altar" element={<ComingSoon title="Altar" />} />
          <Route path="egregora" element={<ComingSoon title="Egrégora" />} />
          <Route path="perfil" element={<ComingSoon title="Perfil" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <SessionProvider>
      <ModalProvider>
        <Gate />
      </ModalProvider>
    </SessionProvider>
  );
}
