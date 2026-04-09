import React from 'react';
import type { GameState } from '../types';
import { getPawn } from '../data/pawns';
import { getSpace } from '../data/properties';
import { calculateNetWorth } from '../logic/rentCalculator';

interface Props {
  state: GameState;
  onNewGame: () => void;
}

export default function EndScreen({ state, onNewGame }: Props) {
  const rankings = [...state.players]
    .map(player => {
      const ownedPositions = Object.entries(state.properties)
        .filter(([, ps]) => ps.ownerId === player.id)
        .map(([pos]) => Number(pos));
      const netWorth = calculateNetWorth(player, ownedPositions, state.spaces, state.properties);
      return { player, netWorth, ownedPositions };
    })
    .sort((a, b) => {
      if (a.player.bankrupt && !b.player.bankrupt) return 1;
      if (!a.player.bankrupt && b.player.bankrupt) return -1;
      return b.netWorth - a.netWorth;
    });

  const winner = rankings[0];
  const winnerPawn = winner ? getPawn(winner.player.pawnId) : null;

  return (
    <div style={S.overlay}>
      <div style={S.container}>
        {/* Hero */}
        <div style={S.hero}>
          <div style={S.heroEmoji}>🏆</div>
          <div style={S.heroTitle}>FIM DE PARTIDA!</div>
          {winner && winnerPawn && (
            <div style={S.heroWinner}>
              {winnerPawn.emoji} {winner.player.name} dominou o Vale!
            </div>
          )}
        </div>

        {/* Rankings */}
        <div style={S.body}>
          <div style={S.rankingList}>
            {rankings.map(({ player, netWorth, ownedPositions }, idx) => {
              const pawn = getPawn(player.pawnId);
              const medals = ['🥇', '🥈', '🥉'];
              const isFirst = idx === 0;

              return (
                <div
                  key={player.id}
                  style={{
                    ...S.rankCard,
                    ...(isFirst && !player.bankrupt ? S.rankCardFirst : {}),
                    ...(player.bankrupt ? S.rankCardBankrupt : {}),
                  }}
                >
                  <div style={S.rankMedal}>{medals[idx] ?? `#${idx + 1}`}</div>

                  <div style={{ ...S.rankPawn, background: pawn.color, opacity: player.bankrupt ? 0.5 : 1 }}>
                    {pawn.emoji}
                  </div>

                  <div style={S.rankInfo}>
                    <div style={{
                      ...S.rankName,
                      textDecoration: player.bankrupt ? 'line-through' : 'none',
                    }}>
                      {player.name}
                      {player.bankrupt && ' 💀'}
                    </div>
                    <div style={S.rankNetWorth}>
                      💰 R${netWorth.toLocaleString('pt-BR')}
                    </div>
                    <div style={S.rankDetail}>
                      Dinheiro: R${player.money.toLocaleString('pt-BR')} · {ownedPositions.length} prop.
                    </div>
                  </div>

                  {isFirst && !player.bankrupt && (
                    <div style={S.winnerBadge}>CAMPEÃO!</div>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={onNewGame} style={S.newGameBtn}>
            🔄 NOVA PARTIDA
          </button>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, padding: 20,
    backdropFilter: 'blur(6px)',
  },
  container: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    width: '100%', maxWidth: 500,
    boxShadow: 'var(--shadow-lg)',
    border: '3px solid var(--border-gold)',
    animation: 'pop-in 0.3s ease',
  },

  hero: {
    background: 'var(--gold-grad)',
    padding: '24px 24px 20px',
    textAlign: 'center',
    boxShadow: '0 3px 0 var(--gold-dark)',
  },
  heroEmoji: { fontSize: 60, lineHeight: 1, marginBottom: 8, animation: 'bounce 1.5s ease infinite' },
  heroTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 36,
    color: 'var(--text)',
    letterSpacing: '2px',
    textShadow: '2px 2px 0 rgba(255,255,255,0.4)',
  },
  heroWinner: {
    fontSize: 16,
    fontWeight: 800,
    color: 'var(--text)',
    opacity: 0.8,
    marginTop: 6,
  },

  body: { padding: '16px' },

  rankingList: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 },

  rankCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--card-alt)',
    border: '2px solid var(--border)',
    boxShadow: '0 3px 0 var(--border)',
  },
  rankCardFirst: {
    background: '#fef9e7',
    border: '2px solid var(--gold)',
    boxShadow: '0 3px 0 var(--gold-dark)',
  },
  rankCardBankrupt: {
    opacity: 0.55,
    background: '#fef2f2',
    border: '2px solid #fecaca',
  },
  rankMedal: { fontSize: 26, flexShrink: 0, width: 34, textAlign: 'center' },
  rankPawn: {
    width: 40, height: 40, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, flexShrink: 0,
    border: '3px solid rgba(255,255,255,0.5)',
    boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
  },
  rankInfo: { flex: 1, minWidth: 0 },
  rankName: { fontFamily: 'var(--font-title)', fontSize: 18, color: 'var(--text)' },
  rankNetWorth: { fontSize: 14, fontWeight: 800, color: 'var(--green-dark)', marginTop: 2 },
  rankDetail: { fontSize: 11, color: 'var(--text-light)', marginTop: 1 },
  winnerBadge: {
    padding: '5px 12px',
    background: 'var(--gold-grad)',
    color: 'var(--text)',
    borderRadius: 99,
    fontFamily: 'var(--font-title)',
    fontSize: 12,
    letterSpacing: '1px',
    boxShadow: '0 3px 0 var(--gold-dark)',
    flexShrink: 0,
  },

  newGameBtn: {
    display: 'block',
    width: '100%',
    padding: '16px',
    background: 'var(--green-grad)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'var(--font-title)',
    fontSize: 22,
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: '0 5px 0 var(--green-dark)',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
};
