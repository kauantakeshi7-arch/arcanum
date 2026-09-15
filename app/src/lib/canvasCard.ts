// Porte de index.html:4332-4380 (wrapCanvasText/downloadCardImage) — gera um
// cartão PNG compartilhável (usado hoje pela Alquimia; o Oráculo/tarot da
// Egrégora vai reaproveitar quando for portado).
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
  return y + lineHeight;
}

export function downloadCardImage(title: string, lines: string[], filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 1000);
    grad.addColorStop(0, '#1B1838');
    grad.addColorStop(1, '#0A0918');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 1000);
    ctx.strokeStyle = 'rgba(212,168,83,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 760, 960);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#E8C989';
    ctx.font = '600 28px Georgia, serif';
    ctx.fillText('✦ ARCANUM ✦', 400, 90);
    ctx.font = '600 24px Georgia, serif';
    ctx.fillStyle = '#D4A853';
    let y = wrapCanvasText(ctx, title, 400, 160, 680, 32) + 20;
    ctx.font = '16px Georgia, serif';
    ctx.fillStyle = '#EDEAE3';
    lines.forEach((line) => {
      y = wrapCanvasText(ctx, line, 400, y, 680, 24) + 26;
    });
    ctx.font = 'italic 13px Georgia, serif';
    ctx.fillStyle = '#8B87A0';
    ctx.fillText('arcanum-mu.vercel.app', 400, 955);
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Não foi possível gerar a imagem.'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      resolve();
    }, 'image/png');
  });
}
