import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizModal } from './QuizModal';
import { useTrilhasData } from '../../context/TrilhasDataContext';
import type { TrilhaModule } from '../../types/trilhas';

vi.mock('../../context/TrilhasDataContext', () => ({
  useTrilhasData: vi.fn(),
}));

const module: TrilhaModule = {
  id: 'm1',
  title: 'História & Fundamentos',
  sub: 'Origens das tradições místicas',
  xp: 15,
  initiallyDone: false,
};

describe('QuizModal', () => {
  const completeModule = vi.fn();
  const onDone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTrilhasData).mockReturnValue({ completeModule } as unknown as ReturnType<typeof useTrilhasData>);
  });

  it('mostra a primeira pergunta do módulo', () => {
    render(<QuizModal module={module} onDone={onDone} />);
    expect(screen.getByText('Pergunta 1 de 3')).toBeInTheDocument();
  });

  it('acertando todas as perguntas concede o Mana total do módulo', async () => {
    const user = userEvent.setup();
    render(<QuizModal module={module} onDone={onDone} />);

    // As respostas corretas são index 0, 1, 2 (ver trilhasData.ts, m1).
    await user.click(screen.getByText('Umbanda'));
    await screen.findByText('Pergunta 2 de 3', {}, { timeout: 2000 });
    await user.click(screen.getByText('Thelema'));
    await screen.findByText('Pergunta 3 de 3', {}, { timeout: 2000 });
    await user.click(screen.getByText('Um livro de anotações e feitiços pessoais'));
    await screen.findByText('Módulo concluído ✦', {}, { timeout: 2000 });

    expect(completeModule).toHaveBeenCalledWith('m1', 15);
  }, 10000);
});
