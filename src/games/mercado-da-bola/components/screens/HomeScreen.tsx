import React, { useEffect, useRef } from 'react';
import { useMB } from '../../store/gameStore';
import { getTeam } from '../../data/teams';
import type { MatchFixture } from '../../types';
import { LEGENDARY_BASE_CHANCE, LEGENDARY_MAX_CHANCE } from '../../constants';
import { gsap } from 'gsap';
import {
  Play, Trophy, TrendingUp, Users, Home as HomeIcon,
  Plane, BarChart2, Star, DollarSign, ArrowRight,
  ChevronRight,
} from 'lucide-react';

function fmt(n: number) { return new Intl.NumberFormat('pt-BR').format(n); }

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accentColor, delay = 0,
}: { label: string; value: string; sub?: string; accentColor: string; delay?: number }) {
  return (
    <div
      className="ldb-card ldb-anim-fade-in"
      style={{ padding: '16px', animationDelay: `${delay}ms`, flex: 1 }}
    >
      <div style={{
        fontFamily: 'var(--ldb-font-display)', fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
        letterSpacing: '0.03em', color: accentColor, lineHeight: 1, marginBottom: 4,
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ldb-text-muted)', marginBottom: 2 }}>{sub}</div>}
      <div style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: 'var(--ldb-text-muted)',
      }}>
        {label}
      </div>
    </div>
  );
}

// ─── Result pill ──────────────────────────────────────────────────────────────

function ResultPill({ fixture, myTeamId }: { fixture: MatchFixture; myTeamId: string }) {
  const r = fixture.result!;
  const isHome = fixture.homeTeamId === myTeamId;
  const myGoals = isHome ? r.homeGoals : r.awayGoals;
  const opGoals = isHome ? r.awayGoals : r.homeGoals;
  const opTeamId = isHome ? fixture.awayTeamId : fixture.homeTeamId;
  const opTeam = getTeam(opTeamId);
  const won = myGoals > opGoals;
  const drew = myGoals === opGoals;

  const resultColor = won ? 'var(--ldb-win)' : drew ? 'var(--ldb-draw)' : 'var(--ldb-loss)';
  const resultLabel = won ? 'V' : drew ? 'E' : 'D';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
      borderRadius: 'var(--ldb-r-md)', padding: '12px 14px',
      transition: 'border-color 200ms',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: won ? 'rgba(0,229,122,0.15)' : drew ? 'rgba(255,215,0,0.12)' : 'rgba(255,85,85,0.12)',
        border: `1px solid ${resultColor}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--ldb-font-display)', fontSize: 14, color: resultColor,
        letterSpacing: '0.05em',
      }}>
        {resultLabel}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ldb-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isHome ? 'vs' : 'em'} {opTeam?.shortName ?? opTeamId}
        </div>
        <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>Rd.{fixture.round}</div>
      </div>
      <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 18, letterSpacing: '0.05em', color: 'var(--ldb-text)', flexShrink: 0 }}>
        {myGoals}<span style={{ color: 'var(--ldb-text-muted)', margin: '0 2px' }}>×</span>{opGoals}
      </div>
    </div>
  );
}

// ─── Next match card ──────────────────────────────────────────────────────────

function NextMatchCard({ fixture, myTeamId, onPlay }: {
  fixture: MatchFixture; myTeamId: string; onPlay: () => void;
}) {
  const isHome = fixture.homeTeamId === myTeamId;
  const myTeam = getTeam(myTeamId);
  const opTeamId = isHome ? fixture.awayTeamId : fixture.homeTeamId;
  const opTeam = getTeam(opTeamId);

  const accentColor = myTeam?.primaryColor ?? 'var(--ldb-pitch-bright)';

  return (
    <div style={{
      background: `linear-gradient(135deg, ${accentColor}18, var(--ldb-surface))`,
      border: `1px solid ${accentColor}40`,
      borderRadius: 'var(--ldb-r-lg)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor, opacity: 0.6 }} />

      {/* Teams */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        {/* My team */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 40, lineHeight: 1 }}>{myTeam?.badge ?? '⚽'}</div>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ldb-text)', textAlign: 'center' }}>
            {myTeam?.shortName}
          </span>
          <span className="ldb-badge" style={{
            background: isHome ? 'rgba(26,122,64,0.15)' : 'rgba(255,255,255,0.06)',
            borderColor: isHome ? 'rgba(26,122,64,0.3)' : 'var(--ldb-border)',
            color: isHome ? 'var(--ldb-text-success)' : 'var(--ldb-text-muted)',
            fontSize: 10,
          }}>
            {isHome ? <><HomeIcon size={9} /> Casa</> : <><Plane size={9} /> Fora</>}
          </span>
        </div>

        {/* VS */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 26, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>VS</div>
          <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)', fontWeight: 700 }}>Rd.{fixture.round}</div>
        </div>

        {/* Opponent */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 40, lineHeight: 1 }}>{opTeam?.badge ?? '⚽'}</div>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ldb-text)', textAlign: 'center' }}>
            {opTeam?.shortName}
          </span>
          <span className="ldb-badge ldb-badge-muted" style={{ fontSize: 10 }}>
            Rep. {opTeam?.reputation}
          </span>
        </div>
      </div>

      {/* Play button */}
      <button className="ldb-btn-primary" onClick={onPlay} style={{ width: '100%', fontSize: 14, padding: '13px 20px' }}>
        <Play size={15} />
        Jogar Agora
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Legendary bar ────────────────────────────────────────────────────────────

function LegendaryBar({ chance, maxChance, count }: { chance: number; maxChance: number; count: number }) {
  const pct = (chance / maxChance) * 100;
  return (
    <div style={{ padding: '16px', background: 'var(--ldb-surface)', borderRadius: 'var(--ldb-r-lg)', border: '1px solid var(--ldb-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={14} style={{ color: 'var(--ldb-gold-bright)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ldb-text)' }}>Carta Lendária</span>
        </div>
        <span style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 16, color: 'var(--ldb-gold-bright)', letterSpacing: '0.04em' }}>
          {(chance * 100).toFixed(2)}%
        </span>
      </div>
      <div className="ldb-progress">
        <div className="ldb-progress-fill" style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--ldb-gold-mid), var(--ldb-gold-bright))',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--ldb-text-muted)' }}>
        <span>{count} carta{count !== 1 ? 's' : ''} obtida{count !== 1 ? 's' : ''}</span>
        <span>Máx. {(maxChance * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { state, setScreen } = useMB();
  const { save } = state;
  const heroRef  = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const matchRef = useRef<HTMLDivElement>(null);
  const restRef  = useRef<HTMLDivElement>(null);

  // GSAP entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (heroRef.current)  tl.fromTo(heroRef.current,  { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5 });
    if (statsRef.current) tl.fromTo(statsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.25');
    if (matchRef.current) tl.fromTo(matchRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');
    if (restRef.current)  tl.fromTo(restRef.current,  { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35 }, '-=0.2');
    return () => { tl.kill(); };
  }, []);

  if (!save) return null;

  const myTeam = getTeam(save.myTeamId);
  const primaryColor = myTeam?.primaryColor ?? '#1A7A40';

  const sortedStandings = [...save.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
  });
  const myPosition = sortedStandings.findIndex(s => s.teamId === save.myTeamId) + 1;
  const myStanding = save.standings.find(s => s.teamId === save.myTeamId);
  const totalGames = (myStanding?.won ?? 0) + (myStanding?.drawn ?? 0) + (myStanding?.lost ?? 0);
  const winPct = totalGames > 0 ? Math.round(((myStanding?.won ?? 0) / totalGames) * 100) : 0;

  const nextFixture = save.fixtures.find(
    f => !f.played && (f.homeTeamId === save.myTeamId || f.awayTeamId === save.myTeamId)
  ) ?? null;

  const recentResults = save.fixtures
    .filter(f => f.played && f.result && (f.homeTeamId === save.myTeamId || f.awayTeamId === save.myTeamId))
    .slice(-3)
    .reverse();

  const legendaryChance = Math.min(LEGENDARY_MAX_CHANCE, LEGENDARY_BASE_CHANCE + save.legendaryChanceBonus);

  const positionColor = myPosition <= 4 ? 'var(--ldb-win)' : myPosition <= 10 ? 'var(--ldb-draw)' : 'var(--ldb-loss)';

  return (
    <div style={{ padding: '16px', paddingBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Hero / Club header ── */}
      <div ref={heroRef} style={{ opacity: 0 }}>
        <div style={{
          background: `linear-gradient(135deg, ${primaryColor}22 0%, var(--ldb-surface) 60%)`,
          border: `1px solid ${primaryColor}40`,
          borderRadius: 'var(--ldb-r-lg)',
          borderLeft: `3px solid ${primaryColor}`,
          padding: '18px 20px',
          display: 'flex', alignItems: 'center', gap: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative field lines */}
          <div style={{
            position: 'absolute', right: -20, top: -20, width: 140, height: 140,
            borderRadius: '50%', border: `1px solid ${primaryColor}15`, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', right: 10, top: 10, width: 80, height: 80,
            borderRadius: '50%', border: `1px solid ${primaryColor}12`, pointerEvents: 'none',
          }} />

          {/* Badge */}
          <div style={{
            fontSize: 52, lineHeight: 1, flexShrink: 0,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
          }}>
            {myTeam?.badge ?? '⚽'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: 'var(--ldb-font-display)', fontSize: 'clamp(18px, 5vw, 26px)',
              letterSpacing: '0.04em', color: 'var(--ldb-text)', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {myTeam?.name ?? 'Meu Time'}
            </h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="ldb-badge ldb-badge-muted">Temp. {save.currentSeason}</span>
              <span className="ldb-badge ldb-badge-muted">Rd. {save.currentRound}</span>
              {save.mode === 'local-multi' && save.playerProfiles && (
                <span className="ldb-badge ldb-badge-green">
                  {save.playerProfiles[save.currentTurn - 1]?.name}
                </span>
              )}
            </div>
          </div>

          {/* Budget */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: 'var(--ldb-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>orçamento</div>
            <div style={{
              fontFamily: 'var(--ldb-font-display)', fontSize: 20,
              color: 'var(--ldb-gold-bright)', letterSpacing: '0.04em',
            }}>
              ${fmt(save.budget)}k
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div ref={statsRef} style={{ opacity: 0 }}>
        <div className="ldb-section-label" style={{ marginBottom: 10 }}>Visão Geral</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatCard
            label="Posição" delay={0}
            value={myPosition ? `${myPosition}°` : '—'}
            sub={`${myStanding?.points ?? 0} pts`}
            accentColor={positionColor}
          />
          <StatCard
            label="Vitórias" delay={80}
            value={String(myStanding?.won ?? 0)}
            sub={`${myStanding?.drawn ?? 0}E · ${myStanding?.lost ?? 0}D`}
            accentColor="var(--ldb-win)"
          />
          <StatCard
            label="Elenco" delay={160}
            value={String(save.mySquad.length)}
            sub="jogadores"
            accentColor="var(--ldb-text-mid)"
          />
          <StatCard
            label="Aproveitamento" delay={240}
            value={`${winPct}%`}
            sub={`${totalGames} jogo${totalGames !== 1 ? 's' : ''}`}
            accentColor="var(--ldb-xp)"
          />
        </div>
      </div>

      {/* ── Next match ── */}
      {nextFixture && (
        <div ref={matchRef} style={{ opacity: 0 }}>
          <div className="ldb-section-label" style={{ marginBottom: 10 }}>Próxima Partida</div>
          <NextMatchCard
            fixture={nextFixture}
            myTeamId={save.myTeamId}
            onPlay={() => setScreen('match')}
          />
        </div>
      )}

      {/* ── Rest of content ── */}
      <div ref={restRef} style={{ opacity: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Recent results */}
        {recentResults.length > 0 && (
          <div>
            <div className="ldb-section-label" style={{ marginBottom: 10 }}>Resultados Recentes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentResults.map((f, i) => (
                <ResultPill key={i} fixture={f} myTeamId={save.myTeamId} />
              ))}
            </div>
          </div>
        )}

        {/* Legendary chance */}
        <div>
          <div className="ldb-section-label" style={{ marginBottom: 10 }}>Carta Lendária</div>
          <LegendaryBar
            chance={legendaryChance}
            maxChance={LEGENDARY_MAX_CHANCE}
            count={save.legendaryCardsOwned.length}
          />
        </div>

        {/* Recent news */}
        {save.newsFeed.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="ldb-section-label">Notícias</div>
              <button
                onClick={() => setScreen('social')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--ldb-text-muted)', fontSize: 11, fontWeight: 600,
                  padding: '2px 0',
                }}
              >
                Ver todas <ArrowRight size={11} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {save.newsFeed.slice(0, 3).map((post, i) => (
                <div key={post.id} style={{
                  background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
                  borderRadius: 'var(--ldb-r-md)', padding: '12px 14px',
                  borderLeft: `3px solid ${post.isMyTeam ? 'var(--ldb-pitch-bright)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  <div style={{ fontSize: 12, color: 'var(--ldb-text-muted)', marginBottom: 4 }}>{post.author}</div>
                  <div style={{ fontSize: 13, color: 'var(--ldb-text)', lineHeight: 1.5 }}>
                    {post.content.slice(0, 80)}{post.content.length > 80 ? '…' : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>❤️ {fmt(post.likes)}</span>
                    <span style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>💬 {post.comments}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Finances summary */}
        {save.finances.length > 0 && (
          <div>
            <div className="ldb-section-label" style={{ marginBottom: 10 }}>Movimentações Recentes</div>
            <div style={{ background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)', borderRadius: 'var(--ldb-r-lg)', overflow: 'hidden' }}>
              {save.finances.slice(0, 3).map((rec, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < 2 ? '1px solid var(--ldb-border)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: rec.amount >= 0 ? 'rgba(0,229,122,0.1)' : 'rgba(255,85,85,0.1)',
                    border: `1px solid ${rec.amount >= 0 ? 'rgba(0,229,122,0.2)' : 'rgba(255,85,85,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>
                    {rec.amount >= 0 ? '📈' : '📉'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--ldb-text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rec.description}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)', textTransform: 'capitalize' }}>{rec.category}</div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--ldb-font-display)', fontSize: 15, letterSpacing: '0.03em', flexShrink: 0,
                    color: rec.amount >= 0 ? 'var(--ldb-win)' : 'var(--ldb-loss)',
                  }}>
                    {rec.amount >= 0 ? '+' : ''}{fmt(rec.amount)}k
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
