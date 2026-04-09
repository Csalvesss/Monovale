import React, { useState } from 'react';
import type { GameState } from '../types';
import { getSpace, GROUP_COLORS } from '../data/properties';
import { getPawn } from '../data/pawns';

interface Props {
  state: GameState;
  onBid: (playerId: string, amount: number) => void;
  onPass: (playerId: string) => void;
}

export default function AuctionModal({ state, onBid, onPass }: Props) {
  const auction = state.auction;
  const [bidAmount, setBidAmount] = useState('');

  if (!auction) return null;

  const space = getSpace(auction.propertyPosition);
  const color = space.group ? GROUP_COLORS[space.group] : '#6b7280';

  const activeBidderId = auction.activePlayerIds[auction.activeBidderIndex];
  const currentBidder = state.players.find(p => p.id === activeBidderId);
  const highestBidder = auction.highestBidderIndex !== null
    ? state.players[auction.highestBidderIndex]
    : null;

  const minBid = auction.highestBid + 10;
  const parsedBid = parseInt(bidAmount, 10);
  const validBid = !isNaN(parsedBid) && parsedBid >= minBid && currentBidder && parsedBid <= currentBidder.money;

  function handleBid() {
    if (!currentBidder || !validBid) return;
    onBid(currentBidder.id, parsedBid);
    setBidAmount('');
  }

  function handlePass() {
    if (!currentBidder) return;
    onPass(currentBidder.id);
    setBidAmount('');
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={{ ...styles.header, background: color }}>
          <div style={styles.headerTitle}>🏦 Leilão do Sr. Marinho</div>
          <div style={styles.headerSub}>{space.name}</div>
          {space.price && <div style={styles.headerPrice}>Valor de mercado: R${space.price}</div>}
        </div>

        <div style={styles.body}>
          {/* Current highest bid */}
          <div style={styles.bidStatus}>
            {highestBidder ? (
              <>
                <span>Lance mais alto:</span>
                <span style={styles.bidHighlight}>
                  R${auction.highestBid} — {highestBidder.name} {getPawn(highestBidder.pawnId).emoji}
                </span>
              </>
            ) : (
              <span style={{ color: '#6b7280' }}>Nenhum lance ainda. Lance mínimo: R$10</span>
            )}
          </div>

          {/* Active players */}
          <div style={styles.playersSection}>
            <div style={styles.sectionLabel}>Participantes</div>
            <div style={styles.playersList}>
              {state.players.filter(p => !p.bankrupt).map(player => {
                const pawn = getPawn(player.pawnId);
                const isActive = player.id === activeBidderId;
                const hasPassed = auction.passedPlayerIds.includes(player.id);
                return (
                  <div key={player.id} style={{
                    ...styles.playerChip,
                    ...(isActive ? styles.playerChipActive : {}),
                    ...(hasPassed ? styles.playerChipPassed : {}),
                  }}>
                    <span>{pawn.emoji}</span>
                    <span style={{ fontSize: 12 }}>{player.name}</span>
                    {hasPassed && <span style={{ fontSize: 10, color: '#9ca3af' }}>(Passou)</span>}
                    {isActive && <span style={styles.turnIndicator}>VEZ</span>}
                    <span style={{ fontSize: 11, color: '#6b7280' }}>R${player.money}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bid input — only shown for current bidder */}
          {currentBidder && (
            <div style={styles.bidSection}>
              <div style={styles.sectionLabel}>
                Vez de <strong>{currentBidder.name}</strong> {getPawn(currentBidder.pawnId).emoji}
                {' '}(Saldo: R${currentBidder.money})
              </div>
              <div style={styles.bidInput}>
                <span style={styles.bidPrefix}>R$</span>
                <input
                  type="number"
                  min={minBid}
                  max={currentBidder.money}
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  placeholder={`Mín. R$${minBid}`}
                  style={styles.input}
                  onKeyDown={e => e.key === 'Enter' && validBid && handleBid()}
                />
              </div>
              {bidAmount && !isNaN(parsedBid) && parsedBid > currentBidder.money && (
                <p style={styles.errorMsg}>Saldo insuficiente.</p>
              )}
              <div style={styles.bidActions}>
                <button
                  onClick={handleBid}
                  disabled={!validBid}
                  style={{ ...styles.btnBid, ...(!validBid ? styles.btnDisabled : {}) }}
                >
                  💰 Dar Lance
                </button>
                <button onClick={handlePass} style={styles.btnPass}>
                  🚫 Passar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
  },
  header: {
    padding: '16px 20px',
    color: '#fff',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
  headerTitle: { fontSize: 13, fontWeight: 700, opacity: 0.9, marginBottom: 2 },
  headerSub: { fontSize: 22, fontWeight: 800, lineHeight: 1.2 },
  headerPrice: { fontSize: 13, fontWeight: 600, opacity: 0.9, marginTop: 4 },
  body: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 },
  bidStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: '#f9fafb',
    borderRadius: 8,
    fontSize: 13,
    flexWrap: 'wrap',
  },
  bidHighlight: {
    fontWeight: 700,
    color: '#166534',
  },
  playersSection: {},
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 6,
  },
  playersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  playerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 8,
    background: '#f3f4f6',
    border: '1px solid transparent',
  },
  playerChipActive: {
    background: '#fef9c3',
    border: '1px solid #ca8a04',
  },
  playerChipPassed: {
    opacity: 0.5,
  },
  turnIndicator: {
    fontSize: 9,
    fontWeight: 800,
    color: '#92400e',
    background: '#fde68a',
    padding: '1px 5px',
    borderRadius: 3,
  },
  bidSection: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  bidInput: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bidPrefix: {
    padding: '8px 10px',
    background: '#f3f4f6',
    fontWeight: 700,
    fontSize: 14,
    color: '#374151',
    borderRight: '1px solid #d1d5db',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: 'none',
    outline: 'none',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'inherit',
  },
  errorMsg: { fontSize: 12, color: '#dc2626', margin: 0 },
  bidActions: { display: 'flex', gap: 8 },
  btnBid: {
    flex: 1,
    padding: '10px',
    background: '#166534',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnPass: {
    flex: 1,
    padding: '10px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnDisabled: {
    background: '#9ca3af',
    cursor: 'not-allowed',
  },
};
