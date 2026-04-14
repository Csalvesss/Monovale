import React, { useEffect, useState } from 'react';
import { LogOut, Trophy, Gamepad2, TrendingUp, Skull, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserRecentGames } from '../services/gameService';
import { PAWNS } from '../data/pawns';
import type { GameResult } from '../types';

interface Props {
  onSelectMonovale: () => void;
  onSelectMercadoDaBola: () => void;
  onSelectValeEmDisputa: () => void;
  hasSavedGame?: boolean;
  onResumeGame?: () => void;
}

interface GameCard {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  gradient: string;
  available: boolean;
}

const GAMES: GameCard[] = [
  {
    id: 'monovale',
    name: 'Monovale',
    tagline: 'Monopoly do Vale do Paraíba',
    description: 'Compre, construa e domine as cidades do Vale. O Banco do Sr. Marinho está esperando.',
    tags: ['Estratégia', 'Multijogador', 'Econômico'],
    gradient: 'linear-gradient(135deg, #065F46 0%, #059669 60%, #34D399 100%)',
    available: true,
  },
  {
    id: 'mercado-da-bola',
    name: 'Lenda da Bola',
    tagline: 'Manager de futebol',
    description: 'Gerencie seu clube, contrate estrelas, dispute o campeonato e encontre cartas lendárias!',
    tags: ['Futebol', 'Estratégia', 'Gerenciamento'],
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #059669 100%)',
    available: true,
  },
  {
    id: 'vale-em-disputa',
    name: 'Vale em Disputa',
    tagline: 'War do Vale do Paraíba',
    description: 'Conquiste as 30 cidades do Vale. Dispute regiões, dispute territórios e cumpra sua missão secreta para vencer. Multijogador online!',
    tags: ['Estratégia', 'Multijogador', 'Conquista'],
    gradient: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
    available: true,
  },
];

export default function GameHub({ onSelectMonovale, onSelectMercadoDaBola, onSelectValeEmDisputa, hasSavedGame, onResumeGame }: Props) {
  const { profile, logout, updatePawn } = useAuth();
  const [recentGames, setRecentGames] = useState<GameResult[]>([]);
  const [editingPawn, setEditingPawn] = useState(false);

  useEffect(() => {
    if (!profile) return;
    getUserRecentGames(profile.uid)
      .then(setRecentGames)
      .catch(() => setRecentGames([]));
  }, [profile]);

  if (!profile) return null;

  const pawn = PAWNS.find(p => p.id === profile.pawnId) ?? PAWNS[0];
  const winRate = profile.stats.gamesPlayed > 0
    ? Math.round((profile.stats.gamesWon / profile.stats.gamesPlayed) * 100)
    : 0;

  function handleSelect(game: GameCard) {
    if (!game.available) return;
    if (game.id === 'monovale') onSelectMonovale();
    if (game.id === 'mercado-da-bola') onSelectMercadoDaBola();
    if (game.id === 'vale-em-disputa') onSelectValeEmDisputa();
  }

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.platformLogo}>
            <span style={S.guavaEmoji}>🍈</span>
            <div style={S.platformName}>Guava Games</div>
          </div>
        </div>
        <div style={S.headerRight}>
          <button
            style={S.userChip}
            onClick={() => setEditingPawn(!editingPawn)}
            title="Trocar peão"
          >
            <span style={{ fontSize: 18 }}>{pawn.emoji}</span>
            <span style={S.userName}>{profile.displayName}</span>
          </button>
          <button onClick={logout} style={S.logoutBtn} title="Sair">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Pawn picker popover */}
      {editingPawn && (
        <div style={S.pawnOverlay} onClick={() => setEditingPawn(false)}>
          <div style={S.pawnPopover} onClick={e => e.stopPropagation()}>
            <p style={S.pawnTitle}>Escolha seu peão</p>
            <div style={S.pawnGrid}>
              {PAWNS.map(p => (
                <button
                  key={p.id}
                  title={p.name}
                  onClick={async () => { await updatePawn(p.id); setEditingPawn(false); }}
                  style={{
                    ...S.pawnBtn,
                    ...(p.id === profile.pawnId ? { border: `2px solid ${p.color}`, background: `${p.color}18` } : {}),
                  }}
                >
                  <span style={{ fontSize: 22 }}>{p.emoji}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-mid)', fontWeight: 600 }}>{p.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={S.body}>
        <div style={S.main}>

          {/* ── Resume saved game ── */}
          {hasSavedGame && onResumeGame && (
            <div style={S.resumeBanner}>
              <div style={S.resumeLeft}>
                <span style={{ fontSize: 28 }}>🏔️</span>
                <div>
                  <div style={S.resumeTitle}>Partida em andamento</div>
                  <div style={S.resumeSub}>Você tem uma partida salva de Monovale</div>
                </div>
              </div>
              <button style={S.resumeBtn} onClick={onResumeGame}>▶ Retomar</button>
            </div>
          )}

          {/* ── Games library ── */}
          <section style={S.section}>
            <div style={S.sectionHeader}>
              <Gamepad2 size={18} color="var(--green)" />
              <h2 style={S.sectionTitle}>Biblioteca de Jogos</h2>
            </div>
            <div style={S.gamesGrid}>
              {GAMES.map(game => (
                <div
                  key={game.id}
                  style={{
                    ...S.gameCard,
                    ...(game.available ? S.gameCardAvailable : S.gameCardLocked),
                  }}
                  onClick={() => handleSelect(game)}
                >
                  {/* Banner art */}
                  <div style={{ ...S.gameBanner, background: game.gradient }}>
                    {game.id === 'monovale' ? (
                      <div style={S.bannerInner}>
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                          <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.15"/>
                          <path d="M8 28L14 16L20 22L26 12L32 28H8Z" fill="white" fillOpacity="0.9"/>
                        </svg>
                        <span style={S.bannerGameName}>Monovale</span>
                      </div>
                    ) : game.id === 'mercado-da-bola' ? (
                      <div style={S.bannerInner}>
                        <span style={{ fontSize: 48 }}>⚽</span>
                        <span style={S.bannerGameName}>Lenda da Bola</span>
                      </div>
                    ) : game.id === 'vale-em-disputa' ? (
                      <div style={S.bannerInner}>
                        <span style={{ fontSize: 48 }}>🗺️</span>
                        <span style={S.bannerGameName}>Vale em Disputa</span>
                      </div>
                    ) : (
                      <div style={S.bannerInner}>
                        <span style={{ fontSize: 32, opacity: 0.5 }}>🎮</span>
                        <span style={{ ...S.bannerGameName, opacity: 0.6 }}>Em Breve</span>
                      </div>
                    )}
                    {!game.available && (
                      <div style={S.lockedBadge}>EM BREVE</div>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={S.cardBody}>
                    <div style={S.cardTitle}>{game.available ? game.name : '???'}</div>
                    <div style={S.cardTagline}>{game.tagline}</div>
                    <div style={S.tagsRow}>
                      {game.tags.map(tag => (
                        <span key={tag} style={S.tag}>{tag}</span>
                      ))}
                    </div>
                    {game.available && (
                      <button style={S.playBtn} onClick={() => handleSelect(game)}>
                        ▶ JOGAR
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Profile & Stats ── */}
          <section style={S.section}>
            <div style={S.sectionHeader}>
              <Trophy size={18} color="#D97706" />
              <h2 style={S.sectionTitle}>Meu Perfil</h2>
            </div>
            <div style={S.profileRow}>
              <div style={{ ...S.avatarCircle, background: `linear-gradient(135deg, ${pawn.color}cc, ${pawn.color})` }}>
                <span style={{ fontSize: 28 }}>{pawn.emoji}</span>
              </div>
              <div>
                <div style={S.profileName}>{profile.displayName}</div>
                <div style={S.profileEmail}>{profile.email}</div>
              </div>
            </div>
            <div style={S.statsGrid}>
              <StatPill icon={<Gamepad2 size={14}/>} label="Partidas" value={profile.stats.gamesPlayed} color="#3B82F6"/>
              <StatPill icon={<Trophy size={14}/>} label="Vitórias" value={profile.stats.gamesWon} color="#D97706"/>
              <StatPill icon={<TrendingUp size={14}/>} label="Win Rate" value={`${winRate}%`} color="#B5294E"/>
              <StatPill icon={<Skull size={14}/>} label="Falências" value={profile.stats.bankruptcies} color="#DC2626"/>
              <StatPill icon={<DollarSign size={14}/>} label="Patrimônio méd." value={`M$${profile.stats.gamesPlayed > 0 ? Math.round(profile.stats.totalNetWorth / profile.stats.gamesPlayed).toLocaleString('pt-BR') : 0}`} color="#7C3AED"/>
            </div>
          </section>

          {/* ── Recent games ── */}
          {recentGames.length > 0 && (
            <section style={S.section}>
              <div style={S.sectionHeader}>
                <TrendingUp size={18} color="#6366F1" />
                <h2 style={S.sectionTitle}>Partidas Recentes</h2>
              </div>
              <div style={S.recentList}>
                {recentGames.slice(0, 5).map(g => {
                  const myRank = g.rankings.find(r => r.uid === profile.uid);
                  return (
                    <div key={g.gameId} style={S.recentRow}>
                      <div style={S.recentGame}>
                        <span style={S.recentGameIcon}>🏔️</span>
                        <div>
                          <div style={S.recentPlayers}>{g.rankings.map(r => r.displayName).join(' · ')}</div>
                          <div style={S.recentDate}>{new Date(g.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                      {myRank && (
                        <span style={{
                          ...S.rankBadge,
                          background: myRank.winner ? '#D97706' : myRank.bankrupt ? '#DC2626' : 'var(--border)',
                          color: myRank.winner || myRank.bankrupt ? '#fff' : 'var(--text-mid)',
                        }}>
                          {myRank.winner ? '1º lugar' : myRank.bankrupt ? 'Faliu' : `${myRank.rank}º`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div style={S.statPill}>
      <div style={{ color, display: 'flex', alignItems: 'center' }}>{icon}</div>
      <div style={S.statValue}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' },

  header: {
    height: 60, flexShrink: 0,
    background: 'linear-gradient(90deg, #2D0A15, #8B1A33)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px',
    boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
    position: 'sticky', top: 0, zIndex: 50,
  },
  headerLeft: { display: 'flex', alignItems: 'center' },
  platformLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  guavaEmoji: { fontSize: 26, lineHeight: 1 },
  platformName: { fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.2px', lineHeight: 1.1 },

  headerRight: { display: 'flex', alignItems: 'center', gap: 8 },
  userChip: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 99,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  userName: { fontSize: 13, fontWeight: 700, color: '#fff' },
  logoutBtn: {
    width: 34, height: 34,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    flexShrink: 0,
    padding: 0,
  },

  pawnOverlay: { position: 'fixed', inset: 0, zIndex: 200 },
  pawnPopover: {
    position: 'fixed', top: 68, right: 20, zIndex: 201,
    background: 'var(--card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-lg)',
    padding: 16, width: 260,
    animation: 'pop-in 0.15s ease',
  },
  pawnTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' },
  pawnGrid: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  pawnBtn: {
    width: 52, height: 52, borderRadius: 10,
    border: '1.5px solid var(--border)',
    background: 'var(--card-alt)',
    cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 2, padding: 4,
  },

  body: { flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '24px 16px 60px' },
  main: { width: '100%', maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 24 },

  section: { display: 'flex', flexDirection: 'column', gap: 14 },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8 },
  sectionTitle: { fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.2px' },

  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 16,
  },
  gameCard: {
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow)',
    background: 'var(--card)',
    display: 'flex', flexDirection: 'column',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  gameCardAvailable: {
    cursor: 'pointer',
  },
  gameCardLocked: {
    opacity: 0.65,
    cursor: 'default',
  },
  gameBanner: {
    height: 130, position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  bannerInner: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  },
  bannerGameName: {
    fontFamily: 'var(--font-title)',
    fontSize: 20, fontWeight: 900,
    color: '#fff',
    textShadow: '0 1px 4px rgba(0,0,0,0.3)',
    letterSpacing: '-0.2px',
  },
  lockedBadge: {
    position: 'absolute', top: 10, right: 10,
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: 9, fontWeight: 800,
    letterSpacing: '1px',
    padding: '3px 8px',
    borderRadius: 99,
    backdropFilter: 'blur(4px)',
  },
  cardBody: { padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  cardTitle: { fontFamily: 'var(--font-title)', fontSize: 16, fontWeight: 800, color: 'var(--text)' },
  cardTagline: { fontSize: 12, color: 'var(--text-mid)', fontWeight: 500, lineHeight: 1.4 },
  tagsRow: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  tag: {
    fontSize: 10, fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 99,
    background: 'var(--card-alt)',
    border: '1px solid var(--border)',
    color: 'var(--text-mid)',
  },
  playBtn: {
    marginTop: 8,
    padding: '10px',
    background: 'linear-gradient(135deg, #B5294E, #8B1A33)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-title)',
    fontSize: 13, fontWeight: 800,
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(139,26,51,0.35)',
  },

  profileRow: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' },
  avatarCircle: {
    width: 56, height: 56, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    boxShadow: 'var(--shadow-md)',
  },
  profileName: { fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 2 },
  profileEmail: { fontSize: 12, color: 'var(--text-mid)', fontWeight: 500 },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 },
  statPill: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '14px 12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textAlign: 'center',
    boxShadow: 'var(--shadow-sm)',
  },
  statValue: { fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1 },
  statLabel: { fontSize: 10, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.4px' },

  recentList: { display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '8px 4px' },
  recentRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--radius)' },
  recentGame: { display: 'flex', alignItems: 'center', gap: 10 },
  recentGameIcon: { fontSize: 20 },
  recentPlayers: { fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 1 },
  recentDate: { fontSize: 11, color: 'var(--text-light)', fontWeight: 500 },
  rankBadge: { padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, flexShrink: 0 },

  resumeBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, padding: '16px 20px',
    background: 'linear-gradient(90deg, #065F46, #059669)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
  },
  resumeLeft: { display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 },
  resumeTitle: { fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 2 },
  resumeSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 },
  resumeBtn: {
    flexShrink: 0, padding: '10px 20px',
    background: '#fff', color: '#065F46',
    border: 'none', borderRadius: 'var(--radius)',
    fontSize: 13, fontWeight: 800,
    cursor: 'pointer', fontFamily: 'var(--font-body)',
    boxShadow: '0 2px 0 rgba(0,0,0,0.1)',
  },
};
