import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthScreen } from './AuthScreen';
import * as auth from '../../lib/auth';

vi.mock('../../lib/auth', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

describe('AuthScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('começa na aba de login', () => {
    render(<AuthScreen />);
    const loginTabs = screen.getAllByRole('button', { name: 'Entrar' });
    expect(loginTabs[0].className).toMatch(/tabActive/);
    expect(screen.queryByLabelText('Nome de exibição')).not.toBeInTheDocument();
  });

  it('troca para a aba de criar conta e mostra os campos extras', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(screen.getByLabelText('Confirmar senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome de exibição')).toBeInTheDocument();
  });

  it('mostra erro se o e-mail for inválido ao submeter', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);
    await user.type(screen.getByLabelText('E-mail'), 'nao-e-email');
    await user.type(screen.getByLabelText('Senha'), 'senha123');
    await user.click(within(document.querySelector('form')!).getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Digite um e-mail válido.')).toBeInTheDocument();
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it('chama signIn com email/senha válidos na aba de login', async () => {
    const user = userEvent.setup();
    vi.mocked(auth.signIn).mockResolvedValue({} as never);
    render(<AuthScreen />);
    await user.type(screen.getByLabelText('E-mail'), 'teste@arcanum.dev');
    await user.type(screen.getByLabelText('Senha'), 'senha123');
    await user.click(within(document.querySelector('form')!).getByRole('button', { name: 'Entrar' }));
    expect(auth.signIn).toHaveBeenCalledWith({ email: 'teste@arcanum.dev', password: 'senha123' });
  });

  it('bloqueia o cadastro se as senhas não coincidirem', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    await user.type(screen.getByLabelText('E-mail'), 'teste@arcanum.dev');
    await user.type(screen.getByLabelText('Senha'), 'senha123');
    await user.type(screen.getByLabelText('Confirmar senha'), 'outraSenha');
    const form = document.querySelector('form')!;
    await user.click(within(form).getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('As senhas não coincidem.');
    expect(auth.signUp).not.toHaveBeenCalled();
  });
});
