import React from 'react';
import { useMB } from '../../store/gameStore';
import { getTeam } from '../../data/teams';
import type { FinancialRecord, MatchFixture, NewsPost } from '../../types';
import { LEGENDARY_BASE_CHANCE, LEGENDARY_MAX_CHANCE } from '../../constants';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NEWS_ICONS: Record<string, string> = {
  transfer: '🔄',
  match:    '⚽',
  sponsor:  '💰',
  player:   '👤',
  legendary:'🌟',
  stadium:  '🏟️',
  general:  '📰',
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  twitter:   '🐦',
  report:    '📰',
};

function fmt(n: number) {
  return n.toLocaleString('pt-BR');
}

function fmtAmount(n: number) {
  const sign = n >= 0 ? '+' : '';
  const color = n >= 0 ? '#4ade80' : '#f87171';
  return { label: `${sign}$${fmt(Math.abs(n))}k`, color };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 12,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{ fontSize: 18, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#94a3b8' }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 800,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function ResultPill({ fixture, myTeamId }: { fixture: MatchFixture; myTeamId: string }) {
  const r = fixture.result!;
  const isHome = fixture.homeTeamId === myTeamId;
  const myGoals = isHome ? r.homeGoals : r.awayGoals;
  const opGoals = isHome ? r.awayGoals : r.homeGoals;
  const opTeamId = isHome ? fixture.awayTeamId : fixture.homeTeamId;
  const opTeam = getTeam(opTeamId);
  const won = myGoals > opGoals;
  const drew = myGoals === opGoals;
  const outcomeColor = won ? '#4ade80' : drew ? '#facc15' : '#f87171';
  const outcomeLabel = won ? 'V' : drew ? 'E' : 'D';

  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 10,
      padding: '10px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: outcomeColor + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 900, color: outcomeColor, flexShrink: 0,
        }}>
          {outcomeLabel}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isHome ? 'vs ' : 'em '}{opTeam?.badge ?? '⚽'} {opTeam?.shortName ?? opTeamId}
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 900, color: '#f1f5f9', flexShrink: 0 }}>
        {myGoals} <span style={{ color: '#475569' }}>x</span> {opGoals}
      </div>
      <div style={{ fontSize: 10, color: '#64748b', flexShrink: 0 }}>Rd.{fixture.round}</div>
    </div>
  );
}

function NewsCard({ post }: { post: NewsPost }) {
  const icon = NEWS_ICONS[post.type] ?? '📰';
  const platform = PLATFORM_ICONS[post.platform] ?? '📰';

  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 10,
      padding: '10px 12px',
      display: 'flex',
      gap: 10,
    }}>
      <div style={{ fontSize: 20, flexShrink: 0, lineHeight: 1, marginTop: 1 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>{platform} {post.author}</span>
          {post.authorHandle && (
            <span style={{ fontSize: 9, color: '#475569' }}>{post.authorHandle}</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{post.content}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <span style={{ fontSize: 10, color: '#475569' }}>❤️ {fmt(post.likes)}</span>
          <span style={{ fontSize: 10, color: '#475569' }}>💬 {post.comments}</span>
        </div>
      </div>
    </div>
  );
}

function FinanceRow({ record }: { record: FinancialRecord }) {
  const { label, color } = fmtAmount(record.amount);
  const CAT_ICONS: Record<string, string> = {
    wage: '👕', transfer: '🔄', sponsor: '💰', ticket: '🎟️', training: '🏋️', stadium: '🏟️', other: '📋',
  };
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #1e293b',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>{CAT_ICONS[record.category] ?? '📋'}</span>
        <span style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {record.description}
        </span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color, flexShrink: 0, marginLeft: 8 }}>{label}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { state, setScreen } = useMB();
  const { save } = state;

  if (!save) return null;

  const myTeam = getTeam(save.myTeamId);

  // --- Standings position ---
  const sortedStandings = [...save.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
  const myPosition = sortedStandings.findIndex(s => s.teamId === save.myTeamId) + 1;
  const myStanding = save.standings.find(s => s.teamId === save.myTeamId);

  // --- Next fixture ---
  const nextFixtureIdx = save.fixtures.findIndex(
    f => !f.played && (f.homeTeamId === save.myTeamId || f.awayTeamId === save.myTeamId)
  );
  const nextFixture = nextFixtureIdx >= 0 ? save.fixtures[nextFixtureIdx] : null;
  const nextOpponentId = nextFixture
    ? (nextFixture.homeTeamId === save.myTeamId ? nextFixture.awayTeamId : nextFixture.homeTeamId)
    : null;
  const nextOpponent = nextOpponentId ? getTeam(nextOpponentId) : null;
  const nextIsHome = nextFixture ? nextFixture.homeTeamId === save.myTeamId : false;

  // --- Recent results ---
  const recentResults = save.fixtures
    .filter(f => f.played && f.result && (f.homeTeamId === save.myTeamId || f.awayTeamId === save.myTeamId))
    .slice(-3)
    .reverse();

  // --- News ---
  const recentNews = save.newsFeed.slice(0, 3);

  // --- Legendary chance ---
  const legendaryChance = Math.min(LEGENDARY_MAX_CHANCE, LEGENDARY_BASE_CHANCE + save.legendaryChanceBonus);
  const legendaryPct = (legendaryChance / LEGENDARY_MAX_CHANCE) * 100;

  // --- Finances ---
  const recentFinances = save.finances.slice(0, 3);

  const positionLabel = myPosition
    ? `${myPosition}°`
    : '—';

  const positionColor = myPosition <= 4 ? '#4ade80' : myPosition <= 10 ? '#facc15' : '#f87171';

  return (
    <div style={{ padding: '16px', paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        border: '1px solid #334155',
        borderRadius: 16,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, flexShrink: 0,
          background: (myTeam?.primaryColor ?? '#2563eb') + '33',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, border: `2px solid ${myTeam?.primaryColor ?? '#2563eb'}44`,
        }}>
          {myTeam?.badge ?? '⚽'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1 }}>
            {myTeam?.name ?? 'Meu Time'}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
            Temporada {save.currentSeason} · Rodada {save.currentRound}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#fde68a' }}>
            💰 ${fmt(save.budget)}k
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>orçamento</div>
        </div>
      </div>

      {/* ── Quick stats grid ── */}
      <div>
        <SectionTitle>Visão Geral</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatCard
            icon="📊"
            label="Posição"
            value={positionLabel}
            sub={`${myStanding?.points ?? 0} pts`}
          />
          <StatCard
            icon="⚽"
            label="Próxima Partida"
            value={nextOpponent ? `${nextOpponent.badge} ${nextOpponent.shortName}` : '—'}
            sub={nextFixture ? `Rd.${nextFixture.round} · ${nextIsHome ? 'Casa' : 'Fora'}` : 'Sem jogos'}
          />
          <StatCard
            icon="👕"
            label="Elenco"
            value={String(save.mySquad.length)}
            sub="jogadores"
          />
          <StatCard
            icon="🏆"
            label="Vitórias"
            value={String(myStanding?.won ?? 0)}
            sub={`${myStanding?.drawn ?? 0}E · ${myStanding?.lost ?? 0}D`}
          />
        </div>
      </div>

      {/* ── Next match card ── */}
      {nextFixture && nextOpponent && (
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f, #1e293b)',
          border: '1px solid #1d4ed8',
          borderRadius: 16,
          padding: 16,
        }}>
          <SectionTitle>Próxima Partida</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            {/* My team */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>{myTeam?.badge ?? '⚽'}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', marginTop: 4 }}>
                {myTeam?.shortName ?? 'MEU'}
              </div>
              <div style={{ fontSize: 9, color: '#60a5fa', fontWeight: 600 }}>
                {nextIsHome ? '🏠 Casa' : '✈️ Fora'}
              </div>
            </div>

            {/* VS */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#475569' }}>VS</div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Rodada {nextFixture.round}</div>
            </div>

            {/* Opponent */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>{nextOpponent.badge}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', marginTop: 4 }}>
                {nextOpponent.shortName}
              </div>
              <div style={{ fontSize: 9, color: '#94a3b8' }}>
                Rep. {nextOpponent.reputation}
              </div>
            </div>
          </div>

          <button
            onClick={() => setScreen('match')}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
              color: '#fff',
              fontWeight: 900,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.3px',
            }}
          >
            ⚽ Jogar Agora
          </button>
        </div>
      )}

      {/* ── Recent results ── */}
      {recentResults.length > 0 && (
        <div>
          <SectionTitle>Resultados Recentes</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentResults.map((f, i) => (
              <ResultPill key={i} fixture={f} myTeamId={save.myTeamId} />
            ))}
          </div>
        </div>
      )}

      {/* ── Recent news ── */}
      {recentNews.length > 0 && (
        <div>
          <SectionTitle>Notícias Recentes</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentNews.map(post => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* ── Legendary chance ── */}
      <div>
        <SectionTitle>Chance de Carta Lendária</SectionTitle>
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🌟</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Carta Lendária</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#fde68a' }}>
              {(legendaryChance * 100).toFixed(2)}%
            </span>
          </div>

          {/* Discrete bar — 20 segments */}
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: 20 }, (_, i) => {
              const threshold = (i + 1) / 20;
              const filled = legendaryPct / 100 >= threshold;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background: filled
                      ? `hsl(${40 + i * 3}, 90%, 60%)`
                      : '#334155',
                    transition: 'background 0.3s',
                  }}
                />
              );
            })}
          </div>

          <div style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>
            {save.legendaryCardsOwned.length} carta{save.legendaryCardsOwned.length !== 1 ? 's' : ''} lendária{save.legendaryCardsOwned.length !== 1 ? 's' : ''} obtida{save.legendaryCardsOwned.length !== 1 ? 's' : ''}
            {' · '}Máx. {(LEGENDARY_MAX_CHANCE * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* ── Budget trends ── */}
      {recentFinances.length > 0 && (
        <div>
          <SectionTitle>Movimentações Financeiras</SectionTitle>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: '10px 14px',
          }}>
            {recentFinances.map((r, i) => (
              <FinanceRow key={i} record={r} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
