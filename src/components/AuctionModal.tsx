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
    ? state.players[auction.highestBidderIndex] : null;

  const minBid = auction.highestBid + 10;
  const parsed = parseInt(bidAmount, 10);
  const validBid = !isNaN(parsed) && parsed >= minBid && currentBidder && parsed <= currentBidder.money;

  function handleBid() {
    if (!currentBidder || !validBid) return;
    onBid(currentBidder.id, parsed);
    setBidAmount('');
  }

  function handlePass() {
    if (!currentBidder) return;
    onPass(currentBidder.id);
    setBidAmount('');
  }

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        {/* Header */}
        <div style={{ ...S.header, background: color }}>
          <div style={S.headerEyebrow}>🔨 Leilão do Sr. Marinho</div>
          <div style={S.headerTitle}>{space.name}</div>
          {space.price && <div style={S.headerPrice}>Valor de mercado: R${space.price}</div>}
        </div>

        <div style={S.body}>
          {/* Highest bid display */}
          <div style={S.bidStatus}>
            {highestBidder ? (
              <>
                <span style={S.bidLabel}>Lance mais alto:</span>
                <span style={S.bidValue}>
                  {getPawn(highestBidder.pawnId).emoji} {highestBidder.name} — R${auction.highestBid}
                </span>
              </>
            ) : (
              <span style={S.bidLabel}>Lance mínimo: R$10 • Nenhum lance ainda</span>
            )}
          </div>

          {/* Players */}
          <div style={S.playersSection}>
            <div style={S.secLabel}>PARTICIPANTES</div>
            {state.players.filter(p => !p.bankrupt).map(player => {
              const pawn = getPawn(player.pawnId);
              const isActive = player.id === activeBidderId;
              const hasPassed = auction.passedPlayerIds.includes(player.id);
              return (
                <div key={player.id} style={{
                  ...S.playerRow,
                  ...(isActive ? S.playerRowActive : {}),
                  ...(hasPassed ? S.playerRowPassed : {}),
                }}>
                  <span style={{ fontSize: 18 }}>{pawn.emoji}</span>
                  <span style={S.playerName}>{player.name}</span>
                  {isActive && <span style={S.activeBadge}>VEZ</span>}
                  {hasPassed && <span style={S.passedBadge}>PASSOU</span>}
                  <span style={S.playerBalance}>R${player.money}</span>
                </div>
              );
            })}
          </div>

          {/* Bid input */}
          {currentBidder && (
            <div style={S.bidSection}>
              <div style={S.secLabel}>
                VEZ DE {currentBidder.name.toUpperCase()} {getPawn(currentBidder.pawnId).emoji}
              </div>
              <div style={S.inputWrap}>
                <span style={S.inputPrefix}>R$</span>
                <input
                  type="number"
                  min={minBid}
                  max={currentBidder.money}
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  placeholder={`Mín. ${minBid}`}
                  style={S.input}
                  onKeyDown={e => e.key === 'Enter' && validBid && handleBid()}
                />
              </div>
              {bidAmount && !isNaN(parsed) && parsed > currentBidder.money && (
                <p style={{ color: 'var(--red)', fontSize: 12, margin: '4px 0 0', fontWeight: 700 }}>
                  Saldo insuficiente.
                </p>
              )}
              <div style={S.bidBtns}>
                <BidBtn
                  label="💰 DAR LANCE"
                  bg="var(--green-grad)"
                  shadow="var(--green-dark)"
                  disabled={!validBid}
                  onClick={handleBid}
                />
                <BidBtn
                  label="🚫 PASSAR"
                  bg="var(--red-grad)"
                  shadow="var(--red-dark)"
                  onClick={handlePass}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BidBtn({ label, bg, shadow, disabled, onClick }: {
  label: string; bg: string; shadow: string;
  disabled?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: '12px',
        background: disabled ? 'linear-gradient(135deg,#d1d5db,#9ca3af)' : bg,
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-title)',
        fontSize: 16,
        letterSpacing: '0.5px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: `0 4px 0 ${disabled ? '#6b7280' : shadow}`,
      }}
    >
      {label}
    </button>
  );
}

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    width: '100%', maxWidth: 420,
    boxShadow: 'var(--shadow-lg)',
    border: '3px solid var(--border-gold)',
    animation: 'pop-in 0.25s ease',
  },
  header: {
    padding: '18px 22px',
    color: '#fff',
    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  headerEyebrow: { fontSize: 12, fontWeight: 700, opacity: 0.9, marginBottom: 4, letterSpacing: '1px' },
  headerTitle: { fontFamily: 'var(--font-title)', fontSize: 26, lineHeight: 1.2 },
  headerPrice: { fontSize: 13, fontWeight: 700, opacity: 0.9, marginTop: 4 },

  body: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 },

  bidStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: '#fef9e7',
    borderRadius: 'var(--radius)',
    border: '2px solid var(--border-gold)',
    flexWrap: 'wrap',
  },
  bidLabel: { fontSize: 12, fontWeight: 600, color: 'var(--text-mid)' },
  bidValue: { fontFamily: 'var(--font-title)', fontSize: 16, color: 'var(--green-dark)' },

  playersSection: {},
  secLabel: {
    fontFamily: 'var(--font-title)',
    fontSize: 12,
    color: 'var(--text-mid)',
    letterSpacing: '1px',
    marginBottom: 6,
  },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 10px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--card-alt)',
    border: '2px solid transparent',
    marginBottom: 4,
  },
  playerRowActive: {
    background: '#fef9e7',
    border: '2px solid var(--gold)',
  },
  playerRowPassed: { opacity: 0.4 },
  playerName: { flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--text)' },
  activeBadge: {
    fontFamily: 'var(--font-title)',
    fontSize: 9,
    color: 'var(--text)',
    background: 'var(--gold-grad)',
    padding: '1px 7px',
    borderRadius: 99,
  },
  passedBadge: {
    fontSize: 9,
    fontWeight: 800,
    color: '#9ca3af',
    background: '#f3f4f6',
    padding: '1px 7px',
    borderRadius: 99,
  },
  playerBalance: { fontSize: 11, fontWeight: 700, color: 'var(--text-mid)' },

  bidSection: {
    borderTop: '2px solid var(--border)',
    paddingTop: 12,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid var(--border-gold)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    background: 'var(--white)',
  },
  inputPrefix: {
    padding: '10px 12px',
    background: 'var(--gold-grad)',
    fontFamily: 'var(--font-title)',
    fontSize: 15,
    color: 'var(--text)',
    borderRight: '2px solid var(--border-gold)',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: 'none',
    outline: 'none',
    fontSize: 16,
    fontWeight: 800,
    fontFamily: 'var(--font-body)',
    background: 'transparent',
    color: 'var(--text)',
  },
  bidBtns: { display: 'flex', gap: 8 },
};
