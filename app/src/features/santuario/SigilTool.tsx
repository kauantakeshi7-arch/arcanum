import { useEffect, useRef, useState } from 'react';
import { useToast } from '../../components/toast/ToastProvider';
import styles from './SantuarioScreen.module.css';

interface Point {
  x: number;
  y: number;
}

// Porte de index.html:2474-2483, 2606-2680 (sigil-tools/setupSigilCanvas). O
// touchstart/touchmove precisam de listeners nativos com passive:false para
// poder chamar preventDefault() e impedir o scroll da página ao desenhar —
// os eventos sintéticos de touch do React são passivos por padrão.
export function SigilTool() {
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<Point | null>(null);
  const [intention, setIntention] = useState('');

  function paintCanvas(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#B3A0F7';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#8B6CF2';
    ctx.shadowBlur = 8;
    ctxRef.current = ctx;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    paintCanvas(canvas);

    function pos(e: MouseEvent | TouchEvent): Point {
      const r = canvas!.getBoundingClientRect();
      const t = 'touches' in e ? e.touches[0] : e;
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    }
    function start(e: MouseEvent | TouchEvent) {
      drawingRef.current = true;
      lastRef.current = pos(e);
      e.preventDefault();
    }
    function move(e: MouseEvent | TouchEvent) {
      if (!drawingRef.current) return;
      const p = pos(e);
      const ctx = ctxRef.current!;
      ctx.beginPath();
      ctx.moveTo(lastRef.current!.x, lastRef.current!.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastRef.current = p;
      e.preventDefault();
    }
    function stopDrawing() {
      drawingRef.current = false;
    }

    const resizeObserver = new ResizeObserver(() => paintCanvas(canvas));
    resizeObserver.observe(canvas);

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', stopDrawing);
    window.addEventListener('touchend', stopDrawing);
    window.addEventListener('touchcancel', stopDrawing);

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', stopDrawing);
      window.removeEventListener('touchend', stopDrawing);
      window.removeEventListener('touchcancel', stopDrawing);
    };
  }, []);

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function activateSigil() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const cx = canvas.clientWidth / 2;
    const cy = canvas.clientHeight / 2;
    const particles = Array.from({ length: 26 }, () => ({
      x: cx,
      y: cy,
      a: Math.random() * Math.PI * 2,
      s: 1 + Math.random() * 3,
      life: 1,
    }));
    let frame = 0;
    const burst = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += Math.cos(p.a) * p.s;
        p.y += Math.sin(p.a) * p.s;
        p.life -= 0.04;
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = '#D4A853';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      frame++;
      if (frame > 26) {
        clearInterval(burst);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, 30);
    showToast(intention ? `Sigilo de "${intention}" ativado ✦` : 'Sigilo ativado ✦');
    setIntention('');
  }

  return (
    <div className={styles.sigilTools}>
      <div className="section-title" style={{ fontSize: 19, marginBottom: 2 }}>
        Criador de Sigilos
      </div>
      <div className="node-sub" style={{ marginBottom: 10 }}>
        Escreva sua intenção e desenhe o símbolo com o dedo
      </div>
      <div className="form-field">
        <input
          type="text"
          aria-label="Sua intenção"
          placeholder="Ex: coragem para recomeçar"
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
        />
      </div>
      <canvas ref={canvasRef} className={styles.sigilCanvas} />
      <div className={styles.sigilActions}>
        <button className="btn-ghost" onClick={clearCanvas}>
          Limpar
        </button>
        <button className="btn-primary" style={{ marginTop: 0, flex: 1 }} onClick={activateSigil}>
          Ativar Sigilo
        </button>
      </div>
    </div>
  );
}
