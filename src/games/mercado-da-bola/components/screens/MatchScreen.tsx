import React from 'react';
import { useMB } from '../../store/gameStore';
import { calcDefenseTokens, getTeamRating } from '../../utils/matchEngine';
import { getTeam } from '../../data/teams';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvgMorale(squad: import('../../types').Player[]): number {
  if (squad.length === 0) return 0;
  return Math.round(squad.reduce((s, p) => s + p.moodPoints, 0) / squad.length);
}

function resultColor(winner: 'home' | 'away' | 'draw', isHome: boolean): string {
  if (winner === 'draw') return '#94a3b8';
  const iWon = (winner === 'home' && isHome) || (winner === 'away' && !isHome);
  return iWon ? '#4ade80' : '#f87171';
}

function resultLabel(winner: 'home' | 'away' | 'draw', isHome: boolean): string {
  if (winner === 'draw') return 'EMPATE';
  const iWon = (winner === 'home' && isHome) || (winner === 'away' && !isHome);
  return iWon ? 'VITÓRIA' : 'DERROTA';
}

function narrativeIcon(line: string): string {
  if (line.startsWith('⚽') || line.startsWith('🧤') || line.startsWith('😰') ||
      line.startsWith('🛡️') || line.startsWith('🏆') || line.startsWith('🤝') ||
      line.startsWith('😢') || line.startsWith('🎫')) return '';
  return '▸';
}

// ─── Pre-match panel ──────────────────────────────────────────────────────────

function PreMatchView() {
  const { state, playMatch } = useMB();
  const save = state.save!;

  const nextFixtureIndex = save.fixtures.findIndex(f => !f.played);
  const fixture = nextFixtureIndex >= 0 ? save.fixtures[nextFixtureIndex] : null;

  if (!fixture) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40, textAlign: 'center' }}>
        <span style={{ fontSize: 48 }}>🏆</span>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fde68a' }}>Temporada Concluída!</div>
        <div style={{ fontSize: 14, color: '#94a3b8' }}>Todos os jogos da temporada foram disputados.</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>Acesse a Tabela para conferir a classificação final.</div>
      </div>
    );
  }

  const myTeamId = save.myTeamId;
  const isHome = fixture.homeTeamId === myTeamId;
  const opponentId = isHome ? fixture.awayTeamId : fixture.homeTeamId;
  const myTeam = getTeam(myTeamId);
  const opponent = getTeam(opponentId);
  const opponentRating = opponent ? Math.round(opponent.reputation * 0.85) : 60;

  const defTokens = calcDefenseTokens(save.mySquad);
  const teamRating = getTeamRating(save.mySquad);
  const avgMorale = getAvgMorale(save.mySquad);

  const moraleColor = avgMorale >= 75 ? '#4ade80' : avgMorale >= 50 ? '#facc15' : '#f87171';
  const ratingDiff = teamRating - opponentRating;
  const favoriteLabel = ratingDiff > 8 ? '✅ Favorito' : ratingDiff < -8 ? '⚠️ Azarão' : '⚖️ Equilíbrado';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 16px 24px' }}>

      {/* Round badge */}
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
          Rodada {fixture.round} · {isHome ? 'Casa' : 'Fora'}
        </span>
      </div>

      {/* Match card */}
      <div style={{ background: '#1e293b', borderRadius: 16, padding: 20, border: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

          {/* My team */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 32 }}>{myTeam?.badge ?? '⚽'}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', textAlign: 'center' }}>{myTeam?.name ?? 'Meu Time'}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>
              {isHome ? '🏠 Mandante' : '✈️ Visitante'}
            </div>
          </div>

          {/* VS */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#475569' }}>VS</div>
            <div style={{
              fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
              background: ratingDiff > 8 ? '#14532d' : ratingDiff < -8 ? '#7f1d1d' : '#1e3a5f',
              color: ratingDiff > 8 ? '#4ade80' : ratingDiff < -8 ? '#f87171' : '#93c5fd',
            }}>
              {favoriteLabel}
            </div>
          </div>

          {/* Opponent */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 32 }}>{opponent?.badge ?? '⚽'}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', textAlign: 'center' }}>{opponent?.name ?? 'Adversário'}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>
              Rating: {opponentRating}
            </div>
          </div>
        </div>
      </div>

      {/* Team stats */}
      <div style={{ background: '#1e293b', borderRadius: 14, padding: 16, border: '1px solid #334155' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Seu elenco
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <StatBlock label="Rating" value={teamRating} color="#60a5fa" />
          <StatBlock label="Fichas Def." value={defTokens} color="#f59e0b" />
          <StatBlock label="Moral Médio" value={avgMorale} color={moraleColor} unit="%" />
        </div>
        {save.mySquad.some(p => p.injured) && (
          <div style={{ marginTop: 10, fontSize: 11, color: '#f87171', fontWeight: 600 }}>
            🚑 {save.mySquad.filter(p => p.injured).length} jogador(es) lesionado(s)
          </div>
        )}
      </div>

      {/* Play button */}
      <button
        onClick={() => playMatch(nextFixtureIndex)}
        style={{
          background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
          border: 'none', borderRadius: 14, padding: '18px 24px',
          color: '#fff', fontSize: 18, fontWeight: 900, cursor: 'pointer',
          fontFamily: 'var(--font-body)', letterSpacing: 0.5,
          boxShadow: '0 4px 20px rgba(37,99,235,0.5)',
          transition: 'all 0.15s',
          width: '100%',
        }}
      >
        ⚽ JOGAR PARTIDA
      </button>

      {/* Mechanics explanation */}
      <div style={{ background: '#1e293b', borderRadius: 14, padding: 16, border: '1px solid #334155' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Como funciona
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MechanicRow icon="⚔️" text="3 fases de ataque por time a cada partida." />
          <MechanicRow icon="🎯" text="Cada ataque mira uma das 16 posições do gol." />
          <MechanicRow icon="🛡️" text={`Suas fichas de defesa (${defTokens}) bloqueiam posições aleatórias do adversário.`} />
          <MechanicRow icon="⭐" text="Rating do elenco aumenta a chance de gol em cada ataque." />
          <MechanicRow icon="😊" text="Jogadores motivados rendem até 10% a mais." />
          <MechanicRow icon="💰" text="Vitórias geram receitas de patrocínio e bilheteria." />
        </div>
      </div>
    </div>
  );
}

// ─── Post-match panel ─────────────────────────────────────────────────────────

function PostMatchView() {
  const { state, setScreen } = useMB();
  const save = state.save!;
  const matchData = state.lastMatchResult!;
  const { result, narrative } = matchData;

  const lastPlayedFixture = [...save.fixtures].reverse().find(f => f.played);
  const myTeamId = save.myTeamId;
  const isHome = lastPlayedFixture?.homeTeamId === myTeamId;
  const myGoals = isHome ? result.homeGoals : result.awayGoals;
  const opGoals = isHome ? result.awayGoals : result.homeGoals;

  const color = resultColor(result.winner, isHome ?? true);
  const label = resultLabel(result.winner, isHome ?? true);

  const opponentId = lastPlayedFixture
    ? (isHome ? lastPlayedFixture.awayTeamId : lastPlayedFixture.homeTeamId)
    : '';
  const opponent = getTeam(opponentId);

  // Top XP earners
  const xpList = Object.entries(result.xpEarned)
    .map(([id, xp]) => ({ player: save.mySquad.find(p => p.id === id), xp }))
    .filter(e => e.player !== undefined)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 3) as { player: import('../../types').Player; xp: number }[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 16px 24px' }}>

      {/* Result banner */}
      <div style={{
        background: '#1e293b', borderRadius: 16, padding: 20,
        border: `2px solid ${color}33`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
          {opponent?.name ?? 'Adversário'}
        </div>
        <div style={{ fontSize: 52, fontWeight: 900, color, letterSpacing: 4, lineHeight: 1 }}>
          {myGoals} x {opGoals}
        </div>
        <div style={{
          fontSize: 13, fontWeight: 800, color,
          background: color + '20', padding: '4px 14px', borderRadius: 99,
        }}>
          {label}
        </div>
      </div>

      {/* Earnings */}
      <div style={{ background: '#1e293b', borderRadius: 14, padding: 16, border: '1px solid #334155' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Receitas
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <EarningRow icon="💼" label="Patrocínio" value={result.sponsorEarned} />
          {result.ticketRevenue > 0 && (
            <EarningRow icon="🎫" label="Bilheteria" value={result.ticketRevenue} />
          )}
          <div style={{ borderTop: '1px solid #334155', paddingTop: 8, marginTop: 4 }}>
            <EarningRow icon="💰" label="Total" value={result.sponsorEarned + result.ticketRevenue} highlight />
          </div>
        </div>
      </div>

      {/* Narrative */}
      <div style={{ background: '#1e293b', borderRadius: 14, padding: 16, border: '1px solid #334155' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Lances da Partida
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {narrative.map((line, i) => (
            <div key={i} style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, display: 'flex', gap: 6 }}>
              <span style={{ color: '#475569', flexShrink: 0 }}>{narrativeIcon(line)}</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top XP earners */}
      {xpList.length > 0 && (
        <div style={{ background: '#1e293b', borderRadius: 14, padding: 16, border: '1px solid #334155' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Destaques da Partida
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {xpList.map(({ player, xp }, idx) => (
              <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 99,
                  background: idx === 0 ? '#d97706' : idx === 1 ? '#475569' : '#64381a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900, color: '#fff', flexShrink: 0,
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{player.name}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{player.position} · Nv.{player.level}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#a78bfa' }}>+{xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button
          onClick={() => setScreen('match')}
          style={{
            background: '#1e3a5f', border: '1px solid #1d4ed8', borderRadius: 12,
            color: '#93c5fd', fontSize: 13, fontWeight: 700, padding: '14px 8px',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          ⚽ Próxima Partida
        </button>
        <button
          onClick={() => setScreen('standings')}
          style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: 12,
            color: '#f1f5f9', fontSize: 13, fontWeight: 700, padding: '14px 8px',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          📊 Ver Tabela
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBlock({ label, value, color, unit = '' }: { label: string; value: number; color: string; unit?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#0f172a', borderRadius: 10, padding: '10px 8px' }}>
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}{unit}</div>
      <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>{label}</div>
    </div>
  );
}

function MechanicRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
      <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function EarningRow({ icon, label, value, highlight = false }: { icon: string; label: string; value: number; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 12, color: highlight ? '#f1f5f9' : '#94a3b8', fontWeight: highlight ? 700 : 400 }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color: value > 0 ? '#4ade80' : '#94a3b8' }}>
        +${value.toLocaleString('pt-BR')}k
      </span>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function MatchScreen() {
  const { state } = useMB();

  if (!state.save) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
        Carregando…
      </div>
    );
  }

  const showResult = state.lastMatchResult !== null && state.matchPhase === 'result';

  return (
    <div style={{ background: '#0f172a', minHeight: '100%' }}>
      {/* Screen header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        padding: '16px 16px 0',
        borderBottom: '1px solid #1e293b',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14 }}>
          <span style={{ fontSize: 22 }}>⚽</span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#f1f5f9' }}>
              {showResult ? 'Resultado da Partida' : 'Próxima Partida'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Temporada {state.save.currentSeason} · Rodada {state.save.currentRound}
            </div>
          </div>
        </div>
      </div>

      {showResult ? <PostMatchView /> : <PreMatchView />}
    </div>
  );
}
