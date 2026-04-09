import React from 'react';
import { TEAMS, GROUPS, getTeamsByGroup } from '../../data/initialData';
import { useGameStore } from '../../store/gameStore';

// Deterministic "simulated" stats for CPU teams
function getCpuStats(teamId: string, seed: string) {
  let h = 0;
  for (let i = 0; i < (teamId + seed).length; i++) h = ((h << 5) - h + (teamId + seed).charCodeAt(i)) | 0;
  const wins   = Math.abs(h) % 3;
  const draws  = Math.abs(h >> 8)  % 2;
  const losses = Math.abs(h >> 16) % 2;
  const gf     = wins * 2 + draws;
  const ga     = losses * 2 + draws;
  return { wins, draws, losses, gf, ga, pts: wins * 3 + draws };
}

export default function StandingsScreen() {
  const { userTeamId, matchRecord } = useGameStore();
  const currentTeamId = userTeamId ?? 'brazil';

  return (
    <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: '100%' }}>
      <div className="lenda-section-title">FASE DE GRUPOS</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {GROUPS.map((group) => {
          const groupTeams = getTeamsByGroup(group);

          // Build rows
          const rows = groupTeams.map(team => {
            if (team.id === currentTeamId) {
              const played = matchRecord.wins + matchRecord.draws + matchRecord.losses;
              return {
                team,
                p: played,
                w: matchRecord.wins,
                d: matchRecord.draws,
                l: matchRecord.losses,
                gf: matchRecord.goalsFor,
                ga: matchRecord.goalsAgainst,
                pts: matchRecord.wins * 3 + matchRecord.draws,
                isUser: true,
              };
            }
            const s = getCpuStats(team.id, group);
            return {
              team,
              p: s.wins + s.draws + s.losses,
              w: s.wins, d: s.draws, l: s.losses,
              gf: s.gf, ga: s.ga,
              pts: s.pts,
              isUser: false,
            };
          }).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            return (b.gf - b.ga) - (a.gf - a.ga);
          });

          return (
            <div key={group} className="lenda-card lenda-anim-fade-up" style={{ overflow: 'hidden' }}>
              {/* Group header */}
              <div style={{
                padding: '10px 14px',
                background: 'linear-gradient(90deg, rgba(251,191,36,0.12), transparent)',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'var(--wc-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 16, color: '#000',
                }}>
                  {group}
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.05em' }}>
                  GRUPO {group}
                </span>
              </div>

              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 24px 24px 24px 24px 30px',
                gap: 4,
                padding: '6px 14px',
                borderBottom: '1px solid var(--border-default)',
              }}>
                {['Time', 'J', 'V', 'E', 'SG', 'Pts'].map(h => (
                  <div key={h} className="lenda-label" style={{ textAlign: h === 'Time' ? 'left' : 'center' }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              {rows.map((row, idx) => {
                const classified = idx < 2; // top 2 qualify
                return (
                  <div
                    key={row.team.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 24px 24px 24px 24px 30px',
                      gap: 4,
                      padding: '9px 14px',
                      background: row.isUser
                        ? 'rgba(251,191,36,0.06)'
                        : classified ? 'rgba(34,197,94,0.04)' : 'transparent',
                      borderBottom: idx < rows.length - 1 ? '1px solid var(--border-default)' : 'none',
                      borderLeft: `3px solid ${classified ? '#22c55e' : 'transparent'}`,
                    }}
                  >
                    {/* Team name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>{row.team.badge}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: row.isUser ? 'var(--wc-gold)' : 'var(--text-primary)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {row.team.shortName}
                      </span>
                    </div>
                    {/* Stats */}
                    {[row.p, row.w, row.d, row.gf - row.ga, row.pts].map((val, i) => (
                      <div key={i} style={{
                        textAlign: 'center', fontSize: 12,
                        fontWeight: i === 4 ? 800 : 500,
                        color: i === 4 ? 'var(--wc-gold)' : 'var(--text-secondary)',
                        fontFamily: i === 4 ? 'var(--font-display)' : 'var(--font-body)',
                      }}>
                        {val > 0 && i === 3 ? `+${val}` : val}
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Legend */}
              <div style={{
                padding: '6px 14px',
                display: 'flex', alignItems: 'center', gap: 6,
                borderTop: '1px solid var(--border-default)',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#22c55e' }} />
                <span className="lenda-label">Classificados</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
