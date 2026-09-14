import { useState, type FormEvent } from 'react';
import { signIn, signUp } from '../../lib/auth';
import styles from './AuthScreen.module.css';

type AuthTab = 'login' | 'signup';

function emailIsValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthScreen() {
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailHint = email && !emailIsValid(email) ? 'E-mail inválido.' : '';
  const confirmHint =
    tab === 'signup' && confirmPassword && confirmPassword !== password ? 'As senhas não coincidem.' : '';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!emailIsValid(email)) {
      setError('Digite um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (tab === 'signup' && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'signup') {
        const username = email.split('@')[0] + '.' + Math.random().toString(36).slice(2, 6);
        await signUp({
          email,
          password,
          username,
          display_name: displayName || email.split('@')[0],
        });
      } else {
        await signIn({ email, password });
      }
      // SessionContext detecta a sessão via onAuthStateChange e troca a tela.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado. Tente de novo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.nebula} aria-hidden="true" />
      <div className={styles.stars} aria-hidden="true" />
      <div className={styles.glyphs} aria-hidden="true">
        <span>☿</span>
        <span>♄</span>
        <span>☽</span>
        <span>♀</span>
        <span>⚸</span>
        <span>☉</span>
        <span>♃</span>
        <span>♆</span>
        <span>✦</span>
      </div>

      <div className={styles.card}>
        <span className={`${styles.corner} ${styles.cornerTl}`} />
        <span className={`${styles.corner} ${styles.cornerTr}`} />
        <span className={`${styles.corner} ${styles.cornerBl}`} />
        <span className={`${styles.corner} ${styles.cornerBr}`} />

        <div className={styles.emblem}>
          <svg viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="gradAuthEmblem" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#D4A853" />
                <stop offset="100%" stopColor="#8B6CF2" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="18.6" stroke="url(#gradAuthEmblem)" strokeWidth="1.3" />
            <path d="M24 5.4 39 34.6H9 Z" stroke="url(#gradAuthEmblem)" strokeWidth="1.3" />
          </svg>
        </div>

        <div className={styles.brand}>Arcanum</div>
        <div className={styles.sub}>Entre para acessar sua Ágora, seu Altar e seu Grimório</div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => setTab('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
            onClick={() => setTab('signup')}
          >
            Criar conta
          </button>
        </div>

        <div className={styles.error} role="alert">
          {error}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="authEmail">E-mail</label>
            <div className={styles.inputWrap}>
              <svg
                className={styles.inputIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M3 6l9 7 9-7" />
                <rect x="3" y="5" width="18" height="14" rx="2" />
              </svg>
              <input
                type="email"
                id="authEmail"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={`${styles.fieldHint} ${emailHint ? styles.fieldHintError : ''}`}>{emailHint}</div>
          </div>

          <div className="form-field">
            <label htmlFor="authPassword">Senha</label>
            <div className={`${styles.inputWrap} ${styles.hasToggle}`}>
              <svg
                className={styles.inputIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                id="authPassword"
                autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.pwToggle}
                aria-label="Mostrar senha"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          {tab === 'signup' && (
            <div className="form-field">
              <label htmlFor="authConfirmPassword">Confirmar senha</label>
              <div className={`${styles.inputWrap} ${styles.hasToggle}`}>
                <svg
                  className={styles.inputIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 018 0v3" />
                </svg>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="authConfirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.pwToggle}
                  aria-label="Mostrar senha"
                  aria-pressed={showConfirm}
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
              <div className={`${styles.fieldHint} ${confirmHint ? styles.fieldHintError : ''}`}>
                {confirmHint}
              </div>
            </div>
          )}

          {tab === 'signup' && (
            <div className="form-field">
              <label htmlFor="authDisplayName">Nome de exibição</label>
              <div className={styles.inputWrap}>
                <svg
                  className={styles.inputIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <circle cx="12" cy="8" r="3.6" />
                  <path d="M4.5 20c1.5-4 4.5-6 7.5-6s6 2 7.5 6" />
                </svg>
                <input
                  type="text"
                  id="authDisplayName"
                  autoComplete="nickname"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>
          )}

          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {tab === 'signup' ? 'Criar conta' : 'Entrar'}
          </button>
          {loading && <div className={styles.loading}>Conectando ao Supabase…</div>}
        </form>

        <div className={styles.footerGlyphs} aria-hidden="true">
          ✦ &nbsp;Uma ordem para buscadores solitários&nbsp; ✦
        </div>
      </div>
    </div>
  );
}
