import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PAWNS } from '../data/pawns';

type Mode = 'login' | 'register';

export default function LoginScreen() {
  const { login, register } = useAuth();

  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [pawnId, setPawnId]     = useState(PAWNS[0].id);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) { setError('Digite seu nome.'); setLoading(false); return; }
        await register(email, password, name.trim(), pawnId);
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Erro desconhecido.';
      if (msg.includes('email-already-in-use')) setError('E-mail já cadastrado. Faça login.');
      else if (msg.includes('wrong-password') || msg.includes('invalid-credential')) setError('E-mail ou senha incorretos.');
      else if (msg.includes('user-not-found')) setError('Usuário não encontrado.');
      else if (msg.includes('weak-password')) setError('Senha muito fraca (mínimo 6 caracteres).');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.page}>
      {/* ── Hero ── */}
      <div style={S.hero}>
        <span style={S.heroEmoji}>🗺️</span>
        <h1 style={S.heroTitle}>MONOVALE</h1>
        <p style={S.heroSub}>Monopoly do Vale do Paraíba</p>
        <p style={S.heroBanker}>🏦 Banco do Sr. Marinho</p>
      </div>

      {/* ── Card ── */}
      <div style={S.card}>
        {/* Mode tabs */}
        <div style={S.tabs}>
          <button
            style={{ ...S.tab, ...(mode === 'login' ? S.tabActive : {}) }}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Entrar
          </button>
          <button
            style={{ ...S.tab, ...(mode === 'register' ? S.tabActive : {}) }}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleSubmit} style={S.form}>
          {mode === 'register' && (
            <>
              <label style={S.label}>Seu nome no jogo</label>
              <input
                style={S.input}
                type="text"
                placeholder="Ex: João do Vale"
                value={name}
                maxLength={20}
                onChange={e => setName(e.target.value)}
                required
              />

              <label style={S.label}>Escolha seu peão favorito</label>
              <div style={S.pawnGrid}>
                {PAWNS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    title={p.name}
                    onClick={() => setPawnId(p.id)}
                    style={{
                      ...S.pawnBtn,
                      ...(pawnId === p.id ? { ...S.pawnBtnSel, background: p.color } : {}),
                    }}
                  >
                    {p.emoji}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-mid)', margin: '0 0 12px', fontWeight: 600 }}>
                {PAWNS.find(p => p.id === pawnId)?.name}
              </p>
            </>
          )}

          <label style={S.label}>E-mail</label>
          <input
            style={S.input}
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label style={S.label}>Senha</label>
          <input
            style={S.input}
            type="password"
            placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />

          {error && <div style={S.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{ ...S.submitBtn, ...(loading ? S.submitBtnLoading : {}) }}
          >
            {loading ? '⏳ Aguarde...' : mode === 'login' ? '🎲 ENTRAR' : '🚀 CRIAR CONTA'}
          </button>
        </form>

        <p style={S.switch}>
          {mode === 'login'
            ? <>Não tem conta? <span style={S.switchLink} onClick={() => { setMode('register'); setError(''); }}>Criar agora</span></>
            : <>Já tem conta? <span style={S.switchLink} onClick={() => { setMode('login'); setError(''); }}>Fazer login</span></>
          }
        </p>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    height: '100%',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'var(--font-body)',
    overflowY: 'auto',
  },
  hero: {
    width: '100%',
    background: 'var(--gold-grad)',
    padding: '32px 24px 28px',
    textAlign: 'center',
    boxShadow: '0 4px 0 var(--gold-dark), 0 6px 20px rgba(0,0,0,0.15)',
  },
  heroEmoji: { fontSize: 56, lineHeight: 1, display: 'block', marginBottom: 8 },
  heroTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 52,
    color: 'var(--text)',
    margin: '0 0 4px',
    letterSpacing: '2px',
    textShadow: '2px 2px 0 rgba(255,255,255,0.4)',
  },
  heroSub: { fontSize: 15, fontWeight: 700, color: 'var(--text)', opacity: 0.7, margin: '0 0 4px' },
  heroBanker: { fontSize: 13, fontWeight: 600, color: 'var(--text)', opacity: 0.55, margin: 0 },

  card: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '3px solid var(--border-gold)',
    boxShadow: 'var(--shadow-lg)',
    padding: '0 0 24px',
    width: '100%',
    maxWidth: 420,
    margin: '28px 16px 40px',
    overflow: 'hidden',
  },

  tabs: {
    display: 'flex',
    borderBottom: '2px solid var(--border)',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    padding: '14px',
    background: 'var(--card-alt)',
    border: 'none',
    fontFamily: 'var(--font-title)',
    fontSize: 18,
    color: 'var(--text-mid)',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'var(--card)',
    color: 'var(--text)',
    borderBottom: '3px solid var(--gold)',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 24px',
  },
  label: {
    fontSize: 12,
    fontWeight: 800,
    color: 'var(--text-mid)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: 6,
  },
  input: {
    padding: '11px 14px',
    borderRadius: 'var(--radius)',
    border: '2px solid var(--border)',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    background: 'var(--white)',
    color: 'var(--text)',
    outline: 'none',
    marginBottom: 14,
    transition: 'border-color 0.15s',
  },

  pawnGrid: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  pawnBtn: {
    width: 38, height: 38,
    borderRadius: 10,
    border: '2px solid var(--border)',
    background: 'var(--white)',
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0,
    boxShadow: '0 2px 0 var(--border)',
    transition: 'all 0.12s',
  },
  pawnBtnSel: {
    transform: 'translateY(-2px) scale(1.1)',
    boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
    border: '2px solid rgba(255,255,255,0.4)',
  },

  error: {
    background: '#fef2f2',
    border: '2px solid #fecaca',
    borderRadius: 'var(--radius)',
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--red)',
    marginBottom: 14,
  },

  submitBtn: {
    padding: '15px',
    background: 'var(--green-grad)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'var(--font-title)',
    fontSize: 20,
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: '0 5px 0 var(--green-dark)',
    transition: 'transform 0.1s, box-shadow 0.1s',
    marginBottom: 4,
  },
  submitBtnLoading: {
    background: 'linear-gradient(135deg,#d1d5db,#9ca3af)',
    boxShadow: '0 5px 0 #6b7280',
    cursor: 'not-allowed',
  },

  switch: { fontSize: 13, color: 'var(--text-mid)', textAlign: 'center', marginTop: 16, padding: '0 24px' },
  switchLink: {
    color: 'var(--green-dark)',
    fontWeight: 800,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};
