import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlossaryList } from './GlossaryList';

describe('GlossaryList', () => {
  it('filtra os termos pela busca', async () => {
    const user = userEvent.setup();
    render(<GlossaryList />);
    expect(screen.getByText('Arruda', { exact: false })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Buscar um termo…'), 'ametista');
    expect(screen.getByText('Ametista', { exact: false })).toBeInTheDocument();
    expect(screen.queryByText('Arruda', { exact: false })).not.toBeInTheDocument();
  });

  it('mostra mensagem quando nada é encontrado', async () => {
    const user = userEvent.setup();
    render(<GlossaryList />);
    await user.type(screen.getByPlaceholderText('Buscar um termo…'), 'xyzxyz');
    expect(screen.getByText('Nenhum termo encontrado.')).toBeInTheDocument();
  });
});
