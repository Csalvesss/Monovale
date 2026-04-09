import React from 'react';
import { Trophy, Users, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSquadStore } from '../../store/squadStore';
import { TEAMS, getTeamsByGroup } from '../../data/initialData';
import type { LDBScreen } from '../../types/game';

interface Props {
  onNavigate: (screen: LDBScreen) => void;
}

function StatCard({
  icon, label, value, color, delay = 0,
}: { icon: React.ReactNode; label: string; value: string | number; color: string; delay?: number }) {
  return (
    <div
      className="lenda-card lenda-anim-fade-up"
      style={{
        flex: 1, padding: '16px 12px', textAlign: 'center',
        animationDelay: `${delay}ms`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}
    >
      <div style={{ color, display: 'flex', alignItems: 'center' }}>{icon}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.03em',
        color: 'var(--text-primary)', lineHeight: 1,
      }}>
        {value}
      </div>
      <div className="lenda-label">{label}</div>
    </div>
  );
}

export default function HomeScreen({ onNavigate }: Props) {
  const { currentSeason, currentWeek, matchRecord, budget, userTeamId, nextOpponentId } = useGameStore();
  const { lineup, players } = useSquadStore();

  const userTeam    = TEAMS.find(t => t.id === (userTeamId ?? 'brazil'));
  const nextOpponent = TEAMS.find(t => t.id === nextOpponentId) ?? TEAMS[1];
  const groupTeams  = userTeam ? getTeamsByGroup(userTeam.group ?? 'A') : [];
  const played      = matchRecord.wins + matchRecord.draws + matchRecord.losses;
  const points      = matchRecord.wins * 3 + matchRecord.draws;
  const budgetStr   = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(budget);

  function fmt(n: number) { return new Intl.NumberFormat('pt-BR').format(n); }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Banner */}
      <div style={{
        position: 'relative',
        height: 260,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <img
          src="https://picsum.photos/seed/worldcup/1920/1080"
          alt="World Cup"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.7) 60%, var(--bg-void) 100%)',
        }} />
        {/* Content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <div className="lenda-anim-fade-up" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 10vw, 56px)',
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
            textShadow: '0 4px 20px rgba(0,0,0,0.7)',
            lineHeight: 1,
          }}>
            LENDA DA BOLA
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            letterSpacing: '0.15em',
            color: 'var(--wc-gold)',
          }}>
            {userTeam?.badge} {userTeam?.name?.toUpperCase()} — TEMPORADA {currentSeason}
          </div>

          {/* Play button */}
          <button
            onClick={() => onNavigate('match')}
            className="lenda-anim-pop-in"
            style={{
              marginTop: 8,
              width: 60, height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--wc-gold), var(--wc-gold-dark))',
              border: 'none',
              color: '#000',
              fontSize: 24,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(251,191,36,0.5)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              animationDelay: '200ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ padding: '16px 12px', display: 'flex', gap: 8 }}>
        <StatCard icon={<Trophy size={18} />}     label="Pontos"    value={points}     color="var(--wc-gold)"  delay={0}   />
        <StatCard icon={<Users size={18} />}      label="Elenco"    value={lineup.length} color="#60a5fa"      delay={80}  />
        <StatCard icon={<Star size={18} />}       label="Vitórias"  value={matchRecord.wins} color="#22c55e"   delay={160} />
        <StatCard icon={<TrendingUp size={18} />} label="Orçamento" value={`R$${budgetStr}`} color="#a78bfa"   delay={240} />
      </div>

      {/* Próxima Partida */}
      <div style={{ padding: '0 12px 16px' }}>
        <div className="lenda-anim-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="lenda-section-title" style={{ marginBottom: 10 }}>
            ⚽ PRÓXIMA PARTIDA — Semana {currentWeek}
          </div>
          <div
            className="lenda-card"
            style={{
              padding: '20px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={() => onNavigate('match')}
          >
            {/* Home team */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              <span style={{ fontSize: 40 }}>{userTeam?.badge}</span>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.05em',
                color: 'var(--text-primary)',
              }}>
                {userTeam?.shortName}
              </div>
              <div className="lenda-label" style={{ color: 'var(--wc-gold)' }}>Casa</div>
            </div>

            {/* VS */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '0.1em',
                color: 'var(--wc-gold)',
              }}>
                VS
              </div>
              <div className="lenda-label">Clique para jogar</div>
            </div>

            {/* Away team */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              <span style={{ fontSize: 40 }}>{nextOpponent.badge}</span>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.05em',
                color: 'var(--text-primary)',
              }}>
                {nextOpponent.shortName}
              </div>
              <div className="lenda-label" style={{ color: 'var(--text-muted)' }}>Visitante</div>
            </div>
          </div>
        </div>
      </div>

      {/* Group standings preview */}
      <div style={{ padding: '0 12px 24px' }}>
        <div className="lenda-anim-fade-up" style={{ animationDelay: '400ms' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
          }}>
            <div className="lenda-section-title" style={{ marginBottom: 0 }}>
              GRUPO {userTeam?.group}
            </div>
            <button
              onClick={() => onNavigate('standings')}
              style={{
                background: 'none', border: 'none', color: 'var(--wc-gold)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
              }}
            >
              Ver tabela <ChevronRight size={14} />
            </button>
          </div>

          <div className="lenda-card" style={{ overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto auto auto auto',
              gap: 8, padding: '8px 12px',
              borderBottom: '1px solid var(--border-default)',
            }}>
              {['Time', 'J', 'V', 'E', 'D', 'Pts'].map(h => (
                <div key={h} className="lenda-label" style={{ textAlign: h === 'Time' ? 'left' : 'center' }}>{h}</div>
              ))}
            </div>

            {groupTeams.map((team, idx) => {
              const isUser = team.id === userTeamId || team.id === 'brazil';
              const rec = isUser ? matchRecord : { wins: 1, draws: 0, losses: 0, goalsFor: 2, goalsAgainst: 1 };
              const pts = rec.wins * 3 + rec.draws;
              return (
                <div
                  key={team.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto auto auto auto',
                    gap: 8,
                    padding: '10px 12px',
                    background: isUser ? 'rgba(251,191,36,0.06)' : 'transparent',
                    borderBottom: idx < groupTeams.length - 1 ? '1px solid var(--border-default)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{team.badge}</span>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.04em',
                      color: isUser ? 'var(--wc-gold)' : 'var(--text-primary)',
                    }}>{team.shortName}</span>
                  </div>
                  {[played, rec.wins, rec.draws, rec.losses, pts].map((val, i) => (
                    <div key={i} style={{
                      textAlign: 'center', fontSize: 13,
                      fontWeight: i === 4 ? 800 : 500,
                      color: i === 4 ? 'var(--wc-gold)' : 'var(--text-secondary)',
                      fontFamily: i === 4 ? 'var(--font-display)' : 'var(--font-body)',
                    }}>
                      {val}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
