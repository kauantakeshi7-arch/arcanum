import { useEffect, useRef, useState } from 'react';
import { QUIZZES } from './trilhasData';
import { useTrilhasData } from '../../context/TrilhasDataContext';
import type { TrilhaModule } from '../../types/trilhas';
import styles from './TrilhasScreen.module.css';

// Porte de index.html:2279-2327 (openQuiz/renderQuiz/finishQuiz).
export function QuizModal({ module, onDone }: { module: TrilhaModule; onDone: () => void }) {
  const questions = QUIZZES[module.id] || [];
  const [step, setStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const question = questions[step];

  function pick(optIndex: number) {
    if (chosen !== null) return;
    setChosen(optIndex);
    const isCorrect = optIndex === question.correct;
    if (isCorrect) setCorrectCount((c) => c + 1);
    setTimeout(() => {
      if (step + 1 < questions.length) {
        setStep((s) => s + 1);
        setChosen(null);
      } else {
        setFinished(true);
      }
    }, 900);
  }

  if (finished) {
    const finalCorrect = correctCount;
    const earned = Math.round((module.xp * finalCorrect) / questions.length);
    return <QuizResult correctCount={finalCorrect} total={questions.length} earned={earned} moduleId={module.id} onDone={onDone} />;
  }

  if (!question) return null;

  return (
    <div>
      <div className="modal-title">{module.title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-mid)', marginBottom: 14 }}>
        Pergunta {step + 1} de {questions.length}
      </div>
      <div className={styles.quizQ}>
        <div className={styles.quizQText}>{question.q}</div>
        {question.opts.map((opt, i) => {
          let variant = '';
          if (chosen !== null) {
            if (i === question.correct) variant = styles.correct;
            else if (i === chosen) variant = styles.wrong;
          }
          return (
            <button key={i} className={`${styles.quizOpt} ${variant}`} disabled={chosen !== null} onClick={() => pick(i)}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuizResult({ correctCount, total, earned, moduleId, onDone }: {
  correctCount: number;
  total: number;
  earned: number;
  moduleId: string;
  onDone: () => void;
}) {
  const { completeModule } = useTrilhasData();
  const awarded = useRef(false);

  // Guarda contra o double-invoke de efeitos do StrictMode em desenvolvimento
  // — sem o ref, o Mana seria concedido duas vezes ao montar.
  useEffect(() => {
    if (awarded.current) return;
    awarded.current = true;
    completeModule(moduleId, earned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="modal-title">Módulo concluído ✦</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-mid)', marginBottom: 16 }}>
        Você acertou {correctCount} de {total} perguntas.
      </div>
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--gold-soft)' }}>+{earned}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-low)' }}>Mana de Sabedoria</div>
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={onDone}>
        Continuar
      </button>
    </div>
  );
}
