import React, { useState } from 'react';

interface Props {
  onJoin: (code: string) => Promise<void>;
  onBack: () => void;
}

export default function JoinRoom({ onJoin, onBack }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 4) { setError('Digite o código da sala.'); return; }
    setError('');
    setLoading(true);
    try {
      await onJoin(code.trim().toUpperCase());
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Erro ao entrar na sala.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={onBack} style={S.backBtn}>← Voltar</button>
        <span style={S.headerTitle}>🔑 ENTRAR NA SALA</span>
        <div style={{ width: 80 }} />
      </div>

      <div style={S.content}>
        <div style={S.card}>
          <div style={S.icon}>🎮</div>
          <h2 style={S.title}>Código da Sala</h2>
          <p style={S.sub}>Peça o código de 6 letras para o host da partida</p>

          <form onSubmit={handleSubmit} style={S.form}>
            <input
              style={S.codeInput}
              type="text"
              placeholder="EX: ABC123"
              value={code}
              maxLength={6}
              onChange={e => setCode(e.target.value.toUpperCase())}
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
            />

            {error && <div style={S.error}>{error}</div>}

            <button
              type="submit"
              disabled={loading || code.length < 4}
              style={{
                ...S.btn,
                ...(loading || code.length < 4 ? S.btnDisabled : {}),
              }}
            >
              {loading ? '⏳ Entrando...' : '🚪 ENTRAR NA SALA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100%',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-body)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    height: 56,
    background: 'var(--gold-grad)',
    boxShadow: '0 3px 0 var(--gold-dark)',
    flexShrink: 0,
  },
  backBtn: {
    padding: '6px 14px',
    background: 'rgba(0,0,0,0.15)',
    border: 'none',
    borderRadius: 99,
    fontWeight: 800,
    fontSize: 13,
    color: 'var(--text)',
    cursor: 'pointer',
    width: 80,
  },
  headerTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 22,
    color: 'var(--text)',
    letterSpacing: '1px',
  },
  content: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
  },
  card: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '3px solid var(--border-gold)',
    boxShadow: 'var(--shadow-lg)',
    padding: '36px 32px',
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
  },
  icon: { fontSize: 52, marginBottom: 8 },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: 28,
    color: 'var(--text)',
    margin: '0 0 8px',
  },
  sub: { fontSize: 13, color: 'var(--text-mid)', fontWeight: 600, margin: '0 0 24px' },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  codeInput: {
    padding: '16px',
    borderRadius: 'var(--radius)',
    border: '3px solid var(--border)',
    fontSize: 28,
    fontFamily: 'var(--font-title)',
    fontWeight: 700,
    textAlign: 'center',
    letterSpacing: '6px',
    color: 'var(--text)',
    background: 'var(--white)',
    outline: 'none',
    textTransform: 'uppercase',
  },
  error: {
    background: '#fef2f2',
    border: '2px solid #fecaca',
    borderRadius: 'var(--radius)',
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--red)',
  },
  btn: {
    padding: '16px',
    background: 'var(--gold-grad)',
    color: 'var(--text)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'var(--font-title)',
    fontSize: 20,
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: '0 5px 0 var(--gold-dark)',
  },
  btnDisabled: {
    background: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
    boxShadow: '0 5px 0 #6b7280',
    cursor: 'not-allowed',
    color: '#fff',
  },
};
