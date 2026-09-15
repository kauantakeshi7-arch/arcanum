import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider, useSession } from './context/SessionContext';
import { AgoraDataProvider } from './context/AgoraDataContext';
import { CovensDataProvider } from './context/CovensDataContext';
import { TrilhasDataProvider } from './context/TrilhasDataContext';
import { SantuarioDataProvider } from './context/SantuarioDataContext';
import { EgregoraDataProvider } from './context/EgregoraDataContext';
import { DmDataProvider } from './context/DmDataContext';
import { StealthProvider } from './context/StealthContext';
import { ModalProvider } from './components/modal/ModalProvider';
import { ToastProvider } from './components/toast/ToastProvider';
import { AuthScreen } from './features/auth/AuthScreen';
import { AppShell } from './components/shell/AppShell';
import { AgoraScreen } from './features/agora/AgoraScreen';
import { Skeleton } from './components/Skeleton';

// Code-splitting por rota: cada tela vira seu próprio chunk, baixado só
// quando o usuário navega até ela — a Ágora (rota padrão) fica de fora
// porque carrega de cara de qualquer forma. Maior ganho é a Egrégora, que
// só ela puxa o Leaflet (~150kB) para dentro do bundle.
const CovensScreen = lazy(() => import('./features/covens/CovensScreen').then((m) => ({ default: m.CovensScreen })));
const TrilhasScreen = lazy(() => import('./features/trilhas/TrilhasScreen').then((m) => ({ default: m.TrilhasScreen })));
const SantuarioScreen = lazy(() => import('./features/santuario/SantuarioScreen').then((m) => ({ default: m.SantuarioScreen })));
const EgregoraScreen = lazy(() => import('./features/egregora/EgregoraScreen').then((m) => ({ default: m.EgregoraScreen })));
const PerfilScreen = lazy(() => import('./features/perfil/PerfilScreen').then((m) => ({ default: m.PerfilScreen })));

function ScreenFallback() {
  return (
    <div style={{ padding: 16 }} aria-hidden="true">
      <Skeleton height={90} radius={14} style={{ marginBottom: 12 }} />
      <Skeleton height={90} radius={14} />
    </div>
  );
}

function Gate() {
  const { session, loading } = useSession();
  if (loading) return null;
  if (!session) return <AuthScreen />;

  // ModalProvider precisa ficar por baixo dos provedores de dados: o conteúdo
  // de um modal é renderizado como irmão de {children} dentro do próprio
  // ModalProvider, então ele só enxerga contexto de provedores que o
  // envolvem — não os que envolvem quem chamou push().
  return (
    <StealthProvider>
      <CovensDataProvider>
        <AgoraDataProvider>
          <TrilhasDataProvider>
            <SantuarioDataProvider>
              <EgregoraDataProvider>
                <DmDataProvider>
                  <ModalProvider>
                    <BrowserRouter>
                      <Routes>
                        <Route path="/" element={<AppShell />}>
                          <Route index element={<AgoraScreen />} />
                          <Route
                            path="covens"
                            element={
                              <Suspense fallback={<ScreenFallback />}>
                                <CovensScreen />
                              </Suspense>
                            }
                          />
                          <Route
                            path="trilhas"
                            element={
                              <Suspense fallback={<ScreenFallback />}>
                                <TrilhasScreen />
                              </Suspense>
                            }
                          />
                          <Route
                            path="altar"
                            element={
                              <Suspense fallback={<ScreenFallback />}>
                                <SantuarioScreen />
                              </Suspense>
                            }
                          />
                          <Route
                            path="egregora"
                            element={
                              <Suspense fallback={<ScreenFallback />}>
                                <EgregoraScreen />
                              </Suspense>
                            }
                          />
                          <Route
                            path="perfil"
                            element={
                              <Suspense fallback={<ScreenFallback />}>
                                <PerfilScreen />
                              </Suspense>
                            }
                          />
                        </Route>
                      </Routes>
                    </BrowserRouter>
                  </ModalProvider>
                </DmDataProvider>
              </EgregoraDataProvider>
            </SantuarioDataProvider>
          </TrilhasDataProvider>
        </AgoraDataProvider>
      </CovensDataProvider>
    </StealthProvider>
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
