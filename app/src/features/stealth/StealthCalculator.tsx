import { useState } from 'react';
import { useToast } from '../../components/toast/ToastProvider';

interface CalcState {
  expr: string;
  pinBuffer: string;
  freshStart: boolean;
}

const CALC_KEYS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
] as const;

// Porte literal de index.html:3345-3394, 3475 (calcState/calcPress/render) e
// :1475-1502 (markup). Digitar o código pessoal (pin) e apertar "=" sem
// nenhum operador no meio sai do disfarce; qualquer operador zera o buffer
// do pin, então a calculadora volta a "só calcular".
export function StealthCalculator({ pin, onExit }: { pin: string; onExit: () => void }) {
  const [calc, setCalc] = useState<CalcState>({ expr: '0', pinBuffer: '', freshStart: true });
  const { showToast } = useToast();

  function press(val: string) {
    const isDigit = /^[0-9.]$/.test(val);
    setCalc((prev) => {
      if (val === 'C') return { expr: '0', pinBuffer: '', freshStart: true };
      if (val === '=') {
        if (prev.pinBuffer && prev.pinBuffer === pin) {
          queueMicrotask(() => {
            onExit();
            showToast('Bem-vindo(a) de volta ao Arcanum ✦');
          });
          return prev;
        }
        let expr = prev.expr;
        try {
          const safe = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/[^0-9+\-*/.]/g, '');
          // Entrada controlada: só dígitos/operadores dos próprios botões chegam em `expr`.
          const result = Function('"use strict"; return (' + safe + ')')();
          expr = Number.isFinite(result) ? String(Math.round(result * 1e10) / 1e10) : 'Erro';
        } catch {
          expr = 'Erro';
        }
        return { expr, pinBuffer: '', freshStart: true };
      }
      if (val === '±') {
        return { ...prev, expr: prev.expr.startsWith('-') ? prev.expr.slice(1) : '-' + prev.expr };
      }
      if (val === '%') {
        try {
          return { ...prev, expr: String(parseFloat(prev.expr) / 100) };
        } catch {
          return prev;
        }
      }
      if (isDigit) {
        return {
          pinBuffer: prev.pinBuffer + val,
          expr: prev.freshStart ? val : prev.expr + val,
          freshStart: false,
        };
      }
      // Operador: um passo de conta de verdade, então isso já não pode "ser só o pin".
      return { pinBuffer: '', expr: prev.expr + val, freshStart: false };
    });
  }

  return (
    <div className="stealth-screen" role="dialog" aria-label="Calculadora">
      <div className="calc-display">{calc.expr}</div>
      <div className="calc-grid">
        {CALC_KEYS.flat().map((key) => (
          <button
            key={key}
            className={`calc-btn ${key === 'C' || key === '±' || key === '%' ? 'calc-fn' : ''} ${
              ['÷', '×', '-', '+'].includes(key) ? 'calc-op' : ''
            }`}
            onClick={() => press(key)}
          >
            {key}
          </button>
        ))}
        <button className="calc-btn calc-zero" onClick={() => press('0')}>
          0
        </button>
        <button className="calc-btn" onClick={() => press('.')}>
          .
        </button>
        <button className="calc-btn calc-eq" onClick={() => press('=')}>
          =
        </button>
      </div>
    </div>
  );
}
