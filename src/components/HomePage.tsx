import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserRecentGames } from '../services/gameService';
import { PAWNS } from '../data/pawns';
import type { GameResult } from '../types';

interface Props {
  onStartGame: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export default function HomePage({ onStartGame, onCreateRoom, onJoinRoom }: Props) {
  const { profile, logout, updatePawn } = useAuth();
  const [recentGames, setRecentGames] = useState<GameResult[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [editingPawn, setEditingPawn] = useState(false);

  useEffect(() => {
    if (!profile) return;
    getUserRecentGames(profile.uid)
      .then(setRecentGames)
      .catch(() => setRecentGames([]))
      .finally(() => setLoadingGames(false));
  }, [profile]);

  if (!profile) return null;

  const pawn = PAWNS.find(p => p.id === profile.pawnId) ?? PAWNS[0];
  const winRate = profile.stats.gamesPlayed > 0
    ? Math.round((profile.stats.gamesWon / profile.stats.gamesPlayed) * 100)
    : 0;
  const avgNetWorth = profile.stats.gamesPlayed > 0
    ? Math.round(profile.stats.totalNetWorth / profile.stats.gamesPlayed)
    : 0;

  async function handlePawnSelect(pawnId: string) {
    await updatePawn(pawnId);
    setEditingPawn(false);
  }

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.headerLogo}>
          <span style={S.headerEmoji}>🗺️</span>
          <div>
            <div style={S.headerTitle}>MONOVALE</div>
            <div style={S.headerSub}>Monopoly do Vale do Paraíba</div>
          </div>
        </div>
        <div style={S.headerRight}>
          <span style={S.bankerTag}>🏦 Sr. Marinho</span>
          <button onClick={logout} style={S.logoutBtn}>Sair</button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={S.scrollArea}>
        <div style={S.content}>

          {/* ── Profile card ── */}
          <div style={S.profileCard}>
            <div style={S.avatarArea}>
              <div
                style={{ ...S.pawnBubble, background: pawn.bgColor, border: `3px solid ${pawn.color}` }}
                onClick={() => setEditingPawn(!editingPawn)}
                title="Clique para trocar o peão"
              >
                <span style={S.pawnEmoji}>{pawn.emoji}</span>
              </div>
              <div style={{ ...S.pawnBadge, background: pawn.color }}>{pawn.name}</div>
              {editingPawn && (
                <div style={S.pawnPicker}>
                  {PAWNS.map(p => (
                    <button
                      key={p.id}
                      title={p.name}
                      onClick={() => handlePawnSelect(p.id)}
                      style={{
                        ...S.pawnPickerBtn,
                        ...(p.id === profile.pawnId ? { background: p.color } : {}),
                      }}
                    >
                      {p.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={S.profileInfo}>
              <div style={S.profileName}>{profile.displayName}</div>
              <div style={S.profileEmail}>{profile.email}</div>
            </div>
          </div>

          {/* ── Stats grid ── */}
          <div style={S.statsGrid}>
            <StatCard emoji="🎮" label="Partidas" value={profile.stats.gamesPlayed} color="var(--blue)" />
            <StatCard emoji="🏆" label="Vitórias" value={profile.stats.gamesWon} color="var(--gold)" />
            <StatCard emoji="📈" label="Taxa de Vitória" value={`${winRate}%`} color="var(--green)" />
            <StatCard emoji="💀" label="Falências" value={profile.stats.bankruptcies} color="var(--red)" />
            <StatCard emoji="💰" label="Patrimônio Médio" value={`M$ ${avgNetWorth.toLocaleString('pt-BR')}`} color="var(--purple)" />
          </div>

          {/* ── CTA buttons ── */}
          <div style={S.ctaGrid}>
            <button onClick={onCreateRoom} style={S.ctaBtnGreen}>
              🎮 Criar Sala Online
            </button>
            <button onClick={onJoinRoom} style={S.ctaBtnGold}>
              🔑 Entrar numa Sala
            </button>
          </div>
          <button onClick={onStartGame} style={S.ctaBtnLocal}>
            📱 Jogar Local (mesmo dispositivo)
          </button>

          {/* ── Recent games ── */}
          <div style={S.section}>
            <div style={S.sectionTitle}>Partidas Recentes</div>
            {loadingGames ? (
              <div style={S.emptyMsg}>Carregando...</div>
            ) : recentGames.length === 0 ? (
              <div style={S.emptyMsg}>Nenhuma partida registrada ainda. Jogue uma!</div>
            ) : (
              <div style={S.gameList}>
                {recentGames.map(g => {
                  const myRank = g.rankings.find(r => r.uid === profile.uid);
                  return (
                    <div key={g.gameId} style={S.gameRow}>
                      <div style={S.gameDate}>
                        {new Date(g.completedAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div style={S.gamePlayers}>
                        {g.rankings.map(r => r.displayName).join(', ')}
                      </div>
                      {myRank && (
                        <div style={{
                          ...S.gameRankBadge,
                          background: myRank.winner ? 'var(--gold-grad)' : myRank.bankrupt ? 'var(--red-grad)' : 'var(--card-alt)',
                          color: myRank.winner || myRank.bankrupt ? '#fff' : 'var(--text)',
                        }}>
                          {myRank.winner ? '🏆 1º' : myRank.bankrupt ? '💀 Faliu' : `#${myRank.rank}`}
                        </div>
                      )}
                      <div style={S.gameNetWorth}>
                        {myRank ? `M$ ${myRank.netWorth.toLocaleString('pt-BR')}` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ emoji, label, value, color }: { emoji: string; label: string; value: string | number; color: string }) {
  return (
    <div style={S.statCard}>
      <div style={{ ...S.statEmoji, color }}>{emoji}</div>
      <div style={S.statValue}>{value}</div>
      <div style={S.statLabel}>{label}</div>
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
    padding: '0 24px',
    height: 64,
    background: 'var(--gold-grad)',
    boxShadow: '0 4px 0 var(--gold-dark), 0 6px 20px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    flexShrink: 0,
  },
  headerLogo: { display: 'flex', alignItems: 'center', gap: 12 },
  headerEmoji: { fontSize: 40, lineHeight: 1 },
  headerTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 32,
    color: 'var(--text)',
    letterSpacing: '1.5px',
    lineHeight: 1,
    textShadow: '1px 1px 0 rgba(255,255,255,0.4)',
  },
  headerSub: { fontSize: 12, fontWeight: 700, color: 'var(--text)', opacity: 0.65 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  bankerTag: { fontSize: 13, fontWeight: 700, color: 'var(--text)', opacity: 0.7 },
  logoutBtn: {
    padding: '7px 16px',
    background: 'rgba(0,0,0,0.18)',
    color: 'var(--text)',
    border: 'none',
    borderRadius: 99,
    fontFamily: 'var(--font-body)',
    fontWeight: 800,
    fontSize: 12,
    cursor: 'pointer',
    boxShadow: '0 3px 0 rgba(0,0,0,0.15)',
  },

  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '28px 16px 60px',
  },

  content: {
    width: '100%',
    maxWidth: 680,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },

  /* Profile card */
  profileCard: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '3px solid var(--border-gold)',
    boxShadow: 'var(--shadow-lg)',
    padding: '24px 28px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 24,
  },
  avatarArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  pawnBubble: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    transition: 'transform 0.15s',
    flexShrink: 0,
  },
  pawnEmoji: { fontSize: 42 },
  pawnBadge: {
    borderRadius: 99,
    padding: '3px 12px',
    fontSize: 11,
    fontWeight: 800,
    color: '#fff',
    whiteSpace: 'nowrap',
  },
  pawnPicker: {
    position: 'absolute',
    top: 96,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--card)',
    border: '2px solid var(--border-gold)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    padding: 8,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    width: 200,
    zIndex: 100,
    animation: 'pop-in 0.15s ease',
  },
  pawnPickerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: '2px solid var(--border)',
    background: 'var(--card-alt)',
    fontSize: 22,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'all 0.1s',
  },
  profileInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
  },
  profileName: {
    fontFamily: 'var(--font-title)',
    fontSize: 32,
    color: 'var(--text)',
    letterSpacing: '0.5px',
  },
  profileEmail: { fontSize: 13, color: 'var(--text-mid)', fontWeight: 600 },

  /* Stats grid */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: 12,
  },
  statCard: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-md)',
    border: '2px solid var(--border)',
    boxShadow: '0 3px 0 var(--border)',
    padding: '16px 12px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    textAlign: 'center',
  },
  statEmoji: { fontSize: 26, lineHeight: 1 },
  statValue: { fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--text)' },
  statLabel: { fontSize: 11, fontWeight: 800, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.5px' },

  /* CTA */
  ctaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  ctaBtnGreen: {
    padding: '16px 8px',
    background: 'var(--green-grad)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'var(--font-title)',
    fontSize: 18,
    letterSpacing: '0.5px',
    cursor: 'pointer',
    boxShadow: '0 5px 0 var(--green-dark)',
  },
  ctaBtnGold: {
    padding: '16px 8px',
    background: 'var(--gold-grad)',
    color: 'var(--text)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'var(--font-title)',
    fontSize: 18,
    letterSpacing: '0.5px',
    cursor: 'pointer',
    boxShadow: '0 5px 0 var(--gold-dark)',
  },
  ctaBtnLocal: {
    width: '100%',
    padding: '12px',
    background: 'var(--card-alt)',
    color: 'var(--text-mid)',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 3px 0 var(--border)',
  },

  /* Recent games */
  section: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '3px solid var(--border-gold)',
    boxShadow: 'var(--shadow-lg)',
    padding: '20px 24px',
  },
  sectionTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 22,
    color: 'var(--text)',
    marginBottom: 14,
    letterSpacing: '0.5px',
  },
  emptyMsg: { fontSize: 13, color: 'var(--text-mid)', fontWeight: 600, textAlign: 'center', padding: '12px 0' },
  gameList: { display: 'flex', flexDirection: 'column', gap: 8 },
  gameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    background: 'var(--card-alt)',
    borderRadius: 'var(--radius)',
    border: '2px solid var(--border)',
    flexWrap: 'wrap',
  },
  gameDate: { fontSize: 12, color: 'var(--text-mid)', fontWeight: 700, flexShrink: 0, minWidth: 80 },
  gamePlayers: { flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)', minWidth: 120 },
  gameRankBadge: {
    borderRadius: 99,
    padding: '3px 12px',
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
  },
  gameNetWorth: { fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', flexShrink: 0 },
};
