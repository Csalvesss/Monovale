import React, { useEffect, useState } from 'react';
import { ArrowLeft, Copy, Check, Crown, Play, Loader } from 'lucide-react';
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
        <div style={S.loadingWrap}>
          <Loader size={32} color="var(--green)" style={{ animation: 'spin 1s linear infinite' }} />
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
        <button onClick={onLeave} style={S.backBtn}>
          <ArrowLeft size={16} />
          Sair
        </button>
        <div style={S.headerCenter}>
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.15" />
            <path d="M8 28L14 16L20 22L26 12L32 28H8Z" fill="white" fillOpacity="0.9" />
          </svg>
          <span style={S.headerTitle}>Sala de espera</span>
        </div>
        <div style={{ width: 88 }} />
      </div>

      <div style={S.scrollArea}>
        <div style={S.content}>

          {/* Room code card */}
          <div style={S.codeCard}>
            <div style={S.codeLabel}>Código da sala</div>
            <div style={S.codeValue}>{code}</div>
            <button onClick={copyCode} style={S.copyBtn}>
              {copied
                ? <><Check size={14} /> Copiado!</>
                : <><Copy size={14} /> Copiar código</>
              }
            </button>
            <p style={S.codeSub}>Compartilhe com seus amigos para entrarem na partida</p>
          </div>

          {/* Players card */}
          <div style={S.playersCard}>
            <div style={S.cardTitle}>
              <span>Jogadores</span>
              <span style={S.playerCount}>{room.players.length}/8</span>
              <span style={S.waitingDot} />
              <span style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 500, marginLeft: 'auto' }}>
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
                        {isRoomHost && (
                          <span style={S.hostBadge}>
                            <Crown size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> Host
                          </span>
                        )}
                        {isMe && <span style={S.meBadge}>Você</span>}
                      </div>
                      <div style={{ fontSize: 11, color: pawn.color, fontWeight: 600 }}>{pawn.name}</div>
                    </div>

                    {isMe && (
                      <button onClick={() => setEditingPawn(!editingPawn)} style={S.changePawnBtn}>
                        Trocar peão
                      </button>
                    )}
                  </div>
                );
              })}

              {Array.from({ length: Math.max(0, 2 - room.players.length) }, (_, i) => (
                <div key={`empty-${i}`} style={{ ...S.playerRow, opacity: 0.4 }}>
                  <div style={S.playerNum}>?</div>
                  <div style={{ ...S.playerPawn, background: 'var(--card-alt)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="var(--text-light)" strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <div style={S.playerInfo}>
                    <div style={{ ...S.playerName, color: 'var(--text-mid)' }}>Aguardando jogador...</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pawn picker */}
            {editingPawn && (
              <div style={S.pawnPicker}>
                <div style={S.pawnPickerTitle}>Escolha seu peão</div>
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
                          ...(pw.id === myPawn.id ? { background: pw.color, borderColor: pw.color } : {}),
                          ...(taken ? { opacity: 0.2, cursor: 'not-allowed' } : {}),
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
          {error && <div style={S.error}>{error}</div>}

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
              {starting
                ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite', display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Iniciando...</>
                : <><Play size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Iniciar partida ({room.players.length} jogadores)</>
              }
            </button>
          ) : (
            <div style={S.waitingMsg}>
              <Loader size={24} color="var(--text-light)" style={{ animation: 'spin 1.5s linear infinite', marginBottom: 8 }} />
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
    width: '100%',
    height: 56,
    background: 'linear-gradient(90deg, #065F46, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    flexShrink: 0,
    boxShadow: '0 1px 0 rgba(0,0,0,0.15)',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 99,
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: 13,
    color: '#fff',
    cursor: 'pointer',
  },
  headerCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 18,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.2px',
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
  loadingWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 700, color: 'var(--text-mid)' },

  codeCard: {
    background: 'linear-gradient(160deg, #065F46 0%, #047857 50%, #059669 100%)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-lg)',
    padding: '28px 24px',
    textAlign: 'center',
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: 10,
  },
  codeValue: {
    fontFamily: 'var(--font-title)',
    fontSize: 52,
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '10px',
    lineHeight: 1,
    marginBottom: 16,
    textShadow: '0 2px 12px rgba(0,0,0,0.2)',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 18px',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 99,
    fontWeight: 600,
    fontSize: 13,
    color: '#fff',
    cursor: 'pointer',
    marginBottom: 10,
    transition: 'background 0.15s',
    fontFamily: 'var(--font-body)',
  },
  codeSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 500 },

  playersCard: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    padding: '20px',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  playerCount: {
    fontSize: 12,
    fontWeight: 600,
    background: 'var(--card-alt)',
    border: '1px solid var(--border)',
    borderRadius: 99,
    padding: '2px 8px',
    color: 'var(--text-mid)',
  },
  waitingDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--green)',
    animation: 'pulse-ring 1.5s ease infinite',
  },

  playerList: { display: 'flex', flexDirection: 'column', gap: 8 },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    background: 'var(--card-alt)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
  },
  playerRowMe: {
    border: '1.5px solid var(--green)',
    background: 'rgba(5,150,105,0.04)',
  },
  playerNum: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: 'var(--green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-title)',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  playerPawn: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0,
  },
  playerInfo: { flex: 1, minWidth: 0 },
  playerName: {
    fontSize: 14,
    fontWeight: 700,
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
    padding: '2px 8px',
    fontWeight: 700,
    color: 'var(--text)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
  },
  meBadge: {
    fontSize: 11,
    background: 'var(--green)',
    color: '#fff',
    borderRadius: 99,
    padding: '2px 8px',
    fontWeight: 700,
  },
  changePawnBtn: {
    padding: '5px 12px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-mid)',
    cursor: 'pointer',
    flexShrink: 0,
    fontFamily: 'var(--font-body)',
  },

  pawnPicker: {
    marginTop: 12,
    padding: '14px',
    background: 'var(--card-alt)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
  },
  pawnPickerTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-mid)',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  pawnGrid: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  pawnBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    border: '1.5px solid var(--border)',
    background: 'var(--card)',
    fontSize: 22,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'all 0.1s',
  },

  error: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--red)',
    textAlign: 'center',
  },

  startBtn: {
    width: '100%',
    padding: '14px',
    background: 'var(--green-grad)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '0.2px',
  },
  startBtnDisabled: {
    background: 'var(--border)',
    boxShadow: 'none',
    cursor: 'not-allowed',
    color: 'var(--text-mid)',
  },

  waitingMsg: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border)',
    padding: '28px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  waitingMsgText: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-mid)',
  },
};
