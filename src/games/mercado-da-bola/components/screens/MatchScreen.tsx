import React, { useState, useEffect, useRef } from 'react';
import { useMB } from '../../store/gameStore';
import { calcDefenseTokens, getTeamRating } from '../../utils/matchEngine';
import { getTeam, ALL_TEAMS } from '../../data/teams';
import type { RoundResultSummary } from '../../types';
import { gsap } from 'gsap';
import {
  Play, Trophy, TrendingUp, Target, Shield, Swords,
  Smile, DollarSign, ChevronRight, BarChart2, X,
  AlertTriangle, Zap,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvgMorale(squad: import('../../types').Player[]): number {
  if (squad.length === 0) return 0;
  return Math.round(squad.reduce((s, p) => s + p.moodPoints, 0) / squad.length);
}

function fmt(n: number) { return new Intl.NumberFormat('pt-BR').format(n); }

function classifyLine(line: string): 'goal' | 'defense' | 'blocked' | 'opponent_goal' | 'attack' | 'info' {
  if (line.includes('GOL') || line.includes('gol') || line.includes('Golaço') || line.includes('placar')) return 'goal';
  if (line.includes('defende') || line.includes('Defesa') || line.includes('goleiro')) return 'defense';
  if (line.includes('bloqueado') || line.includes('Bloqueio') || line.includes('trave')) return 'blocked';
  if (line.includes('adversário') || line.includes('sofre') || line.includes('sofreu')) return 'opponent_goal';
  if (line.includes('ataque') || line.includes('Ataque') || line.includes('chute')) return 'attack';
  return 'info';
}

type EventType = ReturnType<typeof classifyLine>;

const EVENT_COLORS: Record<EventType, { dot: string; bg: string; text: string }> = {
  goal:          { dot: '#00E57A', bg: 'rgba(0,229,122,0.1)',  text: 'var(--ldb-win)'  },
  defense:       { dot: '#60A5FA', bg: 'rgba(96,165,250,0.1)', text: '#60A5FA'          },
  blocked:       { dot: '#FFD700', bg: 'rgba(255,215,0,0.08)', text: 'var(--ldb-draw)' },
  opponent_goal: { dot: '#FF5555', bg: 'rgba(255,85,85,0.1)',  text: 'var(--ldb-loss)' },
  attack:        { dot: '#C084FC', bg: 'rgba(192,132,252,0.1)','text': '#C084FC'        },
  info:          { dot: '#4A6070', bg: 'transparent',           text: 'var(--ldb-text-muted)' },
};

// ─── Round Results Modal ──────────────────────────────────────────────────────

function RoundResultsModal({ summary, onClose }: { summary: RoundResultSummary; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(5,10,14,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%', maxHeight: '80dvh', overflowY: 'auto',
        background: 'var(--ldb-void)',
        borderRadius: '20px 20px 0 0',
        border: '1px solid var(--ldb-border-mid)',
        borderBottom: 'none',
        animation: 'ldb-slide-up 0.3s var(--ldb-ease-out)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 12px',
          borderBottom: '1px solid var(--ldb-border)',
          position: 'sticky', top: 0,
          background: 'var(--ldb-void)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart2 size={16} style={{ color: 'var(--ldb-text-mid)' }} />
            <div>
              <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 16, letterSpacing: '0.04em', color: 'var(--ldb-text)' }}>
                RODADA {summary.round}
              </div>
              <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>{summary.fixtures.length} partidas</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--ldb-border)',
              background: 'var(--ldb-surface)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ldb-text-muted)',
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '12px 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {summary.fixtures.map((f, i) => {
            const ht = getTeam(f.homeTeamId);
            const at = getTeam(f.awayTeamId);
            const hWon = f.homeGoals > f.awayGoals;
            const aWon = f.awayGoals > f.homeGoals;
            return (
              <div key={i} style={{
                background: 'var(--ldb-surface)', borderRadius: 'var(--ldb-r-md)',
                border: '1px solid var(--ldb-border)', padding: '12px 14px',
                display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{ht?.badge ?? '⚽'}</span>
                  <span style={{ fontSize: 12, fontWeight: hWon ? 800 : 500, color: hWon ? 'var(--ldb-text)' : 'var(--ldb-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ht?.shortName ?? f.homeTeamId}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 20, color: hWon ? 'var(--ldb-text)' : 'var(--ldb-text-muted)' }}>{f.homeGoals}</span>
                  <span style={{ fontSize: 11, color: 'var(--ldb-text-muted)', fontWeight: 700 }}>×</span>
                  <span style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 20, color: aWon ? 'var(--ldb-text)' : 'var(--ldb-text-muted)' }}>{f.awayGoals}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 12, fontWeight: aWon ? 800 : 500, color: aWon ? 'var(--ldb-text)' : 'var(--ldb-text-muted)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {at?.shortName ?? f.awayTeamId}
                  </span>
                  <span style={{ fontSize: 22 }}>{at?.badge ?? '⚽'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Pre-match view ────────────────────────────────────────────────────────────

function PreMatchView() {
  const { state, playMatch } = useMB();
  const save = state.save!;
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const nextFixtureIndex = save.fixtures.findIndex(f => !f.played);
  const fixture = nextFixtureIndex >= 0 ? save.fixtures[nextFixtureIndex] : null;

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (cardRef.current)  tl.fromTo(cardRef.current,  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
    if (statsRef.current) tl.fromTo(statsRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35 }, '-=0.2');
    if (btnRef.current)   tl.fromTo(btnRef.current,   { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3 }, '-=0.15');
    return () => { tl.kill(); };
  }, []);

  if (!fixture) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '60px 24px', textAlign: 'center' }}>
        <Trophy size={52} style={{ color: 'var(--ldb-gold-bright)' }} />
        <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 24, letterSpacing: '0.06em', color: 'var(--ldb-gold-bright)' }}>TEMPORADA CONCLUÍDA!</div>
        <p style={{ fontSize: 14, color: 'var(--ldb-text-muted)', lineHeight: 1.6 }}>Todos os jogos foram disputados.<br />Acesse a Tabela para ver a classificação final.</p>
      </div>
    );
  }

  const myTeamId    = save.myTeamId;
  const isHome      = fixture.homeTeamId === myTeamId;
  const opponentId  = isHome ? fixture.awayTeamId : fixture.homeTeamId;
  const myTeam      = getTeam(myTeamId);
  const opponent    = getTeam(opponentId);
  const opponentRating = opponent ? Math.round(opponent.reputation * 0.85) : 60;
  const defTokens   = calcDefenseTokens(save.mySquad);
  const teamRating  = getTeamRating(save.mySquad);
  const avgMorale   = getAvgMorale(save.mySquad);
  const ratingDiff  = teamRating - opponentRating;
  const winProb     = Math.min(90, Math.max(10, 50 + ratingDiff * 1.2));

  const accentColor = myTeam?.primaryColor ?? '#1A7A40';

  function handlePlay() {
    setLoading(true);
    setTimeout(() => { playMatch(nextFixtureIndex); setLoading(false); }, 200);
  }

  return (
    <div style={{ padding: 16, paddingBottom: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Match header ── */}
      <div ref={cardRef} style={{ opacity: 0 }}>
        <div style={{
          background: `linear-gradient(160deg, ${accentColor}20 0%, var(--ldb-surface) 60%)`,
          border: `1px solid ${accentColor}35`,
          borderRadius: 'var(--ldb-r-lg)',
          padding: '20px 18px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />

          {/* Round badge */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <span className="ldb-badge ldb-badge-muted">
              Rd.{fixture.round} · {isHome ? '🏠 Mandante' : '✈️ Visitante'}
            </span>
          </div>

          {/* Teams */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* My team */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 52, lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
                {myTeam?.badge ?? '⚽'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ldb-text)', textAlign: 'center', lineHeight: 1.2 }}>
                {myTeam?.shortName ?? 'Meu Time'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ldb-text-success)', fontWeight: 600 }}>
                Rating {teamRating}
              </div>
            </div>

            {/* Center info */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{
                fontFamily: 'var(--ldb-font-display)', fontSize: 28,
                color: 'rgba(255,255,255,0.12)', letterSpacing: '0.1em',
              }}>VS</div>
              <div style={{
                fontFamily: 'var(--ldb-font-display)', fontSize: 18,
                color: winProb >= 60 ? 'var(--ldb-win)' : winProb <= 40 ? 'var(--ldb-loss)' : 'var(--ldb-draw)',
                letterSpacing: '0.04em',
              }}>
                {Math.round(winProb)}%
              </div>
              <div style={{ fontSize: 9, color: 'var(--ldb-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
                chance de vitória
              </div>
            </div>

            {/* Opponent */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 52, lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
                {opponent?.badge ?? '⚽'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ldb-text)', textAlign: 'center', lineHeight: 1.2 }}>
                {opponent?.shortName ?? 'Adversário'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ldb-text-muted)', fontWeight: 600 }}>
                Rating {opponentRating}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Squad stats ── */}
      <div ref={statsRef} style={{ opacity: 0 }}>
        <div className="ldb-section-label" style={{ marginBottom: 10 }}>Seu Elenco</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { icon: TrendingUp, label: 'Rating', value: teamRating, color: '#60A5FA' },
            { icon: Shield, label: 'Fichas Def.', value: defTokens, color: 'var(--ldb-gold-bright)' },
            { icon: Smile, label: 'Moral', value: avgMorale,
              color: avgMorale >= 75 ? 'var(--ldb-win)' : avgMorale >= 50 ? 'var(--ldb-draw)' : 'var(--ldb-loss)',
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{
              background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
              borderRadius: 'var(--ldb-r-md)', padding: '14px 10px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <Icon size={14} style={{ color }} />
              <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 22, color, letterSpacing: '0.04em' }}>{value}</div>
              <div style={{ fontSize: 9, color: 'var(--ldb-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>{label}</div>
            </div>
          ))}
        </div>

        {save.mySquad.some(p => p.injured) && (
          <div style={{
            marginTop: 8, display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.2)',
            borderRadius: 'var(--ldb-r-md)', padding: '10px 14px',
          }}>
            <AlertTriangle size={13} style={{ color: 'var(--ldb-loss)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--ldb-loss)' }}>
              {save.mySquad.filter(p => p.injured).length} jogador(es) lesionado(s)
            </span>
          </div>
        )}
      </div>

      {/* ── Play button ── */}
      <button
        ref={btnRef}
        onClick={handlePlay}
        disabled={loading}
        className="ldb-btn-primary"
        style={{ width: '100%', fontSize: 16, padding: '18px', opacity: 0, letterSpacing: '0.06em' }}
      >
        {loading ? (
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'ldb-spin 0.7s linear infinite' }} />
        ) : (
          <>
            <Play size={18} />
            JOGAR PARTIDA
            <ChevronRight size={16} />
          </>
        )}
      </button>

      {/* ── How it works ── */}
      <div style={{
        background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
        borderRadius: 'var(--ldb-r-lg)', padding: '16px',
      }}>
        <div className="ldb-section-label" style={{ marginBottom: 12 }}>Como Funciona</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: Swords,      text: `3 fases de ataque por time a cada partida.` },
            { icon: Target,      text: `Cada ataque mira uma das 16 posições do gol.` },
            { icon: Shield,      text: `Suas ${defTokens} fichas bloqueiam posições do adversário.` },
            { icon: TrendingUp,  text: `Rating do elenco aumenta a chance de gol.` },
            { icon: Smile,       text: `Jogadores motivados rendem até 10% a mais.` },
            { icon: DollarSign,  text: `Vitórias geram receita de patrocínio e bilheteria.` },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Icon size={13} style={{ color: 'var(--ldb-pitch-bright)', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: 'var(--ldb-text-muted)', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Post-match view ──────────────────────────────────────────────────────────

function PostMatchView() {
  const { state, setScreen, switchTurn } = useMB();
  const save = state.save!;
  const matchData = state.lastMatchResult!;
  const { result, narrative } = matchData;
  const [showingRoundResults, setShowingRoundResults] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const scoreRef = useRef<HTMLDivElement>(null);

  const lastPlayed = [...save.fixtures].reverse().find(f => f.played);
  const myTeamId   = save.myTeamId;
  const isHome     = lastPlayed?.homeTeamId === myTeamId;
  const myGoals    = isHome ? result.homeGoals : result.awayGoals;
  const opGoals    = isHome ? result.awayGoals : result.homeGoals;
  const opponentId = lastPlayed ? (isHome ? lastPlayed.awayTeamId : lastPlayed.homeTeamId) : '';
  const opponent   = getTeam(opponentId);

  const won  = (result.winner === 'home' && !!isHome) || (result.winner === 'away' && !isHome);
  const drew = result.winner === 'draw';
  const resultLabel = won ? 'VITÓRIA' : drew ? 'EMPATE' : 'DERROTA';
  const resultColor = won ? 'var(--ldb-win)' : drew ? 'var(--ldb-draw)' : 'var(--ldb-loss)';

  const xpList = Object.entries(result.xpEarned)
    .map(([id, xp]) => ({ player: save.mySquad.find(p => p.id === id), xp }))
    .filter(e => e.player !== undefined)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 3) as { player: import('../../types').Player; xp: number }[];

  const narrativeDone = revealed >= narrative.length;

  // Narrative reveal
  useEffect(() => {
    setRevealed(0);
    const reveal = (idx: number) => {
      if (idx >= narrative.length) return;
      timerRef.current = setTimeout(() => { setRevealed(idx + 1); reveal(idx + 1); }, 650);
    };
    reveal(0);
    return () => clearTimeout(timerRef.current);
  }, [narrative]);

  // GSAP score reveal
  useEffect(() => {
    if (narrativeDone && scoreRef.current) {
      gsap.fromTo(scoreRef.current, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' });
    }
  }, [narrativeDone]);

  const isMulti = save.mode === 'local-multi';
  const nextTurn: 1 | 2 = save.currentTurn === 1 ? 2 : 1;
  const nextPlayerName = isMulti && save.playerProfiles ? save.playerProfiles[nextTurn - 1].name : null;

  return (
    <div style={{ padding: 16, paddingBottom: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Narrative timeline ── */}
      <div style={{
        background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
        borderRadius: 'var(--ldb-r-lg)', padding: '16px',
      }}>
        <div className="ldb-section-label" style={{ marginBottom: 12 }}>Lances da Partida</div>
        <div style={{ position: 'relative', paddingLeft: 20 }}>
          <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 1, background: 'var(--ldb-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {narrative.slice(0, revealed).map((line, i) => {
              const type = classifyLine(line);
              const ec = EVENT_COLORS[type];
              return (
                <div key={i} style={{ position: 'relative', animation: 'ldb-fade-in 0.3s ease both' }}>
                  <div style={{
                    position: 'absolute', left: -14, top: 6, width: 8, height: 8,
                    borderRadius: '50%', background: ec.dot,
                    boxShadow: `0 0 6px ${ec.dot}66`,
                  }} />
                  <div style={{
                    background: ec.bg, borderRadius: 8, padding: '8px 12px',
                    border: `1px solid ${ec.dot}22`,
                  }}>
                    <p style={{ fontSize: 12, color: ec.text, lineHeight: 1.5, margin: 0, fontWeight: type === 'goal' ? 700 : 400 }}>
                      {type === 'goal' && '⚽ '}
                      {type === 'defense' && '🧤 '}
                      {type === 'opponent_goal' && '😤 '}
                      {line}
                    </p>
                  </div>
                </div>
              );
            })}
            {!narrativeDone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4 }} className="ldb-anim-pulsate">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ldb-pitch-bright)' }} />
                <span style={{ fontSize: 11, color: 'var(--ldb-text-muted)' }}>Simulando…</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Result banner ── */}
      {narrativeDone && (
        <div ref={scoreRef} style={{ opacity: 0, textAlign: 'center' }}>
          <div style={{
            background: won ? 'rgba(0,229,122,0.08)' : drew ? 'rgba(255,215,0,0.06)' : 'rgba(255,85,85,0.08)',
            border: `1px solid ${resultColor}40`,
            borderRadius: 'var(--ldb-r-lg)', padding: '24px 20px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--ldb-text-muted)', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
              {opponent?.name ?? 'Adversário'}
            </div>
            <div style={{
              fontFamily: 'var(--ldb-font-display)', fontSize: 'clamp(3rem, 12vw, 5rem)',
              letterSpacing: '0.08em', color: resultColor, lineHeight: 1, marginBottom: 12,
            }}>
              {myGoals}
              <span style={{ color: 'var(--ldb-border-em)', fontSize: '0.6em', margin: '0 6px' }}>×</span>
              {opGoals}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `${resultColor}20`, border: `1px solid ${resultColor}40`,
              borderRadius: 'var(--ldb-r-pill)', padding: '6px 20px',
              fontFamily: 'var(--ldb-font-display)', fontSize: 16, letterSpacing: '0.1em', color: resultColor,
            }}>
              {resultLabel}
            </div>
          </div>
        </div>
      )}

      {/* ── Earnings ── */}
      {narrativeDone && (
        <div className="ldb-card ldb-anim-fade-in" style={{ padding: '16px' }}>
          <div className="ldb-section-label" style={{ marginBottom: 12 }}>Receitas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Patrocínio', value: result.sponsorEarned },
              ...(result.ticketRevenue > 0 ? [{ label: 'Bilheteria', value: result.ticketRevenue }] : []),
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--ldb-text-muted)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 16, letterSpacing: '0.03em', color: 'var(--ldb-gold-bright)' }}>
                  +{fmt(value)}k
                </span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--ldb-border)', paddingTop: 8, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ldb-text)' }}>Total</span>
              <span style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 20, letterSpacing: '0.04em', color: 'var(--ldb-win)' }}>
                +{fmt(result.sponsorEarned + result.ticketRevenue)}k
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── XP highlights ── */}
      {narrativeDone && xpList.length > 0 && (
        <div className="ldb-card ldb-anim-fade-in" style={{ padding: '16px' }}>
          <div className="ldb-section-label" style={{ marginBottom: 12 }}>Destaques</div>
          {xpList.map(({ player, xp }, idx) => {
            const medal = ['🥇', '🥈', '🥉'][idx] ?? '⭐';
            return (
              <div key={player.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                paddingBottom: idx < xpList.length - 1 ? 10 : 0,
                borderBottom: idx < xpList.length - 1 ? '1px solid var(--ldb-border)' : 'none',
                marginBottom: idx < xpList.length - 1 ? 10 : 0,
              }}>
                <span style={{ fontSize: 20 }}>{medal}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ldb-text)' }}>{player.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>{player.position} · Nv.{player.level}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={12} style={{ color: 'var(--ldb-xp)' }} />
                  <span style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 15, color: 'var(--ldb-xp)', letterSpacing: '0.04em' }}>+{xp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Other results button ── */}
      {narrativeDone && save.lastRoundResults && save.lastRoundResults.fixtures.length > 1 && (
        <div className="ldb-anim-fade-in" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
          borderRadius: 'var(--ldb-r-md)', padding: '12px 16px',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ldb-text)' }}>Outros resultados</div>
            <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)', marginTop: 2 }}>
              {save.lastRoundResults.fixtures.length - 1} partidas
            </div>
          </div>
          <button className="ldb-btn-ghost" onClick={() => setShowingRoundResults(true)} style={{ padding: '8px 16px', fontSize: 12 }}>
            <BarChart2 size={13} /> Ver
          </button>
        </div>
      )}

      {/* ── Action buttons ── */}
      {narrativeDone && (
        <div className="ldb-anim-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={isMulti ? switchTurn : () => setScreen('match')}
            className="ldb-btn-primary"
            style={{ padding: '14px', fontSize: 13 }}
          >
            <Swords size={14} />
            {isMulti && nextPlayerName ? `Vez de ${nextPlayerName}` : 'Próxima'}
          </button>
          <button
            onClick={() => setScreen('standings')}
            className="ldb-btn-ghost"
            style={{ padding: '14px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Trophy size={14} />
            Tabela
          </button>
        </div>
      )}

      {showingRoundResults && save.lastRoundResults && (
        <RoundResultsModal summary={save.lastRoundResults} onClose={() => setShowingRoundResults(false)} />
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function MatchScreen() {
  const { state } = useMB();
  if (!state.save) return null;
  const showResult = state.lastMatchResult !== null && state.matchPhase === 'result';

  return (
    <div style={{ background: 'var(--ldb-deep)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(10,21,32,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ldb-border)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'rgba(26,122,64,0.15)', border: '1px solid rgba(26,122,64,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Swords size={14} style={{ color: 'var(--ldb-pitch-bright)' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 15, letterSpacing: '0.06em', color: 'var(--ldb-text)' }}>
            {showResult ? 'RESULTADO' : 'PRÓXIMA PARTIDA'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>
            Temporada {state.save.currentSeason} · Rodada {state.save.currentRound}
          </div>
        </div>
      </div>

      {showResult ? <PostMatchView /> : <PreMatchView />}
    </div>
  );
}
