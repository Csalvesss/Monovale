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
    onStart({ playerCount, players: activePlayers.map(p => ({ name: p.name.trim(), pawnId: p.pawnId })), randomOrder });
  }

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.headerInner}>
          <span style={S.headerEmoji}>🗺️</span>
          <span style={S.headerTitle}>MONOVALE</span>
        </div>
        <p style={S.headerSub}>Monopoly do Vale do Paraíba</p>
        <p style={S.headerBanker}>🏦 Banco do <strong>Sr. Marinho</strong> — Onde cada terreno conta!</p>
      </div>

      {/* ── Main card ── */}
      <div style={S.scrollArea}>
        <div style={S.mainCard}>

          {/* Player count */}
          <div style={S.section}>
            <div style={S.sectionLabel}>Número de Jogadores</div>
            <div style={S.countRow}>
              {[2, 3, 4, 5, 6, 7, 8].map(n => (
                <button
                  key={n}
                  onClick={() => handleCountChange(n)}
                  style={{ ...S.countBtn, ...(playerCount === n ? S.countBtnActive : {}) }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Players */}
          <div style={S.section}>
            <div style={S.sectionLabel}>Jogadores</div>
            <div style={S.playerList}>
              {Array.from({ length: playerCount }, (_, i) => {
                const p = players[i];
                const sel = PAWNS.find(pw => pw.id === p.pawnId) ?? PAWNS[i];
                return (
                  <div key={i} style={S.playerRow}>
                    <div style={S.playerNumBadge}>{i + 1}</div>

                    <input
                      type="text"
                      placeholder={`Jogador ${i + 1}`}
                      value={p.name}
                      maxLength={20}
                      onChange={e => updatePlayer(i, { name: e.target.value })}
                      style={S.nameInput}
                    />

                    <div style={S.pawnRow}>
                      {PAWNS.map(pawn => {
                        const takenByOther = usedPawns.includes(pawn.id) && pawn.id !== p.pawnId;
                        const isSelected = p.pawnId === pawn.id;
                        return (
                          <button
                            key={pawn.id}
                            title={pawn.name}
                            disabled={takenByOther}
                            onClick={() => updatePlayer(i, { pawnId: pawn.id })}
                            style={{
                              ...S.pawnBtn,
                              ...(isSelected ? { ...S.pawnBtnActive, background: pawn.color } : {}),
                              ...(takenByOther ? S.pawnBtnDisabled : {}),
                            }}
                          >
                            {pawn.emoji}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ ...S.pawnLabel, color: sel.color }}>
                      {sel.emoji} {sel.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Options */}
          <div style={S.section}>
            <label style={S.toggleRow}>
              <div style={{
                ...S.checkbox,
                ...(randomOrder ? S.checkboxActive : {}),
              }} onClick={() => setRandomOrder(!randomOrder)}>
                {randomOrder && <span>✓</span>}
              </div>
              <span style={S.toggleLabel}>Ordem aleatória dos turnos</span>
            </label>
          </div>

          {/* Feedback */}
          {!allNamesFilled && (
            <div style={S.alert}>⚠️ Preencha o nome de todos os jogadores.</div>
          )}
          {allNamesFilled && !allPawnsUnique && (
            <div style={S.alert}>⚠️ Dois jogadores escolheram o mesmo peão.</div>
          )}

          {/* CTA */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            style={{ ...S.startBtn, ...(!canStart ? S.startBtnDisabled : {}) }}
          >
            🎲 COMEÇAR PARTIDA
          </button>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'var(--font-body)',
  },

  header: {
    width: '100%',
    background: 'var(--gold-grad)',
    padding: '28px 24px 24px',
    textAlign: 'center',
    boxShadow: '0 4px 0 var(--gold-dark), 0 6px 20px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerEmoji: { fontSize: 52, lineHeight: 1 },
  headerTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 56,
    color: 'var(--text)',
    letterSpacing: '2px',
    textShadow: '2px 2px 0 rgba(255,255,255,0.4), -1px -1px 0 rgba(0,0,0,0.1)',
    lineHeight: 1,
  },
  headerSub: {
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text)',
    opacity: 0.75,
    margin: '6px 0 4px',
  },
  headerBanker: {
    fontSize: 13,
    color: 'var(--text)',
    opacity: 0.65,
    margin: 0,
    fontWeight: 600,
  },

  scrollArea: {
    width: '100%',
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '28px 16px 40px',
  },

  mainCard: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '3px solid var(--border-gold)',
    boxShadow: 'var(--shadow-lg)',
    padding: '28px 32px',
    width: '100%',
    maxWidth: 700,
  },

  section: { marginBottom: 24 },

  sectionLabel: {
    fontFamily: 'var(--font-title)',
    fontSize: 20,
    color: 'var(--text)',
    letterSpacing: '1px',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  countRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  countBtn: {
    width: 48,
    height: 48,
    borderRadius: 'var(--radius)',
    border: '2px solid var(--border)',
    background: 'var(--card-alt)',
    fontSize: 20,
    fontWeight: 800,
    fontFamily: 'var(--font-title)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    color: 'var(--text-mid)',
    boxShadow: '0 3px 0 var(--border)',
  },
  countBtnActive: {
    background: 'var(--gold-grad)',
    borderColor: 'var(--gold-dark)',
    color: 'var(--text)',
    boxShadow: '0 3px 0 var(--gold-dark)',
    transform: 'translateY(-1px)',
  },

  playerList: { display: 'flex', flexDirection: 'column', gap: 10 },

  playerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    padding: '12px 14px',
    background: 'var(--card-alt)',
    borderRadius: 'var(--radius-md)',
    border: '2px solid var(--border)',
    boxShadow: '0 3px 0 var(--border)',
  },

  playerNumBadge: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--gold-grad)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-title)',
    fontSize: 15,
    color: 'var(--text)',
    flexShrink: 0,
    boxShadow: '0 2px 0 var(--gold-dark)',
  },

  nameInput: {
    flex: '1 1 140px',
    minWidth: 120,
    padding: '9px 14px',
    borderRadius: 'var(--radius)',
    border: '2px solid var(--border)',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'var(--font-body)',
    background: 'var(--white)',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 0.15s',
  },

  pawnRow: { display: 'flex', gap: 4, flexWrap: 'wrap' },

  pawnBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: '2px solid var(--border)',
    background: 'var(--white)',
    fontSize: 18,
    cursor: 'pointer',
    transition: 'all 0.12s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    boxShadow: '0 2px 0 var(--border)',
  },
  pawnBtnActive: {
    transform: 'translateY(-2px) scale(1.1)',
    boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
    border: '2px solid rgba(255,255,255,0.4)',
  },
  pawnBtnDisabled: {
    opacity: 0.25,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },

  pawnLabel: {
    fontSize: 12,
    fontWeight: 800,
    flex: '1 1 100px',
    whiteSpace: 'nowrap',
  },

  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    border: '2px solid var(--border)',
    background: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 14,
    color: 'var(--green)',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  checkboxActive: {
    background: 'var(--green)',
    borderColor: 'var(--green-dark)',
    color: '#fff',
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text)',
  },

  alert: {
    background: '#fff3cd',
    border: '2px solid #f9ca24',
    borderRadius: 'var(--radius)',
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 700,
    color: '#8a6400',
    marginBottom: 14,
  },

  startBtn: {
    width: '100%',
    padding: '16px',
    background: 'var(--green-grad)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'var(--font-title)',
    fontSize: 22,
    letterSpacing: '1.5px',
    cursor: 'pointer',
    boxShadow: '0 5px 0 var(--green-dark)',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  startBtnDisabled: {
    background: 'linear-gradient(135deg, #b0b0b0, #909090)',
    boxShadow: '0 5px 0 #606060',
    cursor: 'not-allowed',
  },
};
