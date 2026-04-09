import React from 'react';
import {
  Trophy, Users, ShoppingBag, DollarSign,
  ChevronRight, Play, Zap, TrendingUp,
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSquadStore } from '../../store/squadStore';
import { TEAMS, getTeamsByGroup } from '../../data/initialData';
import type { LDBScreen } from '../../types/game';

interface Props { onNavigate: (s: LDBScreen) => void }

// Form dots derived from totals (last 5 simulated matches)
function FormDots({ wins, draws, losses }: { wins: number; draws: number; losses: number }) {
  const played = wins + draws + losses;
  if (played === 0) return null;
  // Build a plausible recent-5 slice (newest last)
  const form: ('W' | 'D' | 'L')[] = [];
  for (let i = 0; i < Math.min(wins, 3); i++) form.push('W');
  for (let i = 0; i < Math.min(draws, 1); i++) form.push('D');
  for (let i = 0; i < Math.min(losses, 1); i++) form.push('L');
  const slice = form.slice(-5);
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {slice.map((r, i) => (
        <div key={i} style={{
          width: 20, height: 20, borderRadius: '50%',
          background: r === 'W' ? '#22c55e' : r === 'D' ? '#fbbf24' : '#ef4444',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 900, color: '#000', letterSpacing: 0,
        }}>
          {r}
        </div>
      ))}
    </div>
  );
}

export default function HomeScreen({ onNavigate }: Props) {
  const { currentSeason, currentWeek, matchRecord, budget, userTeamId, nextOpponentId } = useGameStore();
  const { lineup } = useSquadStore();

  const userTeam     = TEAMS.find(t => t.id === (userTeamId ?? 'brazil')) ?? TEAMS[0];
  const nextOpponent = TEAMS.find(t => t.id === nextOpponentId) ?? TEAMS[1];
  const groupTeams   = getTeamsByGroup(userTeam.group ?? 'A');

  const played    = matchRecord.wins + matchRecord.draws + matchRecord.losses;
  const budgetStr = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(budget);
  const saldo     = matchRecord.goalsFor - matchRecord.goalsAgainst;

  // Opponent difficulty color
  const diff = nextOpponent.reputation;
  const diffColor = diff >= 85 ? '#ef4444' : diff >= 70 ? '#f97316' : '#22c55e';
  const diffLabel = diff >= 85 ? 'DIFÍCIL' : diff >= 70 ? 'MÉDIO' : 'FÁCIL';

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-void)', paddingBottom: 24 }}>

      {/* ═══════════════ HERO ═══════════════ */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #020617 0%, #071428 40%, #0c1f3a 70%, #0a0f20 100%)',
        paddingBottom: 36,
      }}>
        {/* Pitch SVG background */}
        <svg viewBox="0 0 500 440" preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.09 }}>
          <circle cx="250" cy="460" r="200" fill="none" stroke="white" strokeWidth="1.2" />
          <circle cx="250" cy="460" r="130" fill="none" stroke="white" strokeWidth="0.8" />
          <circle cx="250" cy="460" r="60"  fill="none" stroke="white" strokeWidth="0.6" />
          <line x1="0" y1="260" x2="500" y2="260" stroke="white" strokeWidth="0.8" />
          <rect x="140" y="260" width="220" height="80" fill="none" stroke="white" strokeWidth="0.8" />
          <rect x="190" y="260" width="120" height="40" fill="none" stroke="white" strokeWidth="0.6" />
          <circle cx="250" cy="220" r="65" fill="none" stroke="white" strokeWidth="0.8" />
        </svg>

        {/* Radial gold glow from bottom center */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(251,191,36,0.14) 0%, transparent 70%)',
        }} />
        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(to bottom, transparent, var(--bg-void))',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', padding: '28px 20px 0',
          gap: 0,
        }}>
          {/* Season badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: 'var(--r-pill)',
            padding: '5px 14px',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 15 }}>{userTeam.badge}</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--wc-gold)',
            }}>
              {userTeam.name.toUpperCase()} · T{currentSeason} · SEM {currentWeek}
            </span>
          </div>

          {/* Title */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(46px,13vw,80px)',
            letterSpacing: '0.06em',
            color: '#f8fafc',
            lineHeight: 0.9,
            textAlign: 'center',
            textShadow: '0 0 80px rgba(251,191,36,0.2)',
            marginBottom: 18,
          }}>
            LENDA<br />DA BOLA
          </div>

          {/* Form dots */}
          <div style={{ marginBottom: 28 }}>
            <FormDots wins={matchRecord.wins} draws={matchRecord.draws} losses={matchRecord.losses} />
          </div>

          {/* ── VS CARD ── */}
          <div style={{
            width: '100%', maxWidth: 400,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(251,191,36,0.22)',
            borderRadius: 'var(--r-lg)',
            padding: '20px 16px 0',
            backdropFilter: 'blur(8px)',
          }}>
            {/* Match label */}
            <div style={{
              textAlign: 'center', marginBottom: 16,
              fontSize: 9, fontWeight: 800, letterSpacing: '0.18em',
              color: 'var(--text-muted)',
            }}>
              PRÓXIMA PARTIDA — SEMANA {currentWeek}
            </div>

            {/* Teams row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              {/* Home team */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(251,191,36,0.08)',
                  border: '2px solid rgba(251,191,36,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40,
                  boxShadow: '0 0 24px rgba(251,191,36,0.18)',
                }}>
                  {userTeam.badge}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.05em', color: 'var(--wc-gold)' }}>
                  {userTeam.shortName}
                </div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(251,191,36,0.55)' }}>
                  CASA
                </div>
              </div>

              {/* VS block */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 42, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)',
                  lineHeight: 1,
                }}>VS</div>
                <div style={{
                  padding: '3px 8px',
                  background: `${diffColor}22`,
                  border: `1px solid ${diffColor}55`,
                  borderRadius: 'var(--r-pill)',
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
                  color: diffColor,
                }}>
                  {diffLabel}
                </div>
              </div>

              {/* Away team */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1.5px solid rgba(255,255,255,0.14)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40,
                }}>
                  {nextOpponent.badge}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                  {nextOpponent.shortName}
                </div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
                  VISITANTE
                </div>
              </div>
            </div>

            {/* Play button */}
            <button
              onClick={() => onNavigate('match')}
              className="lenda-btn-gold"
              style={{
                width: 'calc(100% + 32px)',
                marginLeft: -16, marginTop: 20,
                padding: '16px',
                fontSize: 18, letterSpacing: '0.1em',
                borderRadius: '0 0 var(--r-lg) var(--r-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              <Play size={18} fill="currentColor" />
              JOGAR AGORA
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ STATS ═══════════════ */}
      <div style={{ padding: '20px 12px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>

        {/* Pontos NIG */}
        <div className="lenda-card" style={{
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(30,41,59,1) 70%)',
          border: '1px solid rgba(251,191,36,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Trophy size={14} style={{ color: 'var(--wc-gold)' }} />
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
              PONTOS NIG
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--wc-gold)', lineHeight: 1 }}>
            {matchRecord.totalMatchPoints}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            acumulados na temporada
          </div>
        </div>

        {/* Campeonato record */}
        <div className="lenda-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <TrendingUp size={14} style={{ color: '#60a5fa' }} />
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
              CAMPEONATO
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#22c55e', lineHeight: 1 }}>
                {matchRecord.wins}
              </div>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', color: '#22c55e88', marginTop: 2 }}>V</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--wc-gold)', lineHeight: 1 }}>
                {matchRecord.draws}
              </div>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(251,191,36,0.5)', marginTop: 2 }}>E</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#ef4444', lineHeight: 1 }}>
                {matchRecord.losses}
              </div>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', color: '#ef444488', marginTop: 2 }}>D</div>
            </div>
          </div>
        </div>

        {/* Elenco */}
        <div className="lenda-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Users size={14} style={{ color: '#a78bfa' }} />
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
              TITULARES
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: lineup.length === 11 ? '#22c55e' : 'var(--text-primary)', lineHeight: 1 }}>
              {lineup.length}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-muted)', lineHeight: 1 }}>/11</div>
          </div>
          <div style={{ marginTop: 6, height: 4, borderRadius: 9999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 9999,
              width: `${(lineup.length / 11) * 100}%`,
              background: lineup.length === 11 ? '#22c55e' : '#a78bfa',
              transition: 'width 0.6s var(--ease-out)',
            }} />
          </div>
        </div>

        {/* Budget */}
        <div className="lenda-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <DollarSign size={14} style={{ color: '#34d399' }} />
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
              ORÇAMENTO
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: '#34d399', lineHeight: 1 }}>
            €{budgetStr}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            Saldo de gols: {saldo >= 0 ? '+' : ''}{saldo}
          </div>
        </div>
      </div>

      {/* ═══════════════ GRUPO ═══════════════ */}
      <div style={{ padding: '20px 12px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.07em', color: 'var(--text-primary)' }}>
            GRUPO {userTeam.group}
          </div>
          <button
            onClick={() => onNavigate('standings')}
            style={{
              background: 'none', border: 'none',
              color: 'var(--wc-gold)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-body)',
            }}
          >
            Ver tabela <ChevronRight size={13} />
          </button>
        </div>

        <div className="lenda-card" style={{ overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '20px 1fr 28px 28px 28px 36px',
            padding: '8px 14px', borderBottom: '1px solid var(--border-default)',
            gap: 4,
          }}>
            {['#', 'TIME', 'J', 'V', 'E', 'PTS'].map(h => (
              <div key={h} style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '0.15em',
                color: 'var(--text-muted)', textAlign: h === 'TIME' ? 'left' : 'center',
              }}>{h}</div>
            ))}
          </div>

          {groupTeams.map((team, idx) => {
            const isUser = team.id === (userTeamId ?? 'brazil');
            const p   = isUser ? played : Math.max(0, 3 - idx);
            const w   = isUser ? matchRecord.wins  : Math.max(0, 2 - idx);
            const d   = isUser ? matchRecord.draws : (idx === 1 ? 1 : 0);
            const pts = w * 3 + d;
            const inQualZone = idx < 2;

            return (
              <div key={team.id} style={{
                display: 'grid', gridTemplateColumns: '20px 1fr 28px 28px 28px 36px',
                padding: '11px 14px',
                gap: 4,
                background: isUser
                  ? 'rgba(251,191,36,0.07)'
                  : inQualZone
                    ? 'rgba(34,197,94,0.03)'
                    : 'transparent',
                borderBottom: idx < groupTeams.length - 1 ? '1px solid var(--border-default)' : 'none',
                position: 'relative',
              }}>
                {/* Qual zone left bar */}
                {inQualZone && (
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                    background: '#22c55e', opacity: 0.5,
                  }} />
                )}

                {/* Position */}
                <div style={{
                  fontSize: 12, fontWeight: 800, textAlign: 'center',
                  color: isUser ? 'var(--wc-gold)' : inQualZone ? '#22c55e' : 'var(--text-muted)',
                  fontFamily: 'var(--font-display)',
                }}>
                  {idx + 1}
                </div>

                {/* Team name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 15 }}>{team.badge}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: isUser ? 'var(--wc-gold)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
                  }}>
                    {team.shortName}
                  </span>
                  {isUser && (
                    <span style={{
                      fontSize: 8, fontWeight: 800, letterSpacing: '0.1em',
                      color: 'rgba(251,191,36,0.5)', padding: '1px 5px',
                      border: '1px solid rgba(251,191,36,0.2)', borderRadius: 4,
                    }}>
                      VOCÊ
                    </span>
                  )}
                </div>

                {/* Stats */}
                {[p, w, d].map((val, i) => (
                  <div key={i} style={{
                    textAlign: 'center', fontSize: 12,
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)', fontWeight: 600,
                  }}>
                    {val}
                  </div>
                ))}

                {/* Points */}
                <div style={{
                  textAlign: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  color: isUser ? 'var(--wc-gold)' : inQualZone ? '#22c55e' : 'var(--text-primary)',
                  fontWeight: 800,
                }}>
                  {pts}
                </div>
              </div>
            );
          })}

          {/* Qual zone legend */}
          <div style={{
            padding: '7px 14px',
            display: 'flex', alignItems: 'center', gap: 6,
            borderTop: '1px solid var(--border-default)',
          }}>
            <div style={{ width: 10, height: 4, borderRadius: 9999, background: '#22c55e', opacity: 0.6 }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              ZONA DE CLASSIFICAÇÃO
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════ AÇÕES RÁPIDAS ═══════════════ */}
      <div style={{ padding: '20px 12px 0' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.07em',
          color: 'var(--text-primary)', marginBottom: 12,
        }}>
          AÇÕES RÁPIDAS
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { id: 'squad'   as LDBScreen, icon: <Users size={20} />,      label: 'Seleção',    sub: `${lineup.length}/11`,  color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
            { id: 'market'  as LDBScreen, icon: <ShoppingBag size={20} />, label: 'Mercado',    sub: 'Cartas',               color: '#60a5fa', bg: 'rgba(96,165,250,0.08)'  },
            { id: 'sponsor' as LDBScreen, icon: <Zap size={20} />,         label: 'Patrocínio', sub: 'Bônus',                color: '#34d399', bg: 'rgba(52,211,153,0.08)'  },
          ].map(({ id, icon, label, sub, color, bg }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                background: bg,
                border: `1px solid ${color}33`,
                borderRadius: 'var(--r-lg)',
                padding: '16px 10px',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${color}22`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              <div style={{ color }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                {label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
