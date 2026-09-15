import type { GrimoireEntryViewModel } from '../types/santuario';

const TYPE_LABELS: Record<string, string> = { dream: 'Sonho', ritual: 'Ritual', meditation: 'Meditação', tarot: 'Tarot' };

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
}

// Porte de index.html:4381-4410 (exportGrimoirePDF) — abre uma janela com o
// conteúdo formatado e chama window.print(), deixando o usuário escolher
// "Salvar como PDF" no diálogo de impressão do navegador.
export function exportGrimoirePdf(displayName: string, entries: GrimoireEntryViewModel[]): 'empty' | 'popup-blocked' | 'ok' {
  if (!entries.length) return 'empty';
  const entriesHtml = entries
    .map(
      (g) => `
    <div style="margin-bottom:22px; padding-bottom:16px; border-bottom:1px solid #ddd;">
      <div style="font-size:11px; color:#888; text-transform:uppercase; letter-spacing:0.5px;">${TYPE_LABELS[g.type] || g.type} · ${escapeHtml(g.date)}</div>
      <div style="font-size:16px; font-weight:600; margin:4px 0 8px; color:#1a1420;">${escapeHtml(g.title)}</div>
      <div style="font-size:13px; line-height:1.6; color:#333; white-space:pre-wrap;">${escapeHtml(g.content)}</div>
    </div>`,
    )
    .join('');
  const win = window.open('', '_blank');
  if (!win) return 'popup-blocked';
  win.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <meta name="color-scheme" content="light only">
    <title>Grimório de ${escapeHtml(displayName)}</title>
    <style>
      html{background:#fff; color-scheme:light only;}
      body{font-family:Georgia, serif; max-width:680px; margin:40px auto; padding:0 20px; color:#1a1420; background:#fff;}
      h1{font-size:26px; border-bottom:2px solid #D4A853; padding-bottom:10px;}
      @media print{ body{margin:0; padding:20px;} }
    </style></head>
    <body>
      <h1>📖 Grimório de ${escapeHtml(displayName)}</h1>
      <p style="color:#888; font-size:12px; margin-bottom:30px;">Exportado do Arcanum em ${new Date().toLocaleDateString('pt-BR')}</p>
      ${entriesHtml}
    </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
  return 'ok';
}
