import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PerfilScreen } from './PerfilScreen';
import { useSession } from '../../context/SessionContext';
import { useAgoraData } from '../../context/AgoraDataContext';
import { useCovensData } from '../../context/CovensDataContext';
import { useEgregoraData } from '../../context/EgregoraDataContext';
import { useTrilhasData } from '../../context/TrilhasDataContext';
import * as api from '../../lib/api';
import type { Profile } from '../../types/db';

vi.mock('../../context/SessionContext', () => ({ useSession: vi.fn() }));
vi.mock('../../context/AgoraDataContext', () => ({ useAgoraData: vi.fn() }));
vi.mock('../../context/CovensDataContext', () => ({ useCovensData: vi.fn() }));
vi.mock('../../context/EgregoraDataContext', () => ({ useEgregoraData: vi.fn() }));
vi.mock('../../context/TrilhasDataContext', () => ({ useTrilhasData: vi.fn() }));
vi.mock('../../components/toast/ToastProvider', () => ({ useToast: () => ({ showToast: vi.fn() }) }));
vi.mock('../../components/modal/ModalProvider', () => ({ useModal: () => ({ push: vi.fn(), pop: vi.fn() }) }));
vi.mock('../../lib/api', () => ({ fetchFollowCounts: vi.fn() }));

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-1',
    username: 'buscadora',
    display_name: 'Buscadora Lunar',
    religion_path: 'umbanda',
    mana_xp: 130,
    streak_days: 3,
    logged_today_at: null,
    sun_sign: null,
    moon_sign: null,
    ascendant_sign: null,
    is_verified: false,
    referred_by: null,
    stealth_pin: '7777',
    avatar_layers: { aura: 'default', robe: 'default', item: 'default' },
    unlocked_items: ['aura:default', 'robe:default', 'item:default'],
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('PerfilScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchFollowCounts).mockResolvedValue({ followers: 4, following: 2 });
    vi.mocked(useSession).mockReturnValue({
      session: { user: { id: 'user-1' } },
      profile: makeProfile(),
      loading: false,
      refreshProfile: vi.fn(),
      adjustManaXp: vi.fn(),
      patchProfileLocal: vi.fn(),
    } as unknown as ReturnType<typeof useSession>);
    vi.mocked(useAgoraData).mockReturnValue({ posts: [] } as unknown as ReturnType<typeof useAgoraData>);
    vi.mocked(useCovensData).mockReturnValue({ covens: [] } as unknown as ReturnType<typeof useCovensData>);
    vi.mocked(useEgregoraData).mockReturnValue({
      candles: [],
      gratitude: [],
    } as unknown as ReturnType<typeof useEgregoraData>);
    vi.mocked(useTrilhasData).mockReturnValue({ lunarQuests: [] } as unknown as ReturnType<typeof useTrilhasData>);
  });

  it('mostra nome, grau e a barra de mana', () => {
    render(<PerfilScreen />);
    expect(screen.getByText('Buscadora Lunar')).toBeInTheDocument();
    expect(screen.getByText('Grau 2 · Aprendiz', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('10 / 120 Mana')).toBeInTheDocument();
  });

  it('exibe as conquistas alcançadas com base nas estatísticas', () => {
    render(<PerfilScreen />);
    expect(screen.getByTitle('Buscador Dedicado')).toBeInTheDocument();
    expect(screen.getByTitle('Alcance 480 Mana')).toBeInTheDocument();
  });

  it('mostra o link de convite pessoal', () => {
    render(<PerfilScreen />);
    const input = screen.getByDisplayValue(/\?ref=user-1$/);
    expect(input).toBeInTheDocument();
  });
});
