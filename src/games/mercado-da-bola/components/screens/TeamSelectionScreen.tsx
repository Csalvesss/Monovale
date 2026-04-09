import React, { useState } from 'react';
import { useMB } from '../../store/gameStore';
import { ALL_TEAMS } from '../../data/teams';
import { LEAGUES } from '../../constants';
import { getAvailablePlayers } from '../../data/players';
import type { LeagueId, Team, GameSave, Stadium } from '../../types';

interface Props {
  onBack: () => void;
}

function generateSquad(team: Team) {
  return getAvailablePlayers(team.id, 16);
}

function generateFixtures(myTeamId: string, leagueTeams: Team[]) {
  const others = leagueTeams.filter(t => t.id !== myTeamId);
  // 10 home, 10 away (simplified 20-round season)
  const fixtures = others.slice(0, 9).map((t, i) => ({
    round: i + 1,
    homeTeamId: myTeamId,
    awayTeamId: t.id,
    played: false,
  }));
  const awayFixtures = others.slice(0, 9).map((t, i) => ({
    round: i + 10,
    homeTeamId: t.id,
    awayTeamId: myTeamId,
    played: false,
  }));
  return [...fixtures, ...awayFixtures];
}

function generateStandings(teams: Team[]) {
  return teams.map(t => ({
    teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, points: 0,
  }));
}

export default function TeamSelectionScreen({ onBack }: Props) {
  const { dispatch } = useMB();
  const [leagueFilter, setLeagueFilter] = useState<LeagueId | 'all'>('all');
  const [selected, setSelected] = useState<Team | null>(null);
  const [confirming, setConfirming] = useState(false);

  const filteredTeams = leagueFilter === 'all'
    ? ALL_TEAMS
    : ALL_TEAMS.filter(t => t.leagueId === leagueFilter);

  const handleConfirm = () => {
    if (!selected) return;
    const leagueTeams = ALL_TEAMS.filter(t => t.leagueId === selected.leagueId);
    const squad = generateSquad(selected);
    const allPlayers = ALL_TEAMS.flatMap(t => {
      if (t.id === selected.id) return [];
      return getAvailablePlayers(t.id, 14);
    });

    const stadium: Stadium = {
      name: selected.stadiumName,
      capacity: selected.stadiumCapacity,
      vipSections: 0,
      trainingLevel: 0,
      academyLevel: 0,
      mediaLevel: 0,
      ticketPrice: 1,
    };

    const save: GameSave = {
      version: '1.0',
      timestamp: Date.now(),
      myTeamId: selected.id,
      budget: 500 + selected.reputation * 5,
      currentSeason: 1,
      currentRound: 1,
      mySquad: squad,
      allPlayers: [...squad, ...allPlayers],
      fixtures: generateFixtures(selected.id, leagueTeams),
      standings: generateStandings(leagueTeams),
      sponsorId: null,
      sponsorPoints: 0,
      stadium,
      finances: [],
      newsFeed: [],
      legendaryCardsOwned: [],
      legendaryChanceBonus: 0,
      pendingOffers: [],
      seasonHistory: [],
      totalRoundsPlayed: 0,
    };

    dispatch({ type: 'START_NEW_GAME', save });
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#0f172a', fontFamily: 'var(--font-body)', color: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b, #065f46, #059669)', padding: '24px 20px', textAlign: 'center' }}>
        <button onClick={onBack} style={{
          position: 'absolute', left: 16, top: 16,
          background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
          borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontWeight: 700,
        }}>← Sair</button>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⚽</div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 28, fontWeight: 900, color: '#fff' }}>Mercado da Bola</div>
        <div style={{ fontSize: 14, color: '#a7f3d0', marginTop: 4 }}>Escolha seu clube e comece a jornada</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* League filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
          <button
            onClick={() => setLeagueFilter('all')}
            style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: leagueFilter === 'all' ? '#059669' : '#1e293b',
              color: leagueFilter === 'all' ? '#fff' : '#94a3b8',
              fontWeight: 700, fontSize: 12, fontFamily: 'var(--font-body)',
            }}
          >Todos</button>
          {LEAGUES.map(lg => (
            <button
              key={lg.id}
              onClick={() => setLeagueFilter(lg.id)}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: leagueFilter === lg.id ? '#059669' : '#1e293b',
                color: leagueFilter === lg.id ? '#fff' : '#94a3b8',
                fontWeight: 700, fontSize: 12, fontFamily: 'var(--font-body)',
              }}
            >{lg.flag} {lg.name}</button>
          ))}
        </div>

        {/* Team grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {filteredTeams.map(team => {
            const league = LEAGUES.find(l => l.id === team.leagueId);
            const isSelected = selected?.id === team.id;
            return (
              <button
                key={team.id}
                onClick={() => setSelected(isSelected ? null : team)}
                style={{
                  background: isSelected ? 'rgba(5,150,105,0.2)' : '#1e293b',
                  border: `2px solid ${isSelected ? '#059669' : '#334155'}`,
                  borderRadius: 14, padding: '16px 12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  transition: 'all 0.15s', fontFamily: 'var(--font-body)',
                }}
              >
                <div style={{ fontSize: 36 }}>{team.badge}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', textAlign: 'center', lineHeight: 1.3 }}>{team.name}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{league?.flag} {team.shortName}</div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ height: 4, width: 40, background: '#334155', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${team.reputation}%`, height: '100%', background: '#059669', borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 10, color: '#64748b' }}>{team.reputation}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer confirm */}
      {selected && !confirming && (
        <div style={{
          position: 'sticky', bottom: 0, background: '#1e293b',
          borderTop: '1px solid #334155', padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 40 }}>{selected.badge}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#f1f5f9' }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {LEAGUES.find(l => l.id === selected.leagueId)?.flag} {LEAGUES.find(l => l.id === selected.leagueId)?.name}
              </div>
              <div style={{ fontSize: 12, color: '#fde68a', marginTop: 2 }}>
                💰 Orçamento inicial: ${(500 + selected.reputation * 5).toLocaleString('pt-BR')}k
              </div>
            </div>
          </div>
          <button
            onClick={() => { setConfirming(true); handleConfirm(); }}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #059669, #065f46)',
              color: '#fff', fontWeight: 900, fontSize: 16,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            Começar com {selected.name} ⚽
          </button>
        </div>
      )}
    </div>
  );
}
