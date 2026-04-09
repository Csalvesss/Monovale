import React from 'react';
import { Trophy, Users, Star, TrendingUp, ChevronRight, Play } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSquadStore } from '../../store/squadStore';
import { TEAMS, getTeamsByGroup } from '../../data/initialData';
import type { LDBScreen } from '../../types/game';

interface Props {
  onNavigate: (screen: LDBScreen) => void;
}

function StatCard({ icon, label, value, color, delay = 0 }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; delay?: number;
}) {
  return (
    <div
      className="lenda-card lenda-anim-fade-up"
      style={{ flex: 1, padding: '14px 10px', textAlign: 'center', animationDelay: `${delay}ms` }}
    >
      <div style={{ color, display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{icon}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,5vw,26px)',
        letterSpacing: '0.03em', color: 'var(--text-primary)', lineHeight: 1,
      }}>
        {value}
      </div>
      <div className="lenda-label" style={{ marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function HomeScreen({ onNavigate }: Props) {
  const { currentSeason, currentWeek, matchRecord, budget, userTeamId, nextOpponentId } = useGameStore();
  const { lineup } = useSquadStore();

  const userTeam     = TEAMS.find(t => t.id === (userTeamId ?? 'brazil')) ?? TEAMS[0];
  const nextOpponent = TEAMS.find(t => t.id === nextOpponentId) ?? TEAMS[1];
  const groupTeams   = getTeamsByGroup(userTeam.group ?? 'A');
  const played       = matchRecord.wins + matchRecord.draws + matchRecord.losses;
  const points       = matchRecord.wins * 3 + matchRecord.draws;
  const budgetStr    = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(budget);

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-void)' }}>

      {/* ── Hero ── */}
      <div style={{
        position: 'relative',
        height: 280,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #020617 0%, #0a1628 35%, #0d2240 65%, #1a0a2e 100%)',
        flexShrink: 0,
      }}>
        {/* Decorative pitch lines */}
        <svg
          viewBox="0 0 400 280"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}
        >
          <circle cx="200" cy="280" r="140" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="200" cy="280" r="90"  fill="none" stroke="white" strokeWidth="0.7" />
          <line x1="0" y1="180" x2="400" y2="180" stroke="white" strokeWidth="0.7" />
          <rect x="120" y="180" width="160" height="60" fill="none" stroke="white" strokeWidth="0.7" />
          <rect x="160" y="180" width="80"  height="28" fill="none" stroke="white" strokeWidth="0.7" />
        </svg>

        {/* Gold glow radial */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(251,191,36,0.15) 0%, transparent 70%)',
        }} />

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(to bottom, transparent, var(--bg-void))',
        }} />

        {/* Content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 20px',
        }}>
          {/* Badge */}
          <div className="lenda-anim-fade-up" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: 'var(--r-pill)',
            padding: '4px 14px',
          }}>
            <span>{userTeam.badge}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.12em', color: 'var(--wc-gold)' }}>
              {userTeam.name.toUpperCase()} · TEMPORADA {currentSeason}
            </span>
          </div>

          {/* Title */}
          <div className="lenda-anim-fade-up" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(42px, 12vw, 72px)',
            letterSpacing: '0.07em',
            color: 'var(--text-primary)',
            lineHeight: 0.95,
            textAlign: 'center',
            textShadow: '0 0 60px rgba(251,191,36,0.25)',
            animationDelay: '80ms',
          }}>
            LENDA<br />DA BOLA
          </div>

          {/* Play button */}
          <button
            onClick={() => onNavigate('match')}
            className="lenda-anim-pop-in"
            style={{
              marginTop: 6,
              width: 56, height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--wc-gold), var(--wc-gold-dark))',
              border: '2px solid rgba(251,191,36,0.4)',
              color: '#000',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 28px rgba(251,191,36,0.5), 0 4px 16px rgba(0,0,0,0.5)',
              animationDelay: '200ms',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            <Play size={20} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ padding: '16px 12px 0', display: 'flex', gap: 8 }}>
        <StatCard icon={<Trophy size={16} />}     label="Pontos"    value={points}        color="var(--wc-gold)" delay={0}   />
        <StatCard icon={<Users size={16} />}      label="Titulares" value={`${lineup.length}/11`} color="#60a5fa"  delay={60}  />
        <StatCard icon={<Star size={16} />}       label="Vitórias"  value={matchRecord.wins}      color="#22c55e" delay={120} />
        <StatCard icon={<TrendingUp size={16} />} label="Orçamento" value={`€${budgetStr}`}        color="#a78bfa" delay={180} />
      </div>

      {/* ── Próxima Partida ── */}
      <div style={{ padding: '16px 12px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em',
            color: 'var(--text-primary)',
          }}>
            PRÓXIMA PARTIDA
          </div>
          <div className="lenda-label" style={{ color: 'var(--wc-gold)' }}>Semana {currentWeek}</div>
        </div>

        <div
          className="lenda-card"
          onClick={() => onNavigate('match')}
          style={{
            padding: '20px 16px', cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(30,41,59,1), rgba(51,65,85,0.8))',
            border: '1px solid rgba(251,191,36,0.2)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(251,191,36,0.5)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(251,191,36,0.1)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(251,191,36,0.2)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Home */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(251,191,36,0.1)', border: '1.5px solid rgba(251,191,36,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32,
              }}>
                {userTeam.badge}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.05em', color: 'var(--wc-gold)' }}>
                {userTeam.shortName}
              </div>
              <div className="lenda-label" style={{ color: 'var(--wc-gold)' }}>CASA</div>
            </div>

            {/* VS */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: '0.1em',
                color: 'var(--text-muted)', lineHeight: 1,
              }}>VS</div>
              <div style={{
                marginTop: 6, fontSize: 10, fontWeight: 700, color: 'var(--wc-gold)',
                letterSpacing: '0.05em',
              }}>
                ▶ JOGAR
              </div>
            </div>

            {/* Away */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: '1.5px solid var(--border-mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32,
              }}>
                {nextOpponent.badge}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                {nextOpponent.shortName}
              </div>
              <div className="lenda-label">VISITANTE</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grupo preview ── */}
      <div style={{ padding: '16px 12px 24px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em',
            color: 'var(--text-primary)',
          }}>
            GRUPO {userTeam.group}
          </div>
          <button
            onClick={() => onNavigate('standings')}
            style={{
              background: 'none', border: 'none', color: 'var(--wc-gold)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
            }}
          >
            Ver tabela <ChevronRight size={13} />
          </button>
        </div>

        <div className="lenda-card" style={{ overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 32px 32px 32px 40px',
            padding: '8px 14px', borderBottom: '1px solid var(--border-default)',
          }}>
            {['TIME', 'J', 'V', 'E', 'PTS'].map(h => (
              <div key={h} className="lenda-label" style={{ textAlign: h === 'TIME' ? 'left' : 'center' }}>{h}</div>
            ))}
          </div>

          {groupTeams.map((team, idx) => {
            const isUser = team.id === (userTeamId ?? 'brazil');
            const p = isUser ? played    : (idx === 0 ? 1 : 0);
            const w = isUser ? matchRecord.wins  : (idx === 0 ? 1 : 0);
            const d = isUser ? matchRecord.draws : 0;
            const pts = w * 3 + d;
            return (
              <div key={team.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 32px 32px 32px 40px',
                padding: '10px 14px',
                background: isUser ? 'rgba(251,191,36,0.06)' : 'transparent',
                borderBottom: idx < groupTeams.length - 1 ? '1px solid var(--border-default)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{team.badge}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: isUser ? 'var(--wc-gold)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
                  }}>{team.shortName}</span>
                </div>
                {[p, w, d, pts].map((val, i) => (
                  <div key={i} style={{
                    textAlign: 'center', fontSize: i === 3 ? 14 : 13,
                    fontWeight: i === 3 ? 800 : 500,
                    color: i === 3 ? 'var(--wc-gold)' : 'var(--text-secondary)',
                    fontFamily: i === 3 ? 'var(--font-display)' : 'var(--font-body)',
                  }}>{val}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
