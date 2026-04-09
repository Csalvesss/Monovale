import React, { useState } from 'react';
import { PAWNS } from '../data/pawns';
import type { LobbyConfig, LobbyPlayerConfig } from '../types';

interface Props {
  onStart: (config: LobbyConfig) => void;
}

export default function Lobby({ onStart }: Props) {
  const [playerCount, setPlayerCount] = useState(2);
  const [randomOrder, setRandomOrder] = useState(false);
  const [players, setPlayers] = useState<LobbyPlayerConfig[]>(
    Array.from({ length: 8 }, (_, i) => ({ name: '', pawnId: PAWNS[i].id }))
  );

  const activePlayers = players.slice(0, playerCount);
  const usedPawns = activePlayers.map(p => p.pawnId);
  const allNamesFilled = activePlayers.every(p => p.name.trim().length > 0);
  const allPawnsUnique = new Set(usedPawns).size === activePlayers.length;
  const canStart = allNamesFilled && allPawnsUnique;

  function updatePlayer(index: number, update: Partial<LobbyPlayerConfig>) {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, ...update } : p));
  }

  function handleCountChange(count: number) {
    setPlayerCount(count);
    // Auto-assign unique pawns
    setPlayers(prev => {
      const taken = new Set<string>();
      return prev.map((p, i) => {
        let pawnId = p.pawnId;
        if (i < count) {
          if (taken.has(pawnId)) {
            pawnId = PAWNS.find(pw => !taken.has(pw.id))?.id ?? PAWNS[i].id;
          }
          taken.add(pawnId);
        }
        return { ...p, pawnId };
      });
    });
  }

  function handleStart() {
    if (!canStart) return;
    onStart({
      playerCount,
      players: activePlayers.map(p => ({ name: p.name.trim(), pawnId: p.pawnId })),
      randomOrder,
    });
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>🗺️</div>
        <h1 style={styles.title}>Monovale</h1>
        <p style={styles.subtitle}>Monopoly do Vale do Paraíba</p>
        <p style={styles.banker}>Banco do <strong>Sr. Marinho</strong> — Onde cada terreno conta!</p>
      </div>

      <div style={styles.card}>
        {/* Player count selector */}
        <div style={styles.section}>
          <label style={styles.label}>Número de Jogadores</label>
          <div style={styles.countButtons}>
            {[2, 3, 4, 5, 6, 7, 8].map(n => (
              <button
                key={n}
                onClick={() => handleCountChange(n)}
                style={{
                  ...styles.countBtn,
                  ...(playerCount === n ? styles.countBtnActive : {}),
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Player configs */}
        <div style={styles.section}>
          <label style={styles.label}>Jogadores</label>
          <div style={styles.playerList}>
            {Array.from({ length: playerCount }, (_, i) => {
              const p = players[i];
              const selectedPawn = PAWNS.find(pw => pw.id === p.pawnId) ?? PAWNS[i];
              return (
                <div key={i} style={styles.playerRow}>
                  <div style={styles.playerNum}>#{i + 1}</div>
                  <input
                    type="text"
                    placeholder={`Nome do Jogador ${i + 1}`}
                    value={p.name}
                    maxLength={20}
                    onChange={e => updatePlayer(i, { name: e.target.value })}
                    style={styles.nameInput}
                  />
                  <div style={styles.pawnSelect}>
                    {PAWNS.map(pawn => {
                      const takenByOther = usedPawns.includes(pawn.id) && pawn.id !== p.pawnId;
                      return (
                        <button
                          key={pawn.id}
                          title={pawn.name}
                          disabled={takenByOther}
                          onClick={() => updatePlayer(i, { pawnId: pawn.id })}
                          style={{
                            ...styles.pawnBtn,
                            ...(p.pawnId === pawn.id ? { backgroundColor: pawn.color, transform: 'scale(1.15)' } : {}),
                            ...(takenByOther ? styles.pawnBtnDisabled : {}),
                          }}
                        >
                          {pawn.emoji}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ ...styles.pawnLabel, color: selectedPawn.color }}>
                    {selectedPawn.emoji} {selectedPawn.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order option */}
        <div style={styles.section}>
          <label style={styles.toggleRow}>
            <input
              type="checkbox"
              checked={randomOrder}
              onChange={e => setRandomOrder(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <span style={styles.toggleLabel}>Ordem aleatória dos turnos</span>
          </label>
        </div>

        {/* Validation feedback */}
        {!allNamesFilled && (
          <p style={styles.error}>⚠️ Preencha o nome de todos os jogadores.</p>
        )}
        {allNamesFilled && !allPawnsUnique && (
          <p style={styles.error}>⚠️ Dois jogadores escolheram o mesmo peão.</p>
        )}

        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{ ...styles.startBtn, ...(canStart ? {} : styles.startBtnDisabled) }}
        >
          🎲 Começar Partida
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #1a3a2a 0%, #0f2418 50%, #162e1e 100%)',
    fontFamily: '"Segoe UI", system-ui, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 64,
    lineHeight: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: 800,
    color: '#d4af37',
    margin: 0,
    letterSpacing: '-1px',
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  subtitle: {
    fontSize: 16,
    color: '#86efac',
    margin: '4px 0 8px',
  },
  banker: {
    fontSize: 14,
    color: '#d1fae5',
    margin: 0,
    opacity: 0.8,
  },
  card: {
    background: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    padding: '28px 32px',
    width: '100%',
    maxWidth: 680,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    display: 'block',
    fontWeight: 700,
    fontSize: 14,
    color: '#374151',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  countButtons: {
    display: 'flex',
    gap: 8,
  },
  countBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    border: '2px solid #e5e7eb',
    background: '#f9fafb',
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
    color: '#374151',
  },
  countBtnActive: {
    background: '#166534',
    borderColor: '#166534',
    color: '#fff',
    transform: 'scale(1.05)',
  },
  playerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    padding: '10px 12px',
    background: '#f9fafb',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
  },
  playerNum: {
    fontWeight: 700,
    fontSize: 13,
    color: '#6b7280',
    width: 24,
    flexShrink: 0,
  },
  nameInput: {
    flex: '1 1 140px',
    minWidth: 120,
    padding: '8px 12px',
    borderRadius: 8,
    border: '2px solid #e5e7eb',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  },
  pawnSelect: {
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
  },
  pawnBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: '2px solid #e5e7eb',
    background: '#fff',
    fontSize: 18,
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  pawnBtnDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },
  pawnLabel: {
    fontSize: 12,
    fontWeight: 600,
    flex: '1 1 100px',
    whiteSpace: 'nowrap',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: '#374151',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    margin: '0 0 12px',
    padding: '8px 12px',
    background: '#fef2f2',
    borderRadius: 8,
    border: '1px solid #fecaca',
  },
  startBtn: {
    width: '100%',
    padding: '14px',
    background: '#166534',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s, transform 0.1s',
    letterSpacing: '0.3px',
  },
  startBtnDisabled: {
    background: '#9ca3af',
    cursor: 'not-allowed',
    transform: 'none',
  },
};
