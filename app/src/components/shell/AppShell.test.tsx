import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './AppShell';

function renderShell(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<div>Conteúdo da Ágora</div>} />
          <Route path="covens" element={<div>Conteúdo de Covens</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppShell', () => {
  it('renderiza os 6 itens de navegação na side-nav e na bottom-nav', () => {
    renderShell();
    for (const label of ['Ágora', 'Covens', 'Trilhas', 'Altar', 'Egrégora', 'Perfil']) {
      // Um em cada nav (side + bottom) = 2 ocorrências.
      expect(screen.getAllByText(label)).toHaveLength(2);
    }
  });

  it('mostra o conteúdo da rota atual através do Outlet', () => {
    renderShell('/covens');
    expect(screen.getByText('Conteúdo de Covens')).toBeInTheDocument();
  });

  it('marca o link de navegação da rota atual como ativo', () => {
    renderShell('/covens');
    const covensLinks = screen.getAllByRole('link', { name: /Covens/ });
    for (const link of covensLinks) {
      expect(link.className).toMatch(/Active/);
    }
  });
});
