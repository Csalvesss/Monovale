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
  // Build rankings by net worth
  const rankings = [...state.players]
    .map(player => {
      const ownedPositions = Object.entries(state.properties)
        .filter(([, ps]) => ps.ownerId === player.id)
        .map(([pos]) => Number(pos));
      const netWorth = calculateNetWorth(player, ownedPositions, state.spaces, state.properties);
      return { player, netWorth, ownedPositions };
    })
    .sort((a, b) => {
      // Bankrupt players go to the bottom
      if (a.player.bankrupt && !b.player.bankrupt) return 1;
      if (!a.player.bankrupt && b.player.bankrupt) return -1;
      return b.netWorth - a.netWorth;
    });

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.trophy}>🏆</div>
          <h1 style={styles.title}>Fim de Partida!</h1>
          {rankings[0] && (
            <p style={styles.winner}>
              {getPawn(rankings[0].player.pawnId).emoji} {rankings[0].player.name} dominou o Vale do Paraíba!
            </p>
          )}
        </div>

        <div style={styles.rankingList}>
          {rankings.map(({ player, netWorth, ownedPositions }, index) => {
            const pawn = getPawn(player.pawnId);
            return (
              <div key={player.id} style={{
                ...styles.rankCard,
                ...(index === 0 ? styles.rankCardFirst : {}),
                ...(player.bankrupt ? styles.rankCardBankrupt : {}),
              }}>
                <div style={styles.medal}>{medals[index] ?? `#${index + 1}`}</div>
                <div style={{ ...styles.pawnToken, background: pawn.color }}>
                  {pawn.emoji}
                </div>
                <div style={styles.rankInfo}>
                  <div style={styles.rankName}>
                    {player.name}
                    {player.bankrupt && ' 💀 FALIDO'}
                  </div>
                  <div style={styles.rankNetWorth}>
                    Patrimônio: <strong>R${netWorth.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div style={styles.rankMoney}>
                    Dinheiro: R${player.money.toLocaleString('pt-BR')} •{' '}
                    Propriedades: {ownedPositions.length}
                  </div>
                </div>
                {index === 0 && !player.bankrupt && (
                  <div style={styles.winnerBadge}>VENCEDOR!</div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={onNewGame} style={styles.newGameBtn}>
          🔄 Nova Partida
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: 20,
  },
  container: {
    background: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 500,
    boxShadow: '0 32px 100px rgba(0,0,0,0.6)',
  },
  header: {
    background: 'linear-gradient(135deg, #1a3a2a, #166534)',
    padding: '24px 24px 20px',
    textAlign: 'center',
    color: '#fff',
  },
  trophy: {
    fontSize: 56,
    lineHeight: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: 900,
    color: '#d4af37',
    margin: '0 0 6px',
    letterSpacing: '-0.5px',
  },
  winner: {
    fontSize: 16,
    color: '#86efac',
    margin: 0,
    fontWeight: 600,
  },
  rankingList: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  rankCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 12,
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
  },
  rankCardFirst: {
    background: '#fefce8',
    border: '2px solid #d4af37',
    boxShadow: '0 2px 12px rgba(212,175,55,0.2)',
  },
  rankCardBankrupt: {
    opacity: 0.6,
    background: '#fef2f2',
    border: '2px solid #fecaca',
  },
  medal: {
    fontSize: 24,
    flexShrink: 0,
    width: 32,
    textAlign: 'center',
  },
  pawnToken: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.5)',
  },
  rankInfo: {
    flex: 1,
    minWidth: 0,
  },
  rankName: {
    fontSize: 16,
    fontWeight: 800,
    color: '#111827',
  },
  rankNetWorth: {
    fontSize: 14,
    color: '#166534',
    marginTop: 2,
  },
  rankMoney: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 1,
  },
  winnerBadge: {
    padding: '4px 10px',
    background: '#d4af37',
    color: '#1a1a1a',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '1px',
    flexShrink: 0,
  },
  newGameBtn: {
    display: 'block',
    width: 'calc(100% - 32px)',
    margin: '0 16px 16px',
    padding: '14px',
    background: '#166534',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
