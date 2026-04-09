import React, { useState } from 'react';
import { Shield, Sword, Heart, X } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSquadStore } from '../../store/squadStore';
import { TEAMS } from '../../data/initialData';
import { runMatch, getTeamStrength } from '../../engine/matchEngine';
import type { MatchResult } from '../../types/game';

type Phase = 'setup' | 'simulating' | 'result';

function ResultModal({ result, userTeamName, opponentName, onClose }: {
  result: MatchResult; userTeamName: string; opponentName: string; onClose: () => void;
}) {
  const { score } = result;
  const won   = score.home > score.away;
  const drew  = score.home === score.away;
  const lost  = score.home < score.away;

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
          width: '100%', maxWidth: 400,
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
          color: resultColor, textAlign: 'center', marginBottom: 24,
        }}>
          {resultLabel}
        </div>

        {/* Score */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          marginBottom: 28,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{userTeamName}</div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 56, letterSpacing: '0.05em',
            color: 'var(--text-primary)',
            animation: 'lenda-pop-in 0.5s 0.2s var(--ease-out) both',
          }}>
            {score.home} <span style={{ color: 'var(--text-muted)', fontSize: 36 }}>×</span> {score.away}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{opponentName}</div>
          </div>
        </div>

        {/* Events */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-md)',
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {result.events.map((ev, i) => (
            <div
              key={i}
              style={{
                fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                animation: `lenda-fade-up 0.3s ${i * 100 + 400}ms var(--ease-out) both`,
              }}
            >
              {ev}
            </div>
          ))}
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
  const { userTeamId, nextOpponentId, advanceWeek, recordMatchResult } = useGameStore();
  const { lineup, players } = useSquadStore();
  const [phase, setPhase] = useState<Phase>('setup');
  const [result, setResult] = useState<MatchResult | null>(null);

  const userTeam  = TEAMS.find(t => t.id === (userTeamId ?? 'brazil')) ?? TEAMS[0];
  const opponent  = TEAMS.find(t => t.id === nextOpponentId) ?? TEAMS[1];
  const lineupPlayers = lineup.map(id => players[id]).filter(Boolean) as import('../../types/game').Player[];
  const { attack, defense, morale } = getTeamStrength(lineupPlayers);

  function handleSimulate() {
    if (phase !== 'setup') return;
    setPhase('simulating');
    setTimeout(() => {
      const res = runMatch(userTeam, opponent, lineupPlayers);
      setResult(res);
      recordMatchResult(res.score.home, res.score.away);
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
      <div
        className="lenda-card"
        style={{ padding: '28px 20px', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          {/* Home */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 56 }}>{userTeam.badge}</span>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em',
              color: 'var(--wc-gold)',
            }}>
              {userTeam.shortName}
            </div>
            <div className="lenda-label" style={{ color: 'var(--wc-gold)' }}>Casa</div>
          </div>

          {/* VS */}
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.1em',
            color: 'var(--text-muted)',
          }}>
            VS
          </div>

          {/* Away */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 56 }}>{opponent.badge}</span>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em',
              color: 'var(--text-primary)',
            }}>
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
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { icon: <Sword size={18} />,  label: 'Ataque',  value: attack,  color: '#ef4444' },
          { icon: <Shield size={18} />, label: 'Defesa',  value: defense, color: '#3b82f6' },
          { icon: <Heart size={18} />,  label: 'Moral',   value: morale,  color: '#22c55e' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="lenda-card" style={{
            flex: 1, padding: '16px 12px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <div style={{ color }}>{icon}</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: '0.03em',
              color: 'var(--text-primary)',
            }}>
              {value}
            </div>
            <div className="lenda-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Lineup info */}
      <div
        className="lenda-card"
        style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {lineupPlayers.length} / 11 titulares escalados
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {lineupPlayers.length < 11 ? '⚠️ Elenco incompleto — escale mais jogadores' : '✅ Formação 4-3-3 completa'}
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 20,
          color: lineupPlayers.reduce((s, p) => s + p.stars, 0) >= 30 ? 'var(--wc-gold)' : 'var(--text-secondary)',
        }}>
          ★ {lineupPlayers.reduce((s, p) => s + p.stars, 0)}
        </div>
      </div>

      {/* Simulate button */}
      <button
        onClick={handleSimulate}
        disabled={phase === 'simulating'}
        className="lenda-btn-gold"
        style={{
          padding: '18px',
          fontSize: 22,
          borderRadius: 'var(--r-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
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

      {/* Result modal */}
      {result && phase === 'result' && (
        <ResultModal
          result={result}
          userTeamName={userTeam.name}
          opponentName={opponent.name}
          onClose={handleCloseResult}
        />
      )}
    </div>
  );
}
