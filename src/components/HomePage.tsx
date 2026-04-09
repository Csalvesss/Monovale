import React, { useEffect, useState } from 'react';
import { Trophy, Gamepad2, TrendingUp, Skull, DollarSign, LogOut, ChevronRight, Plus, Key } from 'lucide-react';
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
  const initials = profile.displayName.slice(0, 2).toUpperCase();

  async function handlePawnSelect(pawnId: string) {
    await updatePawn(pawnId);
    setEditingPawn(false);
  }

  return (
    <div style={S.page}>
      {/* ── Top bar ── */}
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.headerLogo}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="white" fillOpacity="0.2"/>
              <path d="M5 20L10 11L14 16L18 8L23 20H5Z" fill="white" fillOpacity="0.95"/>
            </svg>
            <span style={S.headerName}>Monovale</span>
          </div>
        </div>
        <div style={S.headerRight}>
          <span style={S.headerBanker}>Banco do Sr. Marinho</span>
          <button onClick={logout} style={S.logoutBtn}>
            <LogOut size={15} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <div style={S.scrollArea}>
        <div style={S.content}>

          {/* ── Profile ── */}
          <div style={S.profileCard}>
            <div style={S.avatarGroup}>
              <button
                style={{ ...S.avatar, background: `linear-gradient(135deg, ${pawn.color}cc, ${pawn.color})` }}
                onClick={() => setEditingPawn(!editingPawn)}
                title="Trocar peão"
              >
                <span style={{ fontSize: 28 }}>{pawn.emoji}</span>
                <div style={S.avatarEdit}>✏️</div>
              </button>
              {editingPawn && (
                <div style={S.pawnPopover}>
                  <p style={S.pawnPopoverTitle}>Escolha seu peão</p>
                  <div style={S.pawnGrid}>
                    {PAWNS.map(p => (
                      <button
                        key={p.id}
                        title={p.name}
                        onClick={() => handlePawnSelect(p.id)}
                        style={{
                          ...S.pawnPickBtn,
                          ...(p.id === profile.pawnId ? { border: `2px solid ${p.color}`, background: `${p.color}18` } : {}),
                        }}
                      >
                        <span style={{ fontSize: 22 }}>{p.emoji}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-mid)', fontWeight: 600 }}>{p.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={S.profileText}>
              <div style={S.profileName}>{profile.displayName}</div>
              <div style={S.profileEmail}>{profile.email}</div>
              <div style={{ ...S.pawnBadge, color: pawn.color, background: `${pawn.color}15`, border: `1px solid ${pawn.color}30` }}>
                {pawn.name}
              </div>
            </div>
            {/* Avatar initials fallback shown in background */}
            <div style={{ ...S.initialsDecor, color: `${pawn.color}20` }}>{initials}</div>
          </div>

          {/* ── Stats ── */}
          <div style={S.statsGrid}>
            <StatCard icon={<Gamepad2 size={20} />} label="Partidas" value={profile.stats.gamesPlayed} color="#3B82F6" />
            <StatCard icon={<Trophy size={20} />} label="Vitórias" value={profile.stats.gamesWon} color="#D97706" />
            <StatCard icon={<TrendingUp size={20} />} label="Taxa de vitória" value={`${winRate}%`} color="#059669" />
            <StatCard icon={<Skull size={20} />} label="Falências" value={profile.stats.bankruptcies} color="#DC2626" />
            <StatCard icon={<DollarSign size={20} />} label="Patrimônio médio" value={`M$${avgNetWorth.toLocaleString('pt-BR')}`} color="#7C3AED" />
          </div>

          {/* ── Play buttons ── */}
          <div style={S.playSection}>
            <div style={S.playGrid}>
              <button onClick={onCreateRoom} style={S.btnPrimary}>
                <Plus size={18} strokeWidth={2.5} />
                <span>Criar Sala Online</span>
              </button>
              <button onClick={onJoinRoom} style={S.btnSecondary}>
                <Key size={18} strokeWidth={2.5} />
                <span>Entrar numa Sala</span>
              </button>
            </div>
            <button onClick={onStartGame} style={S.btnGhost}>
              Jogar local (mesmo dispositivo)
              <ChevronRight size={14} />
            </button>
          </div>

          {/* ── Recent games ── */}
          <div style={S.section}>
            <h3 style={S.sectionTitle}>Partidas recentes</h3>
            {loadingGames ? (
              <div style={S.emptyState}>Carregando...</div>
            ) : recentGames.length === 0 ? (
              <div style={S.emptyState}>Nenhuma partida registrada. Jogue uma!</div>
            ) : (
              <div style={S.gameList}>
                {recentGames.map(g => {
                  const myRank = g.rankings.find(r => r.uid === profile.uid);
                  return (
                    <div key={g.gameId} style={S.gameRow}>
                      <div>
                        <div style={S.gamePlayers}>
                          {g.rankings.map(r => r.displayName).join(' · ')}
                        </div>
                        <div style={S.gameDate}>
                          {new Date(g.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={S.gameRight}>
                        {myRank && (
                          <span style={{
                            ...S.rankBadge,
                            background: myRank.winner ? '#D97706' : myRank.bankrupt ? '#DC2626' : 'var(--border)',
                            color: myRank.winner || myRank.bankrupt ? '#fff' : 'var(--text-mid)',
                          }}>
                            {myRank.winner ? '1º lugar' : myRank.bankrupt ? 'Faliu' : `${myRank.rank}º`}
                          </span>
                        )}
                        {myRank && (
                          <span style={S.gameNetWorth}>M${myRank.netWorth.toLocaleString('pt-BR')}</span>
                        )}
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div style={S.statCard}>
      <div style={{ ...S.statIcon, color, background: `${color}12` }}>{icon}</div>
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
    height: 60,
    background: 'linear-gradient(135deg, #065F46, #047857)',
    flexShrink: 0,
    boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
  },
  headerLeft: { display: 'flex', alignItems: 'center' },
  headerLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  headerName: { fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  headerBanker: { fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', display: 'none' as const },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 99,
    fontSize: 13, fontWeight: 600, color: '#fff',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },

  scrollArea: {
    flex: 1, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '28px 16px 60px',
  },
  content: { width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 },

  /* Profile card */
  profileCard: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  initialsDecor: {
    position: 'absolute', right: -10, top: '50%',
    transform: 'translateY(-50%)',
    fontFamily: 'var(--font-title)',
    fontSize: 120,
    fontWeight: 900,
    lineHeight: 1,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  avatarGroup: { position: 'relative' as const, flexShrink: 0 },
  avatar: {
    width: 72, height: 72,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    boxShadow: 'var(--shadow-md)',
    position: 'relative',
    flexShrink: 0,
  },
  avatarEdit: {
    position: 'absolute', bottom: 0, right: 0,
    width: 22, height: 22,
    background: 'var(--card)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border)',
  },
  pawnPopover: {
    position: 'absolute', top: 80, left: 0, zIndex: 100,
    background: 'var(--card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-lg)',
    padding: 16,
    width: 260,
    animation: 'pop-in 0.15s ease',
  },
  pawnPopoverTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' },
  pawnGrid: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  pawnPickBtn: {
    width: 52, height: 52,
    borderRadius: 10,
    border: '1.5px solid var(--border)',
    background: 'var(--card-alt)',
    cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 2, padding: 4,
    transition: 'all 0.1s',
  },
  profileText: { flex: 1, minWidth: 0, position: 'relative', zIndex: 1 },
  profileName: { fontFamily: 'var(--font-title)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 2, letterSpacing: '-0.2px' },
  profileEmail: { fontSize: 13, color: 'var(--text-mid)', fontWeight: 500, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  pawnBadge: { display: 'inline-flex', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 },

  /* Stats */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(108px, 1fr))',
    gap: 10,
  },
  statCard: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    padding: '16px 12px 14px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    textAlign: 'center',
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1 },
  statLabel: { fontSize: 10, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.3 },

  /* Play */
  playSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  playGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  btnPrimary: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px 16px',
    background: 'var(--green-grad)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'var(--font-body)',
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
    letterSpacing: '0.1px',
  },
  btnSecondary: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px 16px',
    background: 'var(--card)',
    color: 'var(--gold)',
    border: '1.5px solid var(--gold)',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'var(--font-body)',
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.1px',
  },
  btnGhost: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    padding: '11px',
    background: 'transparent',
    color: 'var(--text-mid)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-body)',
    fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
  },

  /* Recent games */
  section: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    padding: '20px',
  },
  sectionTitle: { fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '0 0 14px', letterSpacing: '-0.2px' },
  emptyState: { fontSize: 13, color: 'var(--text-light)', fontWeight: 500, textAlign: 'center', padding: '12px 0' },
  gameList: { display: 'flex', flexDirection: 'column', gap: 2 },
  gameRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: 'var(--radius)',
    transition: 'background 0.1s',
  },
  gamePlayers: { fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 },
  gameDate: { fontSize: 12, color: 'var(--text-light)', fontWeight: 500 },
  gameRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  rankBadge: { padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 },
  gameNetWorth: { fontSize: 12, fontWeight: 700, color: 'var(--text-mid)' },
};
