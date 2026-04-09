import React, { useState } from 'react';
import { PAWNS } from '../data/pawns';
import { useAuth } from '../contexts/AuthContext';
import type { LobbyConfig, LobbyPlayerConfig } from '../types';

interface Props {
  onStart: (config: LobbyConfig) => void;
  onBack: () => void;
}

export default function Lobby({ onStart, onBack }: Props) {
  const { profile, allUsers } = useAuth();

  const makeDefaultPlayer = (i: number): LobbyPlayerConfig => {
    // Slot 0 pre-filled with logged-in user
    if (i === 0 && profile) {
      return { name: profile.displayName, pawnId: profile.pawnId, uid: profile.uid };
    }
    return { name: '', pawnId: PAWNS[i].id, uid: null };
  };

  const [playerCount, setPlayerCount] = useState(2);
  const [randomOrder, setRandomOrder] = useState(false);
  const [players, setPlayers] = useState<LobbyPlayerConfig[]>(
    Array.from({ length: 8 }, (_, i) => makeDefaultPlayer(i))
  );
  const [accountSearch, setAccountSearch] = useState<Record<number, string>>({});

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

  function linkAccount(slotIndex: number, uid: string | null) {
    if (!uid) {
      // Unlink — restore to guest
      updatePlayer(slotIndex, { uid: null });
      setAccountSearch(prev => ({ ...prev, [slotIndex]: '' }));
      return;
    }
    const user = allUsers.find(u => u.uid === uid);
    if (!user) return;
    updatePlayer(slotIndex, { uid: user.uid, name: user.displayName, pawnId: user.pawnId });
    setAccountSearch(prev => ({ ...prev, [slotIndex]: '' }));
  }

  function handleStart() {
    if (!canStart) return;
    onStart({
      playerCount,
      players: activePlayers.map(p => ({ name: p.name.trim(), pawnId: p.pawnId, uid: p.uid ?? null })),
      randomOrder,
    });
  }

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.headerTop}>
          <button onClick={onBack} style={S.backBtn}>← Voltar</button>
          <div style={S.headerInner}>
            <span style={S.headerEmoji}>🗺️</span>
            <span style={S.headerTitle}>MONOVALE</span>
          </div>
          <div style={{ width: 80 }} />
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
                const search = accountSearch[i] ?? '';
                const searchResults = search.length >= 2
                  ? allUsers.filter(u =>
                      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
                      u.email.toLowerCase().includes(search.toLowerCase())
                    ).slice(0, 5)
                  : [];

                return (
                  <div key={i} style={S.playerRow}>
                    <div style={S.playerNumBadge}>{i + 1}</div>

                    <div style={S.playerFields}>
                      {/* Name + account link row */}
                      <div style={S.nameAccountRow}>
                        <input
                          type="text"
                          placeholder={`Jogador ${i + 1}`}
                          value={p.name}
                          maxLength={20}
                          onChange={e => updatePlayer(i, { name: e.target.value, uid: null })}
                          style={S.nameInput}
                        />

                        {/* Account link badge / search */}
                        {p.uid ? (
                          <div style={S.linkedBadge}>
                            <span>🔗 {allUsers.find(u => u.uid === p.uid)?.email ?? 'Conta'}</span>
                            <button
                              style={S.unlinkBtn}
                              onClick={() => linkAccount(i, null)}
                              title="Desvincular conta"
                            >✕</button>
                          </div>
                        ) : (
                          <div style={S.accountSearchWrapper}>
                            <input
                              type="text"
                              placeholder="🔍 Vincular conta..."
                              value={search}
                              onChange={e => setAccountSearch(prev => ({ ...prev, [i]: e.target.value }))}
                              style={S.accountSearchInput}
                            />
                            {searchResults.length > 0 && (
                              <div style={S.dropdown}>
                                {searchResults.map(u => (
                                  <button
                                    key={u.uid}
                                    style={S.dropdownItem}
                                    onClick={() => linkAccount(i, u.uid)}
                                  >
                                    <span style={S.dropdownName}>{u.displayName}</span>
                                    <span style={S.dropdownEmail}>{u.email}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Pawn row */}
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
                        <span style={{ ...S.pawnLabel, color: sel.color }}>
                          {sel.emoji} {sel.name}
                        </span>
                      </div>
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
    padding: '20px 24px 20px',
    textAlign: 'center',
    boxShadow: '0 4px 0 var(--gold-dark), 0 6px 20px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backBtn: {
    padding: '6px 14px',
    background: 'rgba(0,0,0,0.15)',
    border: 'none',
    borderRadius: 99,
    fontFamily: 'var(--font-body)',
    fontWeight: 800,
    fontSize: 13,
    color: 'var(--text)',
    cursor: 'pointer',
    width: 80,
  },
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerEmoji: { fontSize: 44, lineHeight: 1 },
  headerTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 48,
    color: 'var(--text)',
    letterSpacing: '2px',
    textShadow: '2px 2px 0 rgba(255,255,255,0.4), -1px -1px 0 rgba(0,0,0,0.1)',
    lineHeight: 1,
  },
  headerSub: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text)',
    opacity: 0.75,
    margin: '4px 0 2px',
  },
  headerBanker: {
    fontSize: 12,
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
    maxWidth: 760,
  },

  section: { marginBottom: 24 },

  sectionLabel: {
    fontFamily: 'var(--font-title)',
    fontSize: 20,
    color: 'var(--text)',
    letterSpacing: '1px',
    marginBottom: 12,
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
    alignItems: 'flex-start',
    gap: 10,
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
    marginTop: 4,
  },

  playerFields: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 0,
  },

  nameAccountRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
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
  },

  accountSearchWrapper: {
    position: 'relative',
    flex: '1 1 160px',
    minWidth: 140,
  },
  accountSearchInput: {
    width: '100%',
    padding: '9px 14px',
    borderRadius: 'var(--radius)',
    border: '2px solid var(--border)',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    background: 'var(--white)',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
  },
  dropdown: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    background: 'var(--card)',
    border: '2px solid var(--border-gold)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 200,
    overflow: 'hidden',
  },
  dropdownItem: {
    width: '100%',
    padding: '10px 14px',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    fontFamily: 'var(--font-body)',
  },
  dropdownName: { fontSize: 14, fontWeight: 700, color: 'var(--text)' },
  dropdownEmail: { fontSize: 11, color: 'var(--text-mid)', fontWeight: 600 },

  linkedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--green)',
    color: '#fff',
    borderRadius: 99,
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  unlinkBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 900,
    fontSize: 14,
    padding: 0,
    lineHeight: 1,
  },

  pawnRow: { display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' },

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
    whiteSpace: 'nowrap',
    marginLeft: 4,
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
  toggleLabel: { fontSize: 15, fontWeight: 700, color: 'var(--text)' },

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
