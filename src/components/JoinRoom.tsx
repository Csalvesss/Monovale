import React, { useState } from 'react';
import { ArrowLeft, Gamepad2 } from 'lucide-react';

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
        <button onClick={onBack} style={S.backBtn}>
          <ArrowLeft size={16} />
          Voltar
        </button>
        <div style={S.headerCenter}>
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.15" />
            <path d="M8 28L14 16L20 22L26 12L32 28H8Z" fill="white" fillOpacity="0.9" />
          </svg>
          <span style={S.headerTitle}>Entrar na sala</span>
        </div>
        <div style={{ width: 88 }} />
      </div>

      <div style={S.content}>
        <div style={S.card}>
          <div style={S.iconWrap}>
            <Gamepad2 size={28} color="var(--green)" />
          </div>
          <h2 style={S.title}>Código da sala</h2>
          <p style={S.sub}>Peça o código de 6 letras ao host da partida</p>

          <form onSubmit={handleSubmit} style={S.form}>
            <input
              style={S.codeInput}
              type="text"
              placeholder="XXXXXX"
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
              {loading ? 'Entrando...' : 'Entrar na sala'}
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
    width: '100%',
    height: 56,
    background: 'linear-gradient(90deg, #065F46, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    flexShrink: 0,
    boxShadow: '0 1px 0 rgba(0,0,0,0.15)',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 99,
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: 13,
    color: '#fff',
    cursor: 'pointer',
  },
  headerCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 18,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.2px',
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
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-lg)',
    padding: '36px 32px',
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: 'rgba(5,150,105,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: 24,
    fontWeight: 800,
    color: 'var(--text)',
    margin: '0 0 8px',
    letterSpacing: '-0.3px',
  },
  sub: { fontSize: 13, color: 'var(--text-mid)', fontWeight: 500, margin: '0 0 24px', lineHeight: 1.5 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  codeInput: {
    padding: '16px',
    borderRadius: 'var(--radius)',
    border: '1.5px solid var(--border)',
    fontSize: 32,
    fontFamily: 'var(--font-title)',
    fontWeight: 800,
    textAlign: 'center',
    letterSpacing: '8px',
    color: 'var(--text)',
    background: 'var(--card-alt)',
    outline: 'none',
    textTransform: 'uppercase',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  error: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 'var(--radius)',
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--red)',
  },
  btn: {
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
    letterSpacing: '0.2px',
  },
  btnDisabled: {
    background: 'var(--border)',
    boxShadow: 'none',
    cursor: 'not-allowed',
    color: 'var(--text-mid)',
  },
};
