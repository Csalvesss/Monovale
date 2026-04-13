// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Room Lobby Screen (Faction selection, waiting for players)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import type { RoomState, FactionId } from '../types';
import { FACTION_LIST, FACTIONS } from '../constants';

interface Props {
  room: RoomState;
  myPlayerId: string;
  onSelectFaction: (faction: FactionId) => Promise<void>;
  onStartGame: () => Promise<void>;
  onLeave: () => void;
}

export default function RoomLobbyScreen({ room, myPlayerId, onSelectFaction, onStartGame, onLeave }: Props) {
  const [starting, setStarting] = useState(false);
  const me = room.players[myPlayerId];
  const isHost = me?.isHost;
  const players = Object.values(room.players);
  const takenFactions = new Set(players.map(p => p.faction).filter(Boolean));
  const canStart = players.length >= 2 && players.every(p => p.faction !== null) && isHost;

  async function handleStart() {
    setStarting(true);
    try {
      await onStartGame();
    } finally {
      setStarting(false);
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0f2213 0%, #0f172a 50%, #1e1438 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: 'var(--font-body)',
    }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🗺️</div>
          <h1 style={{
            fontFamily: 'var(--font-title)',
            fontSize: 24, fontWeight: 900, margin: 0, color: '#f1f5f9',
          }}>
            Vale em Disputa
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ color: '#64748b', fontSize: 13 }}>Código da sala:</span>
            <span style={{
              fontFamily: 'var(--font-title)',
              fontSize: 22, fontWeight: 900, color: '#10b981',
              letterSpacing: '6px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 8, padding: '4px 16px',
            }}>
              {room.code}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(room.code)}
              style={{
                background: 'rgba(255,255,255,0.08)', border: 'none',
                borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                fontSize: 11, color: '#94a3b8',
              }}
            >
              Copiar
            </button>
          </div>
          <p style={{ color: '#475569', fontSize: 12, marginTop: 6 }}>
            Compartilhe o código para outros jogadores entrarem ({players.length}/5 jogadores)
          </p>
        </div>

        {/* Players */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '16px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Jogadores na sala
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map(p => {
              const faction = p.faction ? FACTIONS[p.faction] : null;
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10,
                  border: p.id === myPlayerId ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: faction ? faction.color : '#334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>
                    {faction ? faction.emoji : '❓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                      {p.isHost && <span style={{ fontSize: 10, background: '#d97706', color: '#fff', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>ANFITRIÃO</span>}
                      {p.id === myPlayerId && <span style={{ fontSize: 10, background: '#059669', color: '#fff', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>VOCÊ</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {faction ? faction.name : 'Escolhendo facção...'}
                    </div>
                  </div>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: p.ready ? '#10b981' : '#475569',
                  }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Faction selection */}
        {me && !me.faction && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: '16px',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Escolha sua Facção
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FACTION_LIST.map(faction => {
                const taken = takenFactions.has(faction.id) && me.faction !== faction.id;
                return (
                  <button
                    key={faction.id}
                    onClick={() => !taken && onSelectFaction(faction.id)}
                    disabled={taken}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 14px',
                      background: taken ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${taken ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 10,
                      cursor: taken ? 'not-allowed' : 'pointer',
                      opacity: taken ? 0.4 : 1,
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: faction.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0,
                    }}>
                      {faction.emoji}
                    </div>
                    <div>
                      <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 13, marginBottom: 2 }}>
                        {faction.name} {taken && '(ocupado)'}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 11, lineHeight: 1.4 }}>
                        <span style={{ color: '#86efac' }}>Passivo:</span> {faction.passive}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>
                        <span style={{ color: '#fcd34d' }}>Ativo:</span> {faction.active}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Already selected faction */}
        {me?.faction && (
          <div style={{
            background: `${FACTIONS[me.faction].color}22`,
            border: `1px solid ${FACTIONS[me.faction].color}44`,
            borderRadius: 12, padding: '12px 16px',
            marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 28 }}>{FACTIONS[me.faction].emoji}</span>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 13 }}>
                {FACTIONS[me.faction].name}
              </div>
              <div style={{ color: '#94a3b8', fontSize: 11 }}>Facção selecionada</div>
            </div>
            <button
              onClick={() => onSelectFaction(me.faction!)}
              style={{
                marginLeft: 'auto', background: 'rgba(255,255,255,0.08)',
                border: 'none', borderRadius: 6, padding: '4px 10px',
                fontSize: 11, color: '#94a3b8', cursor: 'pointer',
              }}
            >
              Trocar
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onLeave}
            style={{
              flex: '0 0 auto', padding: '12px 16px',
              background: 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: 12,
              color: '#64748b', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            ← Sair
          </button>

          {isHost && (
            <button
              onClick={handleStart}
              disabled={!canStart || starting}
              style={{
                flex: 1, padding: '14px',
                background: canStart
                  ? 'linear-gradient(135deg, #059669, #065f46)'
                  : 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: 12,
                color: canStart ? '#fff' : '#475569',
                fontSize: 15, fontWeight: 800,
                cursor: canStart ? 'pointer' : 'default',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s',
              }}
            >
              {starting ? 'Iniciando...' : canStart
                ? '▶ Iniciar Partida'
                : `Aguardando todos escolherem facção (${players.filter(p => p.faction).length}/${players.length})`}
            </button>
          )}

          {!isHost && (
            <div style={{
              flex: 1, padding: '14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 12, textAlign: 'center',
              color: '#64748b', fontSize: 13,
            }}>
              Aguardando o anfitrião iniciar a partida...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
