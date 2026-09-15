import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider, useSession } from './context/SessionContext';
import { AgoraDataProvider } from './context/AgoraDataContext';
import { CovensDataProvider } from './context/CovensDataContext';
import { TrilhasDataProvider } from './context/TrilhasDataContext';
import { ModalProvider } from './components/modal/ModalProvider';
import { ToastProvider } from './components/toast/ToastProvider';
import { AuthScreen } from './features/auth/AuthScreen';
import { AppShell } from './components/shell/AppShell';
import { AgoraScreen } from './features/agora/AgoraScreen';
import { CovensScreen } from './features/covens/CovensScreen';
import { TrilhasScreen } from './features/trilhas/TrilhasScreen';
import { ComingSoon } from './routes/ComingSoon';

function Gate() {
  const { session, loading } = useSession();
  if (loading) return null;
  if (!session) return <AuthScreen />;

  // ModalProvider precisa ficar por baixo dos provedores de dados: o conteúdo
  // de um modal é renderizado como irmão de {children} dentro do próprio
  // ModalProvider, então ele só enxerga contexto de provedores que o
  // envolvem — não os que envolvem quem chamou push().
  return (
    <CovensDataProvider>
      <AgoraDataProvider>
        <TrilhasDataProvider>
          <ModalProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppShell />}>
                  <Route index element={<AgoraScreen />} />
                  <Route path="covens" element={<CovensScreen />} />
                  <Route path="trilhas" element={<TrilhasScreen />} />
                  <Route path="altar" element={<ComingSoon title="Altar" />} />
                  <Route path="egregora" element={<ComingSoon title="Egrégora" />} />
                  <Route path="perfil" element={<ComingSoon title="Perfil" />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ModalProvider>
        </TrilhasDataProvider>
      </AgoraDataProvider>
    </CovensDataProvider>
  );
}

export function App() {
  return (
    <SessionProvider>
      <ToastProvider>
        <Gate />
      </ToastProvider>
    </SessionProvider>
  );
}
