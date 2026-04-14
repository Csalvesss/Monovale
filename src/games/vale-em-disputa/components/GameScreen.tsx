// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Main Game Screen
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback, useEffect } from 'react';
import type { GameState, CombatResult } from '../types';
import {
  calculateReinforcements, placeReinforcement, performAttack, moveTroops,
  advancePhase, tradeTerritoryCards, spendGoldForTroops,
  triggerEventDraw, resolveEventChoice, useFactionPower, applySimpleEventCard,
  mustTradeCards, getReinforcePassiveBonus,
} from '../logic/gameEngine';
import { ADJACENCIES } from '../constants';
import MapSVG from './MapSVG';
import PlayerPanel from './PlayerPanel';
import ActionPanel from './ActionPanel';
import ActionLog from './ActionLog';
import DiceRoller from './DiceRoller';
import EventCardModal from './EventCardModal';
import TerritoryCardModal from './TerritoryCardModal';

interface Props {
  gameState: GameState;
  myPlayerId: string;
  onStateChange: (newState: GameState) => void;
  onBack: () => void;
  isLocalGame?: boolean;
}

type Tab = 'map' | 'players' | 'log';

export default function GameScreen({ gameState, myPlayerId, onStateChange, onBack, isLocalGame = false }: Props) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [attackFrom, setAttackFrom] = useState<string | null>(null);
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [diceResult, setDiceResult] = useState<{ result: CombatResult; from: string; to: string } | null>(null);
  const [reinforcementsLeft, setReinforcementsLeft] = useState(0);
  const [showTerritoryModal, setShowTerritoryModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<Tab>('map');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // In local mode, the "active player" is always whoever's turn it is
  const effectivePlayerId = isLocalGame ? gameState.currentTurn : myPlayerId;
  const isMyTurn = isLocalGame ? true : gameState.currentTurn === myPlayerId;
  const currentPlayer = gameState.players[effectivePlayerId];
  const phase = gameState.currentPhase;

  // Update mobile detection
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  // Recalculate reinforcements when turn changes or phase starts
  useEffect(() => {
    if (phase === 'reinforce') {
      const base = calculateReinforcements(gameState, effectivePlayerId);
      setReinforcementsLeft(base);
    }
  }, [gameState.currentTurn, phase]); // eslint-disable-line

  // Check mandatory territory card trade
  const mustTrade = mustTradeCards(gameState, effectivePlayerId);

  // ── City click handler ────────────────────────────────────────────────────
  const handleCityClick = useCallback((city: string) => {
    const territory = gameState.territories[city];

    // Attack mode: second click = target
    if (attackFrom) {
      if (city === attackFrom) {
        setAttackFrom(null);
        setSelectedCity(null);
        return;
      }
      if (territory.owner !== effectivePlayerId && ADJACENCIES[attackFrom]?.includes(city)) {
        handleConfirmAttack(attackFrom, city);
        return;
      }
      if (territory.owner === effectivePlayerId) {
        setAttackFrom(city);
        setSelectedCity(city);
      }
      return;
    }

    // Move mode: second click = target
    if (moveFrom) {
      if (city === moveFrom) {
        setMoveFrom(null);
        setSelectedCity(null);
        return;
      }
      if (territory.owner === effectivePlayerId && ADJACENCIES[moveFrom]?.includes(city)) {
        setSelectedCity(city);
        return;
      }
      if (territory.owner === effectivePlayerId) {
        setMoveFrom(city);
        setSelectedCity(city);
      }
      return;
    }

    setSelectedCity(city);
  }, [attackFrom, moveFrom, gameState.territories, effectivePlayerId]); // eslint-disable-line

  // ── Reinforce ─────────────────────────────────────────────────────────────
  function handleReinforce(city: string, troops: number) {
    if (phase !== 'reinforce') return;
    if (reinforcementsLeft <= 0) return;

    const actualTroops = Math.min(troops, reinforcementsLeft);
    const bonus = getReinforcePassiveBonus(effectivePlayerId, city, gameState);
    const totalTroops = actualTroops + bonus;

    const newState = placeReinforcement(gameState, effectivePlayerId, city, totalTroops);
    onStateChange(newState);
    setReinforcementsLeft(prev => prev - actualTroops);
  }

  // ── Attack ─────────────────────────────────────────────────────────────────
  function handleStartAttack(from: string) {
    if (phase !== 'attack') return;
    setAttackFrom(from);
    setSelectedCity(from);
  }

  function handleConfirmAttack(from: string, to: string) {
    if (phase !== 'attack') return;

    const { state: newState, result } = performAttack(gameState, effectivePlayerId, { fromCity: from, toCity: to });
    if (!result) return;

    setDiceResult({ result, from, to });
    onStateChange(newState);
    setAttackFrom(null);
    setSelectedCity(null);
  }

  function handleCancelAttack() {
    setAttackFrom(null);
    setSelectedCity(null);
  }

  // ── Move ──────────────────────────────────────────────────────────────────
  function handleStartMove(from: string) {
    if (phase !== 'move') return;
    setMoveFrom(from);
    setSelectedCity(from);
  }

  function handleConfirmMove(from: string, to: string, troops: number) {
    if (phase !== 'move') return;
    const newState = moveTroops(gameState, effectivePlayerId, from, to, troops);
    onStateChange(newState);
    setMoveFrom(null);
    setSelectedCity(null);
  }

  function handleCancelMove() {
    setMoveFrom(null);
    setSelectedCity(null);
  }

  // ── End phase ─────────────────────────────────────────────────────────────
  function handleEndPhase() {
    if (!isMyTurn) return;
    if (mustTrade && phase !== 'reinforce') return;

    const newState = advancePhase(gameState);
    onStateChange(newState);
    setAttackFrom(null);
    setMoveFrom(null);
    setSelectedCity(null);

    setReinforcementsLeft(0);
  }

  // ── Gold spend ─────────────────────────────────────────────────────────────
  function handleSpendGold(amount: number) {
    const { state: newState, troopsGained } = spendGoldForTroops(gameState, effectivePlayerId, amount);
    if (troopsGained > 0) {
      onStateChange(newState);
      if (phase === 'reinforce') {
        setReinforcementsLeft(prev => prev + troopsGained);
      }
    }
  }

  // ── Faction power ──────────────────────────────────────────────────────────
  function handleUseFactionPower() {
    if (!currentPlayer?.pendingPowerAvailable) return;
    const newState = triggerEventDraw(gameState, effectivePlayerId);
    onStateChange(newState);
  }

  // ── Event card choice ──────────────────────────────────────────────────────
  function handleEventChoice(chosenId: string, discardId: string) {
    const newState1 = resolveEventChoice(gameState, effectivePlayerId, chosenId, discardId);
    const newState2 = applySimpleEventCard(newState1, effectivePlayerId, chosenId);
    onStateChange(newState2);
  }

  // ── Territory cards ────────────────────────────────────────────────────────
  function handleTrade(cities: string[]) {
    const newState = tradeTerritoryCards(gameState, effectivePlayerId, cities);
    const bonus = 4 + gameState.tradeCount * 2;
    if (selectedCity && newState.territories[selectedCity]?.owner === effectivePlayerId) {
      const withTroops = placeReinforcement(newState, effectivePlayerId, selectedCity, bonus);
      onStateChange(withTroops);
    } else {
      const firstCity = Object.entries(newState.territories).find(([, t]) => t.owner === effectivePlayerId)?.[0];
      if (firstCity) {
        onStateChange(placeReinforcement(newState, effectivePlayerId, firstCity, bonus));
      } else {
        onStateChange(newState);
      }
    }
    setShowTerritoryModal(false);
    if (phase === 'reinforce') {
      setReinforcementsLeft(prev => prev + bonus);
    }
  }

  // ── Win screen ─────────────────────────────────────────────────────────────
  if (gameState.winner) {
    const winner = gameState.players[gameState.winner];
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #0f2213, #0f172a)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 20, fontFamily: 'var(--font-body)',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <h1 style={{
            fontFamily: 'var(--font-title)',
            fontSize: 28, fontWeight: 900, color: '#fcd34d',
            margin: '0 0 12px',
          }}>
            {winner?.name ?? '?'} venceu!
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            {gameState.winReason}
          </p>
          <button
            onClick={onBack}
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #059669, #065f46)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 800, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Voltar ao Hub
          </button>
        </div>
      </div>
    );
  }

  // ── Main game layout ───────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100dvh', maxHeight: '100dvh',
      background: '#0a0f1e',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        height: 48, flexShrink: 0,
        background: 'linear-gradient(90deg, #0f172a, #1e1438)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 12,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.08)', border: 'none',
            borderRadius: 6, padding: '4px 10px',
            color: '#94a3b8', cursor: 'pointer', fontSize: 12,
          }}
        >
          ← Sair
        </button>

        <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, color: '#f1f5f9' }}>
          🗺️ Vale em Disputa
        </div>

        <div style={{ fontSize: 11, color: '#64748b' }}>
          Rodada {gameState.round} · {gameState.players[gameState.currentTurn]?.name} está jogando
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {isLocalGame ? (
            <div style={{
              background: '#7c3aed', color: '#fff',
              borderRadius: 6, padding: '2px 10px',
              fontSize: 11, fontWeight: 800,
            }}>
              VEZ: {gameState.players[gameState.currentTurn]?.name?.toUpperCase()}
            </div>
          ) : isMyTurn ? (
            <div style={{
              background: '#059669', color: '#fff',
              borderRadius: 6, padding: '2px 10px',
              fontSize: 11, fontWeight: 800,
              animation: 'pulse 2s infinite',
            }}>
              SUA VEZ
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile tabs */}
      {isMobile && (
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#0f172a',
          flexShrink: 0,
        }}>
          {(['map', 'players', 'log'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              style={{
                flex: 1, padding: '10px 4px',
                background: mobileTab === tab ? 'rgba(5,150,105,0.1)' : 'none',
                border: 'none', borderBottom: `2px solid ${mobileTab === tab ? '#059669' : 'transparent'}`,
                color: mobileTab === tab ? '#10b981' : '#64748b',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}
            >
              {tab === 'map' ? '🗺️ Mapa' : tab === 'players' ? '👥 Jogadores' : '📋 Registro'}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Desktop: left panel (players) */}
        {!isMobile && (
          <div style={{
            width: 240, flexShrink: 0,
            background: '#0f172a',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflowY: 'auto', padding: 10,
          }}>
            <PlayerPanel gameState={gameState} currentPlayerId={effectivePlayerId} />
          </div>
        )}

        {/* Map area */}
        {(!isMobile || mobileTab === 'map') && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: 8, overflow: 'hidden' }}>
              <MapSVG
                gameState={gameState}
                currentPlayerId={effectivePlayerId}
                selectedCity={selectedCity}
                attackFrom={attackFrom}
                moveFrom={moveFrom}
                phase={phase}
                onCityClick={handleCityClick}
              />
            </div>
            {/* Action panel at bottom on desktop */}
            {!isMobile && (
              <div style={{
                height: 220, flexShrink: 0,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                overflow: 'auto',
              }}>
                <ActionPanel
                  gameState={gameState}
                  playerId={effectivePlayerId}
                  isMyTurn={isMyTurn}
                  selectedCity={selectedCity}
                  attackFrom={attackFrom}
                  moveFrom={moveFrom}
                  reinforcementsLeft={reinforcementsLeft}
                  onReinforce={handleReinforce}
                  onStartAttack={handleStartAttack}
                  onConfirmAttack={handleConfirmAttack}
                  onCancelAttack={handleCancelAttack}
                  onStartMove={handleStartMove}
                  onConfirmMove={handleConfirmMove}
                  onCancelMove={handleCancelMove}
                  onEndPhase={handleEndPhase}
                  onSpendGold={handleSpendGold}
                  onUseFactionPower={handleUseFactionPower}
                  onOpenCards={() => setShowTerritoryModal(true)}
                />
              </div>
            )}
          </div>
        )}

        {/* Desktop: right panel (log) */}
        {!isMobile && (
          <div style={{
            width: 260, flexShrink: 0,
            background: '#0a0f1e',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}>
            <ActionLog log={gameState.log} />
          </div>
        )}

        {/* Mobile: players tab */}
        {isMobile && mobileTab === 'players' && (
          <div style={{ flex: 1, overflow: 'auto', padding: 10, background: '#0f172a' }}>
            <PlayerPanel gameState={gameState} currentPlayerId={effectivePlayerId} />
            <div style={{ marginTop: 10 }}>
              <ActionPanel
                gameState={gameState}
                playerId={myPlayerId}
                isMyTurn={isMyTurn}
                selectedCity={selectedCity}
                attackFrom={attackFrom}
                moveFrom={moveFrom}
                reinforcementsLeft={reinforcementsLeft}
                onReinforce={handleReinforce}
                onStartAttack={handleStartAttack}
                onConfirmAttack={handleConfirmAttack}
                onCancelAttack={handleCancelAttack}
                onStartMove={handleStartMove}
                onConfirmMove={handleConfirmMove}
                onCancelMove={handleCancelMove}
                onEndPhase={handleEndPhase}
                onSpendGold={handleSpendGold}
                onUseFactionPower={handleUseFactionPower}
                onOpenCards={() => setShowTerritoryModal(true)}
              />
            </div>
          </div>
        )}

        {/* Mobile: log tab */}
        {isMobile && mobileTab === 'log' && (
          <div style={{ flex: 1, overflow: 'hidden', background: '#0a0f1e' }}>
            <ActionLog log={gameState.log} />
          </div>
        )}
      </div>

      {/* Mobile action bar at bottom */}
      {isMobile && mobileTab === 'map' && isMyTurn && (
        <div style={{
          flexShrink: 0, maxHeight: 200,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          overflow: 'auto',
          background: '#0f172a',
        }}>
          <ActionPanel
            gameState={gameState}
            playerId={myPlayerId}
            isMyTurn={isMyTurn}
            selectedCity={selectedCity}
            attackFrom={attackFrom}
            moveFrom={moveFrom}
            reinforcementsLeft={reinforcementsLeft}
            onReinforce={handleReinforce}
            onStartAttack={handleStartAttack}
            onConfirmAttack={handleConfirmAttack}
            onCancelAttack={handleCancelAttack}
            onStartMove={handleStartMove}
            onConfirmMove={handleConfirmMove}
            onCancelMove={handleCancelMove}
            onEndPhase={handleEndPhase}
            onSpendGold={handleSpendGold}
            onUseFactionPower={handleUseFactionPower}
            onOpenCards={() => setShowTerritoryModal(true)}
          />
        </div>
      )}

      {/* ── Modals ── */}

      {/* Dice result */}
      {diceResult && (
        <DiceRoller
          result={diceResult.result}
          attackerName={gameState.players[effectivePlayerId]?.name ?? 'Atacante'}
          defenderName={gameState.territories[diceResult.to]?.owner
            ? (gameState.players[gameState.territories[diceResult.to].owner!]?.name ?? 'Defensor')
            : 'Neutro'}
          fromCity={diceResult.from}
          toCity={diceResult.to}
          onClose={() => setDiceResult(null)}
        />
      )}

      {/* Event card choice */}
      {gameState.pendingEventChoice && gameState.currentTurn === effectivePlayerId && (
        <EventCardModal
          cardIds={gameState.pendingEventChoice.cardIds}
          onChoose={handleEventChoice}
        />
      )}

      {/* Territory card trade */}
      {showTerritoryModal && currentPlayer && (
        <TerritoryCardModal
          player={currentPlayer}
          tradeCount={gameState.tradeCount}
          mandatory={mustTrade}
          onTrade={handleTrade}
          onClose={() => !mustTrade && setShowTerritoryModal(false)}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
