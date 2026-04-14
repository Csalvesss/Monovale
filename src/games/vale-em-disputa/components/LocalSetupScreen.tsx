// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Local Setup Screen
// Allows 2-5 players to configure names and factions before a local game
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import type { FactionId } from '../types';
import { FACTION_LIST, FACTIONS } from '../constants';

interface PlayerConfig {
  id: string;
  name: string;
  faction: FactionId | null;
}

interface Props {
  onStart: (players: { id: string; name: string; faction: FactionId }[]) => void;
  onBack: () => void;
}

const DEFAULT_NAMES = ['Jogador 1', 'Jogador 2', 'Jogador 3', 'Jogador 4', 'Jogador 5'];

export default function LocalSetupScreen({ onStart, onBack }: Props) {
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<PlayerConfig[]>([
    { id: 'local_p1', name: 'Jogador 1', faction: null },
    { id: 'local_p2', name: 'Jogador 2', faction: null },
    { id: 'local_p3', name: 'Jogador 3', faction: null },
    { id: 'local_p4', name: 'Jogador 4', faction: null },
    { id: 'local_p5', name: 'Jogador 5', faction: null },
  ]);
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);

  const activePlayers = players.slice(0, playerCount);
  const takenFactions = new Set(activePlayers.map(p => p.faction).filter(Boolean) as FactionId[]);
  const allReady = activePlayers.every(p => p.faction !== null && p.name.trim() !== '');

  function updatePlayer(idx: number, patch: Partial<PlayerConfig>) {
    setPlayers(prev => prev.map((p, i) => i === idx ? { ...p, ...patch } : p));
  }

  function handleStart() {
    if (!allReady) return;
    onStart(
      activePlayers.map(p => ({
        id: p.id,
        name: p.name.trim() || DEFAULT_NAMES[activePlayers.indexOf(p)],
        faction: p.faction as FactionId,
      }))
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0f2213 0%, #0f172a 50%, #1e1438 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px 60px', fontFamily: 'var(--font-body)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🖥️</div>
        <h1 style={{
          fontFamily: 'var(--font-title)',
          fontSize: 24, fontWeight: 900, margin: 0, color: '#f1f5f9',
        }}>
          Jogo Local
        </h1>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>
          Configure os jogadores e facções — mesmo dispositivo
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Player count selector */}
        <div style={S.card}>
          <div style={S.cardTitle}>Número de Jogadores</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {[2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                style={{
                  flex: 1, padding: '10px 4px',
                  background: playerCount === n ? '#7c3aed' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${playerCount === n ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 10, color: '#f1f5f9',
                  fontWeight: 800, fontSize: 18, cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Player configs */}
        {activePlayers.map((player, idx) => (
          <div key={player.id} style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: player.faction ? FACTIONS[player.faction].color : '#334155',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {player.faction ? FACTIONS[player.faction].emoji : `${idx + 1}`}
              </div>
              <input
                type="text"
                value={player.name}
                onChange={e => updatePlayer(idx, { name: e.target.value })}
                maxLength={16}
                placeholder={DEFAULT_NAMES[idx]}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '8px 12px',
                  color: '#f1f5f9', fontSize: 14, fontWeight: 700,
                  outline: 'none', fontFamily: 'var(--font-body)',
                }}
              />
              <button
                onClick={() => setEditingPlayer(editingPlayer === idx ? null : idx)}
                style={{
                  background: editingPlayer === idx ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                  border: 'none', borderRadius: 8, padding: '8px 12px',
                  color: '#f1f5f9', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                {player.faction
                  ? (editingPlayer === idx ? '✓ OK' : '✎ Trocar')
                  : '⚔️ Facção'}
              </button>
            </div>

            {/* Faction selector */}
            {editingPlayer === idx && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {FACTION_LIST.map(faction => {
                  const taken = takenFactions.has(faction.id) && player.faction !== faction.id;
                  const isSelected = player.faction === faction.id;
                  return (
                    <button
                      key={faction.id}
                      onClick={() => {
                        if (!taken) {
                          updatePlayer(idx, { faction: faction.id });
                          setEditingPlayer(null);
                        }
                      }}
                      disabled={taken}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px',
                        background: isSelected
                          ? `${faction.color}33`
                          : taken ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isSelected ? faction.color : taken ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 8, cursor: taken ? 'not-allowed' : 'pointer',
                        opacity: taken ? 0.4 : 1,
                        textAlign: 'left', fontFamily: 'var(--font-body)',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: faction.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, flexShrink: 0,
                      }}>
                        {faction.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>
                          {faction.name}
                          {isSelected && <span style={{ color: '#10b981', marginLeft: 6, fontSize: 10 }}>✓</span>}
                          {taken && <span style={{ color: '#ef4444', marginLeft: 6, fontSize: 10 }}>ocupado</span>}
                        </div>
                        <div style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>
                          {faction.passive}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Status indicator */}
            {player.faction && editingPlayer !== idx && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px',
                background: `${FACTIONS[player.faction].color}18`,
                borderRadius: 6, marginTop: 0,
              }}>
                <span style={{ fontSize: 14 }}>{FACTIONS[player.faction].emoji}</span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>
                  {FACTIONS[player.faction].name}
                </span>
                <span style={{
                  marginLeft: 'auto',
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#10b981', flexShrink: 0,
                }} />
              </div>
            )}

            {!player.faction && editingPlayer !== idx && (
              <div style={{
                padding: '6px 10px', borderRadius: 6,
                background: 'rgba(255,100,0,0.08)',
                color: '#fb923c', fontSize: 11,
              }}>
                ⚠️ Selecione uma facção para continuar
              </div>
            )}
          </div>
        ))}

        {/* Start button */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onBack} style={S.ghostBtn}>
            ← Voltar
          </button>
          <button
            onClick={handleStart}
            disabled={!allReady}
            style={{
              flex: 1, padding: '14px',
              background: allReady
                ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                : 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: 12,
              color: allReady ? '#fff' : '#475569',
              fontSize: 15, fontWeight: 800,
              cursor: allReady ? 'pointer' : 'default',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
            }}
          >
            {allReady
              ? `▶ Iniciar Partida (${playerCount} jogadores)`
              : `Aguardando facções (${activePlayers.filter(p => p.faction).length}/${playerCount})`}
          </button>
        </div>

        {/* Info */}
        <div style={{
          textAlign: 'center', color: '#334155', fontSize: 11, lineHeight: 1.6,
        }}>
          No modo local, todos os jogadores compartilham o mesmo dispositivo.
          O jogo avisa de quem é a vez — passe o tablet/notebook entre os jogadores.
        </div>
      </div>
    </div>
  );
}

const S = {
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: '16px',
  } as React.CSSProperties,
  cardTitle: {
    fontSize: 11, color: '#64748b', fontWeight: 700,
    textTransform: 'uppercase' as const, letterSpacing: '0.5px',
  },
  ghostBtn: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12, padding: '12px 16px',
    color: '#64748b', cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
    fontFamily: 'var(--font-body)',
  } as React.CSSProperties,
};
