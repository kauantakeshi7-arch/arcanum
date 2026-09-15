import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CovensScreen } from './CovensScreen';
import { useCovensData } from '../../context/CovensDataContext';
import { useModal } from '../../components/modal/ModalProvider';
import { useToast } from '../../components/toast/ToastProvider';
import type { CovenListItem } from '../../types/covens';

vi.mock('../../context/CovensDataContext', () => ({
  useCovensData: vi.fn(),
}));
vi.mock('../../components/modal/ModalProvider', () => ({
  useModal: vi.fn(),
}));
vi.mock('../../components/toast/ToastProvider', () => ({
  useToast: vi.fn(),
}));

function makeCoven(overrides: Partial<CovenListItem> = {}): CovenListItem {
  return {
    id: 'coven-1',
    name: 'Terreiro da Lua',
    slug: 'terreiro-da-lua',
    tradition: 'umbanda',
    description: 'Um espaço acolhedor.',
    privacy: 'public',
    memberCount: 3,
    createdBy: 'user-x',
    pinnedAnnouncement: null,
    joined: false,
    ...overrides,
  };
}

describe('CovensScreen', () => {
  const toggleMembership = vi.fn();
  const push = vi.fn();
  const pop = vi.fn();
  const showToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    toggleMembership.mockResolvedValue(undefined);
    vi.mocked(useModal).mockReturnValue({ push, pop } as unknown as ReturnType<typeof useModal>);
    vi.mocked(useToast).mockReturnValue({ showToast } as unknown as ReturnType<typeof useToast>);
  });

  it('separa covens em "Seus Covens" e "Descobrir"', () => {
    vi.mocked(useCovensData).mockReturnValue({
      loading: false,
      covens: [makeCoven({ id: 'a', name: 'Meu Coven', joined: true }), makeCoven({ id: 'b', name: 'Outro Coven' })],
      toggleMembership,
    } as unknown as ReturnType<typeof useCovensData>);

    render(<CovensScreen />);
    expect(screen.getByText('Seus Covens')).toBeInTheDocument();
    expect(screen.getByText('Meu Coven')).toBeInTheDocument();
    expect(screen.getByText('Outro Coven')).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há nenhum coven', () => {
    vi.mocked(useCovensData).mockReturnValue({
      loading: false,
      covens: [],
      toggleMembership,
    } as unknown as ReturnType<typeof useCovensData>);

    render(<CovensScreen />);
    expect(screen.getByText('Nenhum coven fundado ainda. Que tal ser o(a) primeiro(a)?')).toBeInTheDocument();
  });

  it('chama toggleMembership ao clicar em Entrar', async () => {
    const user = userEvent.setup();
    vi.mocked(useCovensData).mockReturnValue({
      loading: false,
      covens: [makeCoven()],
      toggleMembership,
    } as unknown as ReturnType<typeof useCovensData>);

    render(<CovensScreen />);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(toggleMembership).toHaveBeenCalledWith('coven-1');
  });
});
