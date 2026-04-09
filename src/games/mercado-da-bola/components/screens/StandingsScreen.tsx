import React, { useState, useEffect } from 'react';
import { useMB } from '../../store/gameStore';
import { getTeam } from '../../data/teams';
import type { Standing, MatchFixture } from '../../types';
import type { LeagueStanding } from '../../services/lendaService';
import { listenLeagueStandings } from '../../services/lendaService';
import { Trophy, TrendingUp, AlertTriangle, Home, Plane, Globe, BarChart2 } from 'lucide-react';

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

function getMyResults(fixtures: MatchFixture[], myTeamId: string) {
  return fixtures
    .filter(f => f.played && (f.homeTeamId === myTeamId || f.awayTeamId === myTeamId))
    .slice(-5)
    .reverse()
    .map(f => {
      const isHome = f.homeTeamId === myTeamId;
      const myGoals = isHome ? f.result!.homeGoals : f.result!.awayGoals;
      const opGoals = isHome ? f.result!.awayGoals : f.result!.homeGoals;
      const label: 'V' | 'E' | 'D' = myGoals > opGoals ? 'V' : myGoals === opGoals ? 'E' : 'D';
      return { fixture: f, label, score: `${myGoals}x${opGoals}` };
    });
}

function getUpcomingFixtures(fixtures: MatchFixture[], myTeamId: string) {
  return fixtures
    .filter(f => !f.played && (f.homeTeamId === myTeamId || f.awayTeamId === myTeamId))
    .slice(0, 3);
}

// ─── Online League Table ──────────────────────────────────────────────────────

function OnlineLeagueTable({ leagueCode, myUid }: { leagueCode: string; myUid: string }) {
  const [standings, setStandings] = useState<LeagueStanding[]>([]);

  useEffect(() => {
    const unsub = listenLeagueStandings(leagueCode, setStandings);
    return unsub;
  }, [leagueCode]);

  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const sgA = a.goalsFor - a.goalsAgainst;
    const sgB = b.goalsFor - b.goalsAgainst;
    if (sgB !== sgA) return sgB - sgA;
    return b.goalsFor - a.goalsFor;
  });

  if (sorted.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 12, padding: '40px 20px', textAlign: 'center',
        background: 'var(--ldb-surface)', borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Globe size={32} color="rgba(255,255,255,0.2)" />
        <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>Nenhum dado ainda</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Jogue uma partida para aparecer na tabela online</p>
      </div>
    );
  }

  const thStyle: React.CSSProperties = {
    padding: '10px 8px', fontSize: 9, fontWeight: 900,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.35)', textAlign: 'center',
  };

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--ldb-deep)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Pos', 'Jogador', 'P', 'J', 'V', 'E', 'D', 'SG'].map(col => (
                <th key={col} style={{ ...thStyle, textAlign: col === 'Jogador' ? 'left' : 'center', paddingLeft: col === 'Jogador' ? 12 : 8 }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, idx) => {
              const isMe = s.uid === myUid;
              const team = getTeam(s.teamId);
              const sg = s.goalsFor - s.goalsAgainst;
              const cellStyle: React.CSSProperties = {
                padding: '10px 8px', fontSize: 12, textAlign: 'center', whiteSpace: 'nowrap',
                color: isMe ? '#fff' : 'rgba(255,255,255,0.5)',
                fontWeight: isMe ? 800 : 400,
              };
              return (
                <tr key={s.uid} style={{
                  background: isMe ? 'rgba(26,122,64,0.1)' : 'transparent',
                  borderLeft: isMe ? '3px solid var(--ldb-pitch-bright)' : '3px solid transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <td style={{ ...cellStyle, fontWeight: 900, color: idx === 0 ? 'var(--ldb-gold-bright)' : 'rgba(255,255,255,0.4)' }}>{idx + 1}</td>
                  <td style={{ ...cellStyle, textAlign: 'left', paddingLeft: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: team?.primaryColor ?? '#64748b', flexShrink: 0 }} />
                      <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                      {isMe && <span style={{ fontSize: 8, fontWeight: 900, background: 'var(--ldb-pitch-bright)', color: '#fff', borderRadius: 4, padding: '1px 5px' }}>EU</span>}
                    </div>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2, paddingLeft: 16 }}>{team?.shortName ?? s.teamId}</p>
                  </td>
                  <td style={{ ...cellStyle, color: 'var(--ldb-gold-bright)', fontWeight: 900, fontSize: 14 }}>{s.points}</td>
                  <td style={cellStyle}>{s.wins + s.draws + s.losses}</td>
                  <td style={{ ...cellStyle, color: 'var(--ldb-pitch-bright)' }}>{s.wins}</td>
                  <td style={{ ...cellStyle, color: 'rgba(100,150,255,0.9)' }}>{s.draws}</td>
                  <td style={{ ...cellStyle, color: 'rgba(255,80,80,0.9)' }}>{s.losses}</td>
                  <td style={{ ...cellStyle, fontWeight: 700, color: sg > 0 ? 'var(--ldb-pitch-bright)' : sg < 0 ? 'rgba(255,80,80,0.9)' : 'rgba(255,255,255,0.3)' }}>
                    {sg > 0 ? `+${sg}` : sg}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StandingsScreen() {
  const { state } = useMB();
  const [activeTab, setActiveTab] = useState<'league' | 'online'>('league');

  if (!state.save) {
    return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>Carregando…</div>;
  }

  const save       = state.save;
  const myTeamId   = save.myTeamId;
  const sorted     = sortedStandings(save.standings);
  const totalTeams = sorted.length;
  const myResults  = getMyResults(save.fixtures, myTeamId);
  const upcoming   = getUpcomingFixtures(save.fixtures, myTeamId);
  const myTeam     = getTeam(myTeamId);
  const myPos      = sorted.findIndex(s => s.teamId === myTeamId) + 1;
  const myStanding = save.standings.find(s => s.teamId === myTeamId);
  const isInPromotion  = myPos <= 4;
  const isInRelegation = myPos > totalTeams - 4;

  const thStyle: React.CSSProperties = {
    padding: '10px 8px', fontSize: 9, fontWeight: 900,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.35)', textAlign: 'center',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 16px 32px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(26,122,64,0.15)', border: '1px solid rgba(26,122,64,0.25)',
        }}>
          <BarChart2 size={18} color="var(--ldb-pitch-bright)" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 22, letterSpacing: '0.04em', color: '#fff', margin: 0 }}>
            TABELA DO CAMPEONATO
          </h2>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            Temporada {save.currentSeason} · {save.currentRound} rodadas disputadas
          </p>
        </div>
      </div>

      {/* ── Tabs (only if online) ── */}
      {save.onlineLeagueCode && (
        <div style={{ display: 'flex', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          {[
            { key: 'league', label: 'Campeonato' },
            { key: 'online', label: 'Liga Online', icon: <Globe size={11} /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              style={{
                flex: 1, padding: '10px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: activeTab === key ? 'var(--ldb-pitch-mid)' : 'var(--ldb-surface)',
                color: activeTab === key ? '#fff' : 'rgba(255,255,255,0.4)',
                border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 800, fontFamily: 'var(--ldb-font-body)',
                transition: 'all 0.15s ease',
              }}
            >
              {icon}{label}
            </button>
          ))}
        </div>
      )}

      {/* ── Online tab ── */}
      {save.onlineLeagueCode && activeTab === 'online' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>Liga Online</p>
            <span style={{
              fontSize: 12, fontFamily: 'monospace', fontWeight: 700,
              background: 'var(--ldb-elevated)', borderRadius: 8, padding: '4px 10px',
              color: 'var(--ldb-gold-bright)', border: '1px solid rgba(255,215,0,0.2)',
            }}>{save.onlineLeagueCode}</span>
          </div>
          <OnlineLeagueTable leagueCode={save.onlineLeagueCode} myUid={save.playerUid ?? ''} />
        </>
      )}

      {/* ── Local league ── */}
      {(!save.onlineLeagueCode || activeTab === 'league') && <>

        {/* My team summary */}
        <div style={{
          borderRadius: 14, padding: 16,
          border: '1px solid rgba(26,122,64,0.3)',
          background: 'rgba(26,122,64,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: (myTeam?.primaryColor ?? '#1A7A40') + '22',
              border: `2px solid ${(myTeam?.primaryColor ?? '#1A7A40')}44`,
              fontFamily: 'var(--ldb-font-display)', fontSize: 14, letterSpacing: '0.04em',
              color: myTeam?.primaryColor ?? 'var(--ldb-pitch-bright)',
            }}>
              {myTeam?.shortName?.substring(0, 3) ?? '?'}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 900, color: '#fff', margin: 0 }}>{myTeam?.name ?? 'Meu Time'}</p>
              <p style={{ fontSize: 12, color: 'var(--ldb-pitch-bright)', marginTop: 2 }}>
                {myPos}º lugar · {myStanding?.points ?? 0} pontos
              </p>
            </div>
          </div>
          <div>
            {isInPromotion ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(26,122,64,0.2)', borderRadius: 8,
                padding: '5px 10px', border: '1px solid rgba(26,122,64,0.4)',
              }}>
                <Trophy size={12} color="var(--ldb-gold-bright)" />
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ldb-gold-bright)' }}>Promoção</span>
              </div>
            ) : isInRelegation ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(239,68,68,0.15)', borderRadius: 8,
                padding: '5px 10px', border: '1px solid rgba(239,68,68,0.3)',
              }}>
                <AlertTriangle size={12} color="#ef4444" />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444' }}>Rebaixamento</span>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)', borderRadius: 8,
                padding: '5px 10px', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <TrendingUp size={12} color="rgba(255,255,255,0.4)" />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>Meio</span>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { color: 'var(--ldb-pitch-bright)', label: 'Promoção (Top 4)' },
            { color: 'rgba(255,80,80,0.9)', label: 'Rebaixamento (Últimos 4)' },
            { color: 'var(--ldb-pitch-bright)', label: 'Seu time' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--ldb-deep)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Pos', 'Time', 'P', 'J', 'V', 'E', 'D', 'GF', 'GA', 'SG'].map(col => (
                    <th key={col} style={{ ...thStyle, textAlign: col === 'Time' ? 'left' : 'center', paddingLeft: col === 'Time' ? 12 : 8 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((standing, idx) => {
                  const isMe = standing.teamId === myTeamId;
                  const isPromotion = idx < 4;
                  const isRelegation = idx >= totalTeams - 4;
                  const team = getTeam(standing.teamId);
                  const sg = standing.goalsFor - standing.goalsAgainst;

                  const cellStyle: React.CSSProperties = {
                    padding: '10px 8px', fontSize: 12, textAlign: 'center', whiteSpace: 'nowrap',
                    color: isMe ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontWeight: isMe ? 800 : 400,
                  };

                  return (
                    <React.Fragment key={standing.teamId}>
                      {idx === 4 && (
                        <tr>
                          <td colSpan={10}>
                            <div style={{ height: 1, background: 'rgba(26,122,64,0.4)' }} />
                          </td>
                        </tr>
                      )}
                      {idx === totalTeams - 4 && (
                        <tr>
                          <td colSpan={10}>
                            <div style={{ height: 1, borderTop: '1px dashed rgba(239,68,68,0.4)' }} />
                          </td>
                        </tr>
                      )}
                      <tr style={{
                        background: isMe
                          ? 'rgba(26,122,64,0.1)'
                          : isPromotion ? 'rgba(26,122,64,0.04)'
                          : isRelegation ? 'rgba(239,68,68,0.04)' : 'transparent',
                        borderLeft: isMe ? '3px solid var(--ldb-pitch-bright)' : '3px solid transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}>
                        <td style={{
                          ...cellStyle, fontWeight: 900,
                          color: idx === 0 ? 'var(--ldb-gold-bright)'
                            : isPromotion ? 'var(--ldb-pitch-bright)'
                            : isRelegation ? 'rgba(255,80,80,0.9)' : 'rgba(255,255,255,0.3)',
                        }}>{idx + 1}</td>
                        <td style={{ ...cellStyle, textAlign: 'left', paddingLeft: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: team?.primaryColor ?? '#64748b', flexShrink: 0 }} />
                            <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {team?.shortName ?? standing.teamId.toUpperCase()}
                            </span>
                            {isMe && <span style={{ fontSize: 8, fontWeight: 900, background: 'var(--ldb-pitch-bright)', color: '#fff', borderRadius: 4, padding: '1px 5px' }}>EU</span>}
                          </div>
                        </td>
                        <td style={{ ...cellStyle, color: 'var(--ldb-gold-bright)', fontWeight: 900, fontSize: 14 }}>{standing.points}</td>
                        <td style={cellStyle}>{standing.played}</td>
                        <td style={{ ...cellStyle, color: 'var(--ldb-pitch-bright)' }}>{standing.won}</td>
                        <td style={{ ...cellStyle, color: 'rgba(100,150,255,0.9)' }}>{standing.drawn}</td>
                        <td style={{ ...cellStyle, color: 'rgba(255,80,80,0.9)' }}>{standing.lost}</td>
                        <td style={cellStyle}>{standing.goalsFor}</td>
                        <td style={cellStyle}>{standing.goalsAgainst}</td>
                        <td style={{ ...cellStyle, fontWeight: 700, color: sg > 0 ? 'var(--ldb-pitch-bright)' : sg < 0 ? 'rgba(255,80,80,0.9)' : 'rgba(255,255,255,0.3)' }}>
                          {sg > 0 ? `+${sg}` : sg}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent results */}
        {myResults.length > 0 && (
          <div>
            <p className="ldb-section-label" style={{ marginBottom: 12 }}>Últimos Resultados</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myResults.map(({ fixture, label, score }) => {
                const isHome = fixture.homeTeamId === myTeamId;
                const oppId  = isHome ? fixture.awayTeamId : fixture.homeTeamId;
                const opp    = getTeam(oppId);
                const resultColor = label === 'V' ? 'var(--ldb-pitch-bright)' : label === 'D' ? 'rgba(255,80,80,0.9)' : 'rgba(100,150,255,0.9)';
                return (
                  <div key={`${fixture.round}-${oppId}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--ldb-surface)', borderRadius: 12, padding: '12px 14px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: resultColor + '22', border: `1px solid ${resultColor}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 900, color: resultColor,
                      fontFamily: 'var(--ldb-font-display)', letterSpacing: '0.04em',
                    }}>{label}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isHome ? 'vs' : 'em'} {opp?.name ?? oppId}
                      </p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Rodada {fixture.round}</p>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 900, color: resultColor, fontFamily: 'var(--ldb-font-display)', letterSpacing: '0.04em' }}>
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <p className="ldb-section-label" style={{ marginBottom: 12 }}>Próximas Partidas</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.map(f => {
                const isHome = f.homeTeamId === myTeamId;
                const oppId  = isHome ? f.awayTeamId : f.homeTeamId;
                const opp    = getTeam(oppId);
                return (
                  <div key={`${f.round}-${oppId}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--ldb-surface)', borderRadius: 12, padding: '12px 14px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: 'var(--ldb-elevated)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 900, color: 'rgba(255,255,255,0.5)',
                      fontFamily: 'var(--ldb-font-display)',
                    }}>{f.round}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isHome ? 'vs' : 'em'} {opp?.name ?? oppId}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        {isHome
                          ? <><Home size={9} color="var(--ldb-pitch-bright)" /><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Mandante</span></>
                          : <><Plane size={9} color="rgba(255,255,255,0.35)" /><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Visitante</span></>
                        }
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>· Rep. {opp?.reputation ?? '?'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </>}
    </div>
  );
}
