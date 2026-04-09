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
      else if (msg.includes('weak-password')) setError('Senha fraca — mínimo 6 caracteres.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const selectedPawn = PAWNS.find(p => p.id === pawnId) ?? PAWNS[0];

  return (
    <div style={S.page}>
      {/* ── Left brand panel ── */}
      <div style={S.brand}>
        <div style={S.brandInner}>
          <div style={S.logo}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="white" fillOpacity="0.15"/>
              <path d="M8 28L14 16L20 22L26 12L32 28H8Z" fill="white" fillOpacity="0.9"/>
            </svg>
            <span style={S.logoText}>Monovale</span>
          </div>
          <h1 style={S.brandTitle}>Monopoly do<br/>Vale do Paraíba</h1>
          <p style={S.brandSub}>Compre, construa e domine as cidades do Vale. O Banco do Sr. Marinho está esperando.</p>
          <div style={S.brandFeatures}>
            {['Até 8 jogadores', 'Salas online', 'Estatísticas pessoais'].map(f => (
              <div key={f} style={S.feature}>
                <span style={S.featureDot} />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={S.formPanel}>
        <div style={S.formCard}>
          <h2 style={S.formTitle}>
            {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
          </h2>
          <p style={S.formSub}>
            {mode === 'login'
              ? 'Bem-vindo de volta!'
              : 'Junte-se ao Monovale'}
          </p>

          {/* Tabs */}
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
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} style={S.form}>
            {mode === 'register' && (
              <>
                <div style={S.field}>
                  <label style={S.label}>Nome no jogo</label>
                  <input
                    style={S.input}
                    type="text"
                    placeholder="Como você quer ser chamado"
                    value={name}
                    maxLength={20}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={S.field}>
                  <label style={S.label}>Peão favorito</label>
                  <div style={S.pawnRow}>
                    {PAWNS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        title={p.name}
                        onClick={() => setPawnId(p.id)}
                        style={{
                          ...S.pawnBtn,
                          ...(pawnId === p.id ? { background: p.color, borderColor: p.color } : {}),
                        }}
                      >
                        {p.emoji}
                      </button>
                    ))}
                  </div>
                  <span style={{ ...S.label, fontSize: 12, color: selectedPawn.color, fontWeight: 600, marginTop: 4 }}>
                    {selectedPawn.name}
                  </span>
                </div>
              </>
            )}

            <div style={S.field}>
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
            </div>

            <div style={S.field}>
              <label style={S.label}>Senha</label>
              <input
                style={S.input}
                type="password"
                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : ''}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>

            {error && <div style={S.errorBox}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{ ...S.submitBtn, ...(loading ? S.submitBtnLoading : {}) }}
            >
              {loading
                ? 'Aguarde...'
                : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p style={S.switchText}>
            {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
            <button
              style={S.switchLink}
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            >
              {mode === 'login' ? 'Criar agora' : 'Fazer login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100%',
    display: 'flex',
    fontFamily: 'var(--font-body)',
    background: 'var(--bg)',
  },

  /* Brand left panel */
  brand: {
    display: 'none' as const,
    flex: '0 0 420px',
    background: 'linear-gradient(160deg, #065F46 0%, #047857 50%, #059669 100%)',
    padding: '48px 40px',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  brandInner: { position: 'relative' as const, zIndex: 1 },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 },
  logoText: {
    fontFamily: 'var(--font-title)',
    fontSize: 22,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  brandTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 40,
    fontWeight: 900,
    color: '#fff',
    margin: '0 0 16px',
    lineHeight: 1.15,
    letterSpacing: '-0.5px',
  },
  brandSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.6,
    margin: '0 0 36px',
  },
  brandFeatures: { display: 'flex', flexDirection: 'column', gap: 10 },
  feature: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.85)' },
  featureDot: { width: 8, height: 8, borderRadius: '50%', background: '#34D399', flexShrink: 0 },

  /* Form right panel */
  formPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    overflowY: 'auto',
  },
  formCard: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-lg)',
    padding: '36px 32px',
    width: '100%',
    maxWidth: 420,
    border: '1px solid var(--border)',
  },
  formTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--text)',
    margin: '0 0 4px',
    letterSpacing: '-0.3px',
  },
  formSub: {
    fontSize: 14,
    color: 'var(--text-mid)',
    margin: '0 0 24px',
  },

  tabs: {
    display: 'flex',
    background: 'var(--card-alt)',
    borderRadius: 'var(--radius)',
    padding: 4,
    gap: 4,
    marginBottom: 24,
    border: '1px solid var(--border)',
  },
  tab: {
    flex: 1,
    padding: '9px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-mid)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-body)',
  },
  tabActive: {
    background: 'var(--card)',
    color: 'var(--text)',
    fontWeight: 700,
    boxShadow: '0 1px 4px rgba(15,23,42,0.1)',
  },

  form: { display: 'flex', flexDirection: 'column', gap: 0 },
  field: { display: 'flex', flexDirection: 'column', marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-mid)',
    marginBottom: 6,
  },
  input: {
    padding: '11px 14px',
    borderRadius: 'var(--radius)',
    border: '1.5px solid var(--border)',
    fontSize: 15,
    fontWeight: 500,
    fontFamily: 'var(--font-body)',
    background: 'var(--card)',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },

  pawnRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  pawnBtn: {
    width: 40, height: 40,
    borderRadius: 10,
    border: '1.5px solid var(--border)',
    background: 'var(--card-alt)',
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0,
    transition: 'all 0.12s',
  },

  errorBox: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 'var(--radius)',
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--red)',
    marginBottom: 16,
  },

  submitBtn: {
    padding: '13px',
    background: 'var(--green-grad)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
    transition: 'opacity 0.15s, transform 0.1s',
    marginBottom: 4,
    letterSpacing: '0.2px',
  },
  submitBtnLoading: {
    background: 'var(--border)',
    boxShadow: 'none',
    cursor: 'not-allowed',
    color: 'var(--text-mid)',
  },

  switchText: {
    fontSize: 13,
    color: 'var(--text-mid)',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 0,
  },
  switchLink: {
    background: 'none',
    border: 'none',
    color: 'var(--green)',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    padding: 0,
    textDecoration: 'underline',
  },
};

// Show brand panel on wide screens
if (typeof window !== 'undefined' && window.innerWidth >= 960) {
  S.brand.display = 'flex';
}
