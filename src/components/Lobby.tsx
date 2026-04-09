import React, { useState } from 'react';
import { ArrowLeft, Link, X, Search } from 'lucide-react';
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
      {/* Header */}
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
          <span style={S.headerTitle}>Jogo Local</span>
        </div>
        <div style={{ width: 88 }} />
      </div>

      {/* Main */}
      <div style={S.scrollArea}>
        <div style={S.mainCard}>

          {/* Player count */}
          <div style={S.section}>
            <div style={S.sectionLabel}>Número de jogadores</div>
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
                      <div style={S.nameAccountRow}>
                        <input
                          type="text"
                          placeholder={`Jogador ${i + 1}`}
                          value={p.name}
                          maxLength={20}
                          onChange={e => updatePlayer(i, { name: e.target.value, uid: null })}
                          style={S.nameInput}
                        />

                        {p.uid ? (
                          <div style={S.linkedBadge}>
                            <Link size={12} />
                            <span>{allUsers.find(u => u.uid === p.uid)?.email ?? 'Conta'}</span>
                            <button
                              style={S.unlinkBtn}
                              onClick={() => linkAccount(i, null)}
                              title="Desvincular"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div style={S.accountSearchWrapper}>
                            <div style={S.searchInputRow}>
                              <Search size={14} color="var(--text-light)" style={{ flexShrink: 0 }} />
                              <input
                                type="text"
                                placeholder="Vincular conta..."
                                value={search}
                                onChange={e => setAccountSearch(prev => ({ ...prev, [i]: e.target.value }))}
                                style={S.accountSearchInput}
                              />
                            </div>
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
                                ...(isSelected ? { background: pawn.color, borderColor: pawn.color } : {}),
                                ...(takenByOther ? S.pawnBtnDisabled : {}),
                              }}
                            >
                              {pawn.emoji}
                            </button>
                          );
                        })}
                        <span style={{ ...S.pawnLabel, color: sel.color }}>
                          {sel.name}
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
              <div
                style={{ ...S.checkbox, ...(randomOrder ? S.checkboxActive : {}) }}
                onClick={() => setRandomOrder(!randomOrder)}
              >
                {randomOrder && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={S.toggleLabel}>Ordem aleatória dos turnos</span>
            </label>
          </div>

          {/* Feedback */}
          {!allNamesFilled && (
            <div style={S.alert}>Preencha o nome de todos os jogadores.</div>
          )}
          {allNamesFilled && !allPawnsUnique && (
            <div style={S.alert}>Dois jogadores escolheram o mesmo peão.</div>
          )}

          {/* CTA */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            style={{ ...S.startBtn, ...(!canStart ? S.startBtnDisabled : {}) }}
          >
            Começar partida
          </button>
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
    alignItems: 'center',
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
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-lg)',
    padding: '28px 32px',
    width: '100%',
    maxWidth: 760,
  },

  section: { marginBottom: 24 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text-mid)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  countRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  countBtn: {
    width: 44,
    height: 44,
    borderRadius: 'var(--radius)',
    border: '1.5px solid var(--border)',
    background: 'var(--card-alt)',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'var(--font-title)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    color: 'var(--text-mid)',
  },
  countBtnActive: {
    background: 'var(--green)',
    borderColor: 'var(--green)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(5,150,105,0.35)',
  },

  playerList: { display: 'flex', flexDirection: 'column', gap: 10 },

  playerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '14px',
    background: 'var(--card-alt)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
  },

  playerNumBadge: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-title)',
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
    marginTop: 5,
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
    padding: '9px 12px',
    borderRadius: 'var(--radius)',
    border: '1.5px solid var(--border)',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    background: 'var(--card)',
    color: 'var(--text)',
    outline: 'none',
  },

  accountSearchWrapper: {
    position: 'relative',
    flex: '1 1 160px',
    minWidth: 140,
  },
  searchInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 'var(--radius)',
    border: '1.5px solid var(--border)',
    background: 'var(--card)',
  },
  accountSearchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'var(--font-body)',
    background: 'transparent',
    color: 'var(--text)',
    padding: 0,
    minWidth: 0,
  },
  dropdown: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-md)',
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
  dropdownName: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  dropdownEmail: { fontSize: 11, color: 'var(--text-mid)', fontWeight: 500 },

  linkedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--green)',
    color: '#fff',
    borderRadius: 99,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
    maxWidth: 220,
    overflow: 'hidden',
  },
  unlinkBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },

  pawnRow: { display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' },

  pawnBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: '1.5px solid var(--border)',
    background: 'var(--card)',
    fontSize: 18,
    cursor: 'pointer',
    transition: 'all 0.12s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  pawnBtnDisabled: {
    opacity: 0.2,
    cursor: 'not-allowed',
  },

  pawnLabel: {
    fontSize: 12,
    fontWeight: 700,
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
    width: 22,
    height: 22,
    borderRadius: 6,
    border: '1.5px solid var(--border)',
    background: 'var(--card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  checkboxActive: {
    background: 'var(--green)',
    borderColor: 'var(--green)',
  },
  toggleLabel: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },

  alert: {
    background: '#FEF3C7',
    border: '1px solid #FCD34D',
    borderRadius: 'var(--radius)',
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    color: '#92400E',
    marginBottom: 14,
  },

  startBtn: {
    width: '100%',
    padding: '14px',
    background: 'var(--green-grad)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
    transition: 'opacity 0.15s',
    letterSpacing: '0.2px',
  },
  startBtnDisabled: {
    background: 'var(--border)',
    boxShadow: 'none',
    cursor: 'not-allowed',
    color: 'var(--text-mid)',
  },
};
