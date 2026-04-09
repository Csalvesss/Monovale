import React, { useState } from 'react';
import { Shield, Sword, Heart, Star } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSquadStore } from '../../store/squadStore';
import { TEAMS } from '../../data/initialData';
import { runMatch, getTeamStrength, calculateDefenseTokens, starPoints } from '../../engine/matchEngine';
import type { MatchResult } from '../../types/game';

type Phase = 'setup' | 'simulating' | 'result';

function ResultModal({ result, userTeamName, opponentName, totalPoints, onClose }: {
  result: MatchResult;
  userTeamName: string;
  opponentName: string;
  totalPoints: number;
  onClose: () => void;
}) {
  const { score } = result;
  const won  = score.home > score.away;
  const drew = score.home === score.away;

  const resultColor = won ? '#22c55e' : drew ? 'var(--wc-gold)' : '#ef4444';
  const resultLabel = won ? 'VITÓRIA!' : drew ? 'EMPATE' : 'DERROTA';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(2,6,23,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 420,
          background: 'var(--bg-surface)',
          border: `1px solid ${resultColor}44`,
          borderRadius: 'var(--r-lg)',
          padding: '32px 24px',
          animation: 'lenda-pop-in 0.4s var(--ease-out)',
          boxShadow: `0 0 40px ${resultColor}22`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Result label */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32, letterSpacing: '0.1em',
          color: resultColor, textAlign: 'center', marginBottom: 8,
        }}>
          {resultLabel}
        </div>

        {/* Score */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          marginBottom: 8,
        }}>
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{userTeamName}</div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 56, letterSpacing: '0.05em',
            color: 'var(--text-primary)',
            animation: 'lenda-pop-in 0.5s 0.2s var(--ease-out) both',
          }}>
            {score.home} <span style={{ color: 'var(--text-muted)', fontSize: 36 }}>×</span> {score.away}
          </div>
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{opponentName}</div>
          </div>
        </div>

        {/* Match points earned */}
        <div style={{
          textAlign: 'center', marginBottom: 20,
          padding: '10px 16px',
          background: `${resultColor}15`,
          borderRadius: 'var(--r-md)',
          border: `1px solid ${resultColor}30`,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>PONTOS NESTA PARTIDA</span>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36, color: resultColor, letterSpacing: '0.06em',
          }}>
            +{result.matchPoints}
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Total acumulado: {totalPoints} pts
          </span>
        </div>

        {/* Events log */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-md)',
          padding: '12px 16px',
          marginBottom: 20,
          maxHeight: 220,
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 7,
        }}>
          {result.events.map((ev, i) => (
            <div
              key={i}
              style={{
                fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
                animation: `lenda-fade-up 0.3s ${i * 80 + 300}ms var(--ease-out) both`,
              }}
            >
              {ev}
            </div>
          ))}
        </div>

        {/* Scoring legend */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20,
          fontSize: 10, color: 'var(--text-muted)',
        }}>
          <span>🟢 Carta GOL = 3 pts</span>
          <span>🟡 Carta VITÓRIA = 2 pts</span>
          <span>🔵 Carta EMPATE = 1 pt</span>
        </div>

        <button
          onClick={onClose}
          className="lenda-btn-gold"
          style={{ width: '100%', padding: '13px', fontSize: 18, borderRadius: 'var(--r-md)' }}
        >
          CONTINUAR
        </button>
      </div>
    </div>
  );
}

export default function MatchScreen() {
  const { userTeamId, nextOpponentId, advanceWeek, recordMatchResult, matchRecord } = useGameStore();
  const { lineup, players } = useSquadStore();
  const [phase, setPhase] = useState<Phase>('setup');
  const [result, setResult] = useState<MatchResult | null>(null);

  const userTeam       = TEAMS.find(t => t.id === (userTeamId ?? 'brazil')) ?? TEAMS[0];
  const opponent       = TEAMS.find(t => t.id === nextOpponentId) ?? TEAMS[1];
  const lineupPlayers  = lineup.map(id => players[id]).filter(Boolean) as import('../../types/game').Player[];
  const { attack, defense, morale, starPointTotal } = getTeamStrength(lineupPlayers);

  const totalStarRatings = lineupPlayers.reduce((s, p) => s + p.stars, 0);
  const defenseTokens    = calculateDefenseTokens(totalStarRatings);
  const teamStarLabel    = lineupPlayers.length > 0
    ? `${totalStarRatings} estrelas → ${defenseTokens} fichas de defesa`
    : '—';

  function handleSimulate() {
    if (phase !== 'setup') return;
    setPhase('simulating');
    setTimeout(() => {
      const res = runMatch(userTeam, opponent, lineupPlayers);
      setResult(res);
      recordMatchResult(res.score.home, res.score.away, res.matchPoints);
      advanceWeek();
      setPhase('result');
    }, 3000);
  }

  function handleCloseResult() {
    setResult(null);
    setPhase('setup');
  }

  return (
    <div style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%' }}>
      <div className="lenda-section-title">PRÓXIMA PARTIDA</div>

      {/* VS Banner */}
      <div className="lenda-card" style={{ padding: '28px 20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 56 }}>{userTeam.badge}</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--wc-gold)' }}>
              {userTeam.shortName}
            </div>
            <div className="lenda-label" style={{ color: 'var(--wc-gold)' }}>Casa</div>
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            VS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 56 }}>{opponent.badge}</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
              {opponent.shortName}
            </div>
            <div className="lenda-label" style={{ color: 'var(--text-muted)' }}>Visitante</div>
          </div>
        </div>
        <div style={{
          marginTop: 16, padding: '8px 16px',
          background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--r-md)',
          fontSize: 12, color: 'var(--text-muted)',
        }}>
          {opponent.name} · Reputação {opponent.reputation}/100
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {[
          { icon: <Sword size={16} />,  label: 'Ataque',  value: attack,  color: '#ef4444' },
          { icon: <Shield size={16} />, label: 'Defesa',  value: defense, color: '#3b82f6' },
          { icon: <Heart size={16} />,  label: 'Moral',   value: morale,  color: '#22c55e' },
          { icon: <Star size={16} />,   label: 'Pts★',    value: starPointTotal, color: 'var(--wc-gold)' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="lenda-card" style={{
            padding: '14px 8px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <div style={{ color }}>{icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-primary)' }}>
              {value}
            </div>
            <div className="lenda-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Lineup + defense token info */}
      <div className="lenda-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {lineupPlayers.length} / 11 titulares escalados
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {lineupPlayers.length < 11 ? '⚠️ Elenco incompleto — escale mais jogadores' : '✅ Formação completa'}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--wc-gold)' }}>
            ★ {totalStarRatings}
          </div>
        </div>

        {/* Defense tokens indicator */}
        <div style={{
          padding: '8px 12px',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 'var(--r-sm)',
          fontSize: 11, color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Shield size={12} style={{ color: '#3b82f6', flexShrink: 0 }} />
          <span>{teamStarLabel}</span>
        </div>

        {/* Star point legend */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 10, color: 'var(--text-muted)' }}>
          <span>5★ = 25 pts</span>
          <span>4★ = 22 pts</span>
          <span>3★ = 19 pts</span>
          <span>2★ = 16 pts</span>
        </div>
      </div>

      {/* Total points earned so far */}
      {matchRecord.totalMatchPoints > 0 && (
        <div className="lenda-card" style={{
          padding: '12px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          border: '1px solid rgba(251,191,36,0.2)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>PONTOS ACUMULADOS</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--wc-gold)' }}>
            {matchRecord.totalMatchPoints} pts
          </span>
        </div>
      )}

      {/* Simulate button */}
      <button
        onClick={handleSimulate}
        disabled={phase === 'simulating'}
        className="lenda-btn-gold"
        style={{
          padding: '18px', fontSize: 22,
          borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          opacity: phase === 'simulating' ? 0.7 : 1,
        }}
      >
        {phase === 'simulating' ? (
          <>
            <div className="lenda-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            SIMULANDO PARTIDA...
          </>
        ) : (
          '⚽ INICIAR PARTIDA'
        )}
      </button>

      {result && phase === 'result' && (
        <ResultModal
          result={result}
          userTeamName={userTeam.name}
          opponentName={opponent.name}
          totalPoints={matchRecord.totalMatchPoints}
          onClose={handleCloseResult}
        />
      )}
    </div>
  );
}
