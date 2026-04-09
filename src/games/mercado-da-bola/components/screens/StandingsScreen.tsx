import React from 'react';
import { useMB } from '../../store/gameStore';
import { getTeam, ALL_TEAMS } from '../../data/teams';
import type { Standing, MatchFixture } from '../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortedStandings(standings: Standing[]): Standing[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const sgA = a.goalsFor - a.goalsAgainst;
    const sgB = b.goalsFor - b.goalsAgainst;
    if (sgB !== sgA) return sgB - sgA;
    return b.goalsFor - a.goalsFor;
  });
}

function getMyResults(fixtures: MatchFixture[], myTeamId: string): { fixture: MatchFixture; label: 'V' | 'E' | 'D'; score: string }[] {
  return fixtures
    .filter(f => f.played && (f.homeTeamId === myTeamId || f.awayTeamId === myTeamId))
    .slice(-5)
    .reverse()
    .map(f => {
      const isHome = f.homeTeamId === myTeamId;
      const myGoals = isHome ? f.result!.homeGoals : f.result!.awayGoals;
      const opGoals = isHome ? f.result!.awayGoals : f.result!.homeGoals;
      const label: 'V' | 'E' | 'D' = myGoals > opGoals ? 'V' : myGoals === opGoals ? 'E' : 'D';
      const score = `${myGoals}x${opGoals}`;
      return { fixture: f, label, score };
    });
}

function getUpcomingFixtures(fixtures: MatchFixture[], myTeamId: string): MatchFixture[] {
  return fixtures
    .filter(f => !f.played && (f.homeTeamId === myTeamId || f.awayTeamId === myTeamId))
    .slice(0, 3);
}

function resultBadgeStyle(label: 'V' | 'E' | 'D'): React.CSSProperties {
  const configs = {
    V: { background: '#14532d', color: '#4ade80' },
    E: { background: '#1e3a5f', color: '#93c5fd' },
    D: { background: '#7f1d1d', color: '#f87171' },
  };
  const c = configs[label];
  return {
    width: 24, height: 24, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 900,
    background: c.background, color: c.color,
    flexShrink: 0,
  };
}

// ─── Row component ────────────────────────────────────────────────────────────

interface RowProps {
  pos: number;
  standing: Standing;
  myTeamId: string;
  totalTeams: number;
}

function StandingRow({ pos, standing, myTeamId, totalTeams }: RowProps) {
  const isMe = standing.teamId === myTeamId;
  const isPromotion = pos <= 4;
  const isRelegation = pos > totalTeams - 4;
  const team = getTeam(standing.teamId);
  const sg = standing.goalsFor - standing.goalsAgainst;

  let rowBg = 'transparent';
  let leftBorder = 'transparent';

  if (isMe) {
    rowBg = 'rgba(37,99,235,0.18)';
    leftBorder = '#3b82f6';
  } else if (isPromotion) {
    rowBg = 'rgba(16,185,129,0.07)';
    leftBorder = '#10b981';
  } else if (isRelegation) {
    rowBg = 'rgba(239,68,68,0.07)';
    leftBorder = '#ef4444';
  }

  const cellStyle: React.CSSProperties = {
    fontSize: 12,
    color: isMe ? '#e2e8f0' : '#94a3b8',
    fontWeight: isMe ? 700 : 400,
    textAlign: 'center',
    padding: '6px 4px',
    whiteSpace: 'nowrap',
  };

  const posColor = pos === 1 ? '#fde68a' : pos <= 4 ? '#4ade80' : pos > totalTeams - 4 ? '#f87171' : '#94a3b8';

  return (
    <tr style={{ background: rowBg, borderLeft: `3px solid ${leftBorder}` }}>
      <td style={{ ...cellStyle, color: posColor, fontWeight: 800, width: 28 }}>{pos}</td>
      <td style={{ ...cellStyle, textAlign: 'left', maxWidth: 120, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>{team?.badge ?? '⚽'}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isMe ? '#fff' : '#cbd5e1', fontWeight: isMe ? 800 : 500 }}>
            {team?.shortName ?? standing.teamId.toUpperCase()}
          </span>
          {isMe && <span style={{ fontSize: 8, background: '#2563eb', color: '#fff', padding: '1px 4px', borderRadius: 4, fontWeight: 800, flexShrink: 0 }}>EU</span>}
        </div>
      </td>
      <td style={{ ...cellStyle, fontWeight: 900, color: isMe ? '#fde68a' : '#f1f5f9', fontSize: 13 }}>{standing.points}</td>
      <td style={cellStyle}>{standing.played}</td>
      <td style={{ ...cellStyle, color: '#4ade80' }}>{standing.won}</td>
      <td style={{ ...cellStyle, color: '#93c5fd' }}>{standing.drawn}</td>
      <td style={{ ...cellStyle, color: '#f87171' }}>{standing.lost}</td>
      <td style={cellStyle}>{standing.goalsFor}</td>
      <td style={cellStyle}>{standing.goalsAgainst}</td>
      <td style={{ ...cellStyle, color: sg > 0 ? '#4ade80' : sg < 0 ? '#f87171' : '#94a3b8', fontWeight: 700 }}>
        {sg > 0 ? `+${sg}` : sg}
      </td>
    </tr>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StandingsScreen() {
  const { state } = useMB();

  if (!state.save) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
        Carregando…
      </div>
    );
  }

  const save = state.save;
  const myTeamId = save.myTeamId;
  const sorted = sortedStandings(save.standings);
  const totalTeams = sorted.length;
  const myResults = getMyResults(save.fixtures, myTeamId);
  const upcoming = getUpcomingFixtures(save.fixtures, myTeamId);
  const myTeam = getTeam(myTeamId);

  // My current position
  const myPos = sorted.findIndex(s => s.teamId === myTeamId) + 1;

  return (
    <div style={{ background: '#0f172a', minHeight: '100%', paddingBottom: 24 }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        padding: '16px 16px 14px',
        borderBottom: '1px solid #1e293b',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>📊</span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#f1f5f9' }}>Tabela do Campeonato</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Temporada {save.currentSeason} · {save.currentRound} rodadas disputadas
            </div>
          </div>
        </div>

        {/* My team quick summary */}
        <div style={{
          marginTop: 14, background: 'rgba(37,99,235,0.15)', borderRadius: 12,
          padding: '10px 14px', border: '1px solid rgba(59,130,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{myTeam?.badge ?? '⚽'}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{myTeam?.name ?? 'Meu Time'}</div>
              <div style={{ fontSize: 11, color: '#93c5fd' }}>
                {myPos}º lugar · {save.standings.find(s => s.teamId === myTeamId)?.points ?? 0} pontos
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {myPos <= 4 ? (
              <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 700 }}>🏆 Zona de promoção</span>
            ) : myPos > totalTeams - 4 ? (
              <span style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>⚠️ Zona de rebaixamento</span>
            ) : (
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>Meio da tabela</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
          <LegendItem color="#10b981" label="Promoção (Top 4)" />
          <LegendItem color="#ef4444" label="Rebaixamento (Últimos 4)" />
          <LegendItem color="#3b82f6" label="Seu time" />
        </div>

        {/* Standings table */}
        <div style={{ background: '#1e293b', borderRadius: 14, overflow: 'hidden', border: '1px solid #334155', marginBottom: 20 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                  {['Pos', 'Time', 'P', 'J', 'V', 'E', 'D', 'GF', 'GA', 'SG'].map(col => (
                    <th key={col} style={{
                      fontSize: 10, fontWeight: 800, color: '#64748b', textAlign: col === 'Time' ? 'left' : 'center',
                      padding: '8px 4px', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 0.5,
                      ...(col === 'Time' ? { paddingLeft: 10 } : {}),
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((standing, idx) => (
                  <React.Fragment key={standing.teamId}>
                    {/* Dividers */}
                    {idx === 4 && (
                      <tr>
                        <td colSpan={10} style={{ height: 1, background: '#10b981', opacity: 0.4, padding: 0 }} />
                      </tr>
                    )}
                    {idx === totalTeams - 4 && (
                      <tr>
                        <td colSpan={10} style={{ height: 1, background: '#ef4444', opacity: 0.4, padding: 0 }} />
                      </tr>
                    )}
                    <StandingRow
                      pos={idx + 1}
                      standing={standing}
                      myTeamId={myTeamId}
                      totalTeams={totalTeams}
                    />
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent results */}
        {myResults.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionTitle>Últimos resultados</SectionTitle>
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 14, border: '1px solid #334155' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myResults.map(({ fixture, label, score }) => {
                  const isHome = fixture.homeTeamId === myTeamId;
                  const oppId = isHome ? fixture.awayTeamId : fixture.homeTeamId;
                  const opp = getTeam(oppId);
                  return (
                    <div key={`${fixture.round}-${oppId}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={resultBadgeStyle(label)}>{label}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600 }}>
                          {isHome ? 'vs' : 'em'} {opp?.name ?? oppId}
                          <span style={{ fontSize: 10, color: '#64748b', marginLeft: 6 }}>Rd.{fixture.round}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: label === 'V' ? '#4ade80' : label === 'D' ? '#f87171' : '#93c5fd' }}>
                        {score}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming fixtures */}
        {upcoming.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <SectionTitle>Próximas partidas</SectionTitle>
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 14, border: '1px solid #334155' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcoming.map(f => {
                  const isHome = f.homeTeamId === myTeamId;
                  const oppId = isHome ? f.awayTeamId : f.homeTeamId;
                  const opp = getTeam(oppId);
                  return (
                    <div key={`${f.round}-${oppId}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 6, background: '#1e3a5f',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 800, color: '#93c5fd', flexShrink: 0,
                      }}>
                        {f.round}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600 }}>
                          {isHome ? 'vs' : 'em'} {opp?.name ?? oppId}
                        </div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>
                          {isHome ? '🏠 Mandante' : '✈️ Visitante'} · Rep. {opp?.reputation ?? '?'}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Rd.{f.round}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {upcoming.length === 0 && myResults.length > 0 && (
          <div style={{
            textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: 13, fontWeight: 600,
          }}>
            🏁 Todos os jogos da temporada foram disputados.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Legend item ──────────────────────────────────────────────────────────────

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{label}</span>
    </div>
  );
}
