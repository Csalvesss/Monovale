import React, { useEffect, useState } from 'react';
import { PAWNS } from '../data/pawns';
import { useAuth } from '../contexts/AuthContext';
import { listenRoom, updateRoomPlayers, startRoomGame } from '../services/roomService';
import { createGameDoc, saveGameStateNow } from '../services/gameService';
import type { Room, RoomPlayer } from '../services/roomService';
import type { LobbyConfig } from '../types';
import { initGame } from '../logic/gameEngine';

interface Props {
  code: string;
  onGameStart: (gameId: string) => void;
  onLeave: () => void;
}

export default function RoomLobby({ code, onGameStart, onLeave }: Props) {
  const { profile } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [editingPawn, setEditingPawn] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHost = room?.hostUid === profile?.uid;

  useEffect(() => {
    const unsub = listenRoom(code, r => setRoom(r));
    return unsub;
  }, [code]);

  // Host sees game start via room state change; guests are handled by App
  // (App listens to room and redirects when status=playing)

  async function handleChangePawn(pawnId: string) {
    if (!room || !profile) return;
    const updated: RoomPlayer[] = room.players.map(p =>
      p.uid === profile.uid ? { ...p, pawnId } : p
    );
    await updateRoomPlayers(code, updated);
    setEditingPawn(false);
  }

  async function handleStart() {
    if (!room || !profile || !isHost) return;
    if (room.players.length < 2) { setError('Precisa de pelo menos 2 jogadores.'); return; }
    setStarting(true);
    setError('');
    try {
      const config: LobbyConfig = {
        playerCount: room.players.length,
        players: room.players.map(p => ({ name: p.displayName, pawnId: p.pawnId, uid: p.uid })),
        randomOrder: false,
      };
      const gameId = await createGameDoc(profile.uid, room.players.map(p => ({
        uid: p.uid, displayName: p.displayName, pawnId: p.pawnId,
      })));
      const state = initGame(config, gameId);
      await saveGameStateNow(gameId, state);
      await startRoomGame(code, gameId);
      onGameStart(gameId);
    } catch (e: unknown) {
      setError((e as { message?: string }).message ?? 'Erro ao iniciar.');
      setStarting(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!room) {
    return (
      <div style={S.page}>
        <div style={S.center}>
          <div style={{ fontSize: 40 }}>⏳</div>
          <div style={S.loadingText}>Conectando à sala...</div>
        </div>
      </div>
    );
  }

  const myPlayer = room.players.find(p => p.uid === profile?.uid);
  const myPawn = PAWNS.find(p => p.id === myPlayer?.pawnId) ?? PAWNS[0];
  const usedPawns = room.players.map(p => p.pawnId);

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <button onClick={onLeave} style={S.backBtn}>← Sair</button>
        <span style={S.headerTitle}>🎮 SALA DE ESPERA</span>
        <div style={{ width: 80 }} />
      </div>

      <div style={S.scrollArea}>
        <div style={S.content}>

          {/* Room code */}
          <div style={S.codeCard}>
            <div style={S.codeLabel}>Código da Sala</div>
            <div style={S.codeValue}>{code}</div>
            <button onClick={copyCode} style={S.copyBtn}>
              {copied ? '✓ Copiado!' : '📋 Copiar código'}
            </button>
            <p style={S.codeSub}>Compartilhe com seus amigos para entrarem na partida</p>
          </div>

          {/* Players */}
          <div style={S.playersCard}>
            <div style={S.cardTitle}>
              Jogadores ({room.players.length}/8)
              <span style={S.waitingDot} />
              <span style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>
                Aguardando...
              </span>
            </div>

            <div style={S.playerList}>
              {room.players.map((p, i) => {
                const pawn = PAWNS.find(pw => pw.id === p.pawnId) ?? PAWNS[0];
                const isMe = p.uid === profile?.uid;
                const isRoomHost = p.uid === room.hostUid;
                return (
                  <div key={p.uid} style={{ ...S.playerRow, ...(isMe ? S.playerRowMe : {}) }}>
                    <div style={S.playerNum}>{i + 1}</div>
                    <div style={{ ...S.playerPawn, background: pawn.bgColor, border: `2px solid ${pawn.color}` }}>
                      {pawn.emoji}
                    </div>
                    <div style={S.playerInfo}>
                      <div style={S.playerName}>
                        {p.displayName}
                        {isRoomHost && <span style={S.hostBadge}>👑 Host</span>}
                        {isMe && <span style={S.meBadge}>Você</span>}
                      </div>
                      <div style={{ fontSize: 11, color: pawn.color, fontWeight: 700 }}>{pawn.name}</div>
                    </div>

                    {/* Change pawn (own slot) */}
                    {isMe && (
                      <button onClick={() => setEditingPawn(!editingPawn)} style={S.changePawnBtn}>
                        Trocar peão
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 2 - room.players.length) }, (_, i) => (
                <div key={`empty-${i}`} style={{ ...S.playerRow, opacity: 0.4 }}>
                  <div style={S.playerNum}>?</div>
                  <div style={{ ...S.playerPawn, background: 'var(--card-alt)' }}>🎭</div>
                  <div style={S.playerInfo}>
                    <div style={S.playerName}>Aguardando jogador...</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pawn picker */}
            {editingPawn && (
              <div style={S.pawnPicker}>
                <div style={S.pawnPickerTitle}>Escolha seu peão:</div>
                <div style={S.pawnGrid}>
                  {PAWNS.map(pw => {
                    const taken = usedPawns.includes(pw.id) && pw.id !== myPlayer?.pawnId;
                    return (
                      <button
                        key={pw.id}
                        title={pw.name}
                        disabled={taken}
                        onClick={() => handleChangePawn(pw.id)}
                        style={{
                          ...S.pawnBtn,
                          ...(pw.id === myPawn.id ? { background: pw.color, border: `2px solid ${pw.color}` } : {}),
                          ...(taken ? { opacity: 0.3, cursor: 'not-allowed' } : {}),
                        }}
                      >
                        {pw.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={S.error}>{error}</div>
          )}

          {/* CTA */}
          {isHost ? (
            <button
              onClick={handleStart}
              disabled={starting || room.players.length < 2}
              style={{
                ...S.startBtn,
                ...(starting || room.players.length < 2 ? S.startBtnDisabled : {}),
              }}
            >
              {starting ? '⏳ Iniciando...' : `🎲 INICIAR PARTIDA (${room.players.length} jogadores)`}
            </button>
          ) : (
            <div style={S.waitingMsg}>
              <div style={S.waitingMsgEmoji}>⏳</div>
              <div style={S.waitingMsgText}>Aguardando o host iniciar a partida...</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100%',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-body)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    height: 56,
    background: 'var(--gold-grad)',
    boxShadow: '0 3px 0 var(--gold-dark)',
    flexShrink: 0,
  },
  backBtn: {
    padding: '6px 14px',
    background: 'rgba(0,0,0,0.15)',
    border: 'none',
    borderRadius: 99,
    fontWeight: 800,
    fontSize: 13,
    color: 'var(--text)',
    cursor: 'pointer',
    width: 80,
  },
  headerTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 20,
    color: 'var(--text)',
    letterSpacing: '1px',
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px 40px',
  },
  content: {
    width: '100%',
    maxWidth: 520,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--text-mid)' },

  codeCard: {
    background: 'var(--gold-grad)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: '0 6px 0 var(--gold-dark), 0 8px 24px rgba(0,0,0,0.1)',
    padding: '24px',
    textAlign: 'center',
  },
  codeLabel: { fontSize: 12, fontWeight: 800, color: 'var(--text)', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 },
  codeValue: {
    fontFamily: 'var(--font-title)',
    fontSize: 52,
    color: 'var(--text)',
    letterSpacing: '8px',
    textShadow: '2px 2px 0 rgba(255,255,255,0.4)',
    lineHeight: 1,
    marginBottom: 12,
  },
  copyBtn: {
    padding: '8px 20px',
    background: 'rgba(0,0,0,0.15)',
    border: 'none',
    borderRadius: 99,
    fontWeight: 800,
    fontSize: 13,
    color: 'var(--text)',
    cursor: 'pointer',
    marginBottom: 10,
  },
  codeSub: { fontSize: 12, color: 'var(--text)', opacity: 0.65, margin: 0, fontWeight: 600 },

  playersCard: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '3px solid var(--border-gold)',
    boxShadow: 'var(--shadow-lg)',
    padding: '20px 20px 16px',
  },
  cardTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 20,
    color: 'var(--text)',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  waitingDot: {
    width: 8, height: 8,
    borderRadius: '50%',
    background: 'var(--green)',
    animation: 'pulse-gold 1.5s ease infinite',
  },

  playerList: { display: 'flex', flexDirection: 'column', gap: 8 },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    background: 'var(--card-alt)',
    borderRadius: 'var(--radius)',
    border: '2px solid var(--border)',
  },
  playerRowMe: {
    border: '2px solid var(--gold)',
    background: '#fefbef',
  },
  playerNum: {
    width: 24, height: 24,
    borderRadius: '50%',
    background: 'var(--gold-grad)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    color: 'var(--text)',
    flexShrink: 0,
    boxShadow: '0 2px 0 var(--gold-dark)',
  },
  playerPawn: {
    width: 40, height: 40,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
  },
  playerInfo: { flex: 1, minWidth: 0 },
  playerName: {
    fontSize: 14,
    fontWeight: 800,
    color: 'var(--text)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  hostBadge: {
    fontSize: 11,
    background: 'var(--gold-grad)',
    borderRadius: 99,
    padding: '1px 8px',
    fontWeight: 700,
  },
  meBadge: {
    fontSize: 11,
    background: 'var(--green)',
    color: '#fff',
    borderRadius: 99,
    padding: '1px 8px',
    fontWeight: 700,
  },
  changePawnBtn: {
    padding: '5px 12px',
    background: 'var(--card)',
    border: '2px solid var(--border)',
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 800,
    color: 'var(--text-mid)',
    cursor: 'pointer',
    flexShrink: 0,
  },

  pawnPicker: {
    marginTop: 12,
    padding: '12px',
    background: 'var(--card-alt)',
    borderRadius: 'var(--radius)',
    border: '2px solid var(--border)',
  },
  pawnPickerTitle: { fontSize: 12, fontWeight: 800, color: 'var(--text-mid)', marginBottom: 8, textTransform: 'uppercase' },
  pawnGrid: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  pawnBtn: {
    width: 44, height: 44,
    borderRadius: 12,
    border: '2px solid var(--border)',
    background: 'var(--white)',
    fontSize: 24,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0,
    transition: 'all 0.1s',
  },

  error: {
    background: '#fef2f2',
    border: '2px solid #fecaca',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--red)',
    textAlign: 'center',
  },

  startBtn: {
    width: '100%',
    padding: '18px',
    background: 'var(--green-grad)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'var(--font-title)',
    fontSize: 20,
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: '0 5px 0 var(--green-dark)',
  },
  startBtnDisabled: {
    background: 'linear-gradient(135deg, #b0b0b0, #909090)',
    boxShadow: '0 5px 0 #606060',
    cursor: 'not-allowed',
  },

  waitingMsg: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '3px solid var(--border-gold)',
    padding: '24px',
    textAlign: 'center',
  },
  waitingMsgEmoji: { fontSize: 36, marginBottom: 8 },
  waitingMsgText: {
    fontFamily: 'var(--font-title)',
    fontSize: 20,
    color: 'var(--text-mid)',
  },
};
