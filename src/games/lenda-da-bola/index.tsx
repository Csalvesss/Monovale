import React, { useState } from 'react';
import LendasBoardGame from './board/index';
import ManagerGame from './ManagerGame';
import './styles/lenda.css';

interface Props {
  onBack: () => void;
}

type Mode = 'select' | 'board' | 'manager';

export default function LendaDaBola({ onBack }: Props) {
  const [mode, setMode] = useState<Mode>('select');

  if (mode === 'board') {
    return <LendasBoardGame onBack={() => setMode('select')} />;
  }

  if (mode === 'manager') {
    return <ManagerGame onBack={() => setMode('select')} />;
  }

  // Mode selection screen
  return (
    <div className="lenda-root" style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-void)',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #0a1628 0%, var(--bg-void) 100%)',
        borderBottom: '1px solid var(--border-gold)',
        padding: '28px 16px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, var(--wc-gold), var(--wc-gold-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
          boxShadow: 'var(--shadow-gold)',
        }}>
          <span style={{ fontSize: 28 }}>⚽</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 32,
          letterSpacing: '0.1em', color: 'var(--text-primary)',
          marginBottom: 4,
        }}>
          LENDAS DA BOLA
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Escolha o modo de jogo
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', gap: 14 }}>
        <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Board game — primary */}
          <button
            onClick={() => setMode('board')}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              borderRadius: 16, padding: '18px 20px', cursor: 'pointer', textAlign: 'left',
              background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.03) 100%)',
              border: '1px solid var(--border-gold)',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: 'rgba(251,191,36,0.15)',
              border: '1px solid var(--border-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
            }}>
              🎲
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 20,
                letterSpacing: '0.06em', color: 'var(--wc-gold)', marginBottom: 2,
              }}>
                TABULEIRO ONLINE
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                2–6 jogadores · Crie uma sala e jogue com amigos em tempo real
              </p>
            </div>
            <span style={{ color: 'var(--wc-gold)', fontSize: 18 }}>→</span>
          </button>

          {/* Manager game — secondary */}
          <button
            onClick={() => setMode('manager')}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              borderRadius: 16, padding: '18px 20px', cursor: 'pointer', textAlign: 'left',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-default)',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
            }}>
              🏆
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 20,
                letterSpacing: '0.06em', color: 'var(--text-primary)', marginBottom: 2,
              }}>
                MODO MANAGER
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Singleplayer · Gerencie seu time na Copa do Mundo
              </p>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>→</span>
          </button>

        </div>
      </div>

      {/* Back button */}
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onBack}
          className="lenda-btn-ghost"
          style={{ padding: '10px 24px', fontSize: 13, fontWeight: 700 }}
        >
          ← Voltar ao Monovale
        </button>
      </div>
    </div>
  );
}
