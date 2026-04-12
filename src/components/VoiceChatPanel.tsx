import React, {
  useEffect, useRef, useState, useCallback, KeyboardEvent,
} from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Users } from 'lucide-react';
import { VoicePeer } from '../services/voiceChatService';
import { ChatMessage, listenChatMessages, sendChatMessage } from '../services/textChatService';

// ─── Helper: coloured avatar from initials ────────────────────────────────────

const AVATAR_COLORS = [
  '#059669', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F59E0B', '#10B981', '#EF4444', '#0EA5E9',
];

function avatarColor(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = (hash * 31 + uid.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  roomCode: string;
  myUid: string;
  myDisplayName: string;
  /** Whether the local user has joined the voice channel */
  voiceJoined: boolean;
  voiceMuted: boolean;
  voiceLocalSpeaking: boolean;
  voiceOutputVolume: number;
  peers: VoicePeer[];
  onJoinVoice: () => void;
  onLeaveVoice: () => void;
  onToggleMute: () => void;
  onTogglePeerMute: (uid: string) => void;
  onSetVolume: (vol: number) => void;
  voiceError: string | null;
  voiceLoading: boolean;
  onClearVoiceError: () => void;
}

type Tab = 'voice' | 'chat';

// ─── Component ───────────────────────────────────────────────────────────────

export default function VoiceChatPanel({
  roomCode, myUid, myDisplayName,
  voiceJoined, voiceMuted, voiceLocalSpeaking, voiceOutputVolume,
  peers, onJoinVoice, onLeaveVoice, onToggleMute, onTogglePeerMute, onSetVolume,
  voiceError, voiceLoading, onClearVoiceError,
}: Props) {
  const [tab, setTab] = useState<Tab>('voice');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to chat messages
  useEffect(() => {
    return listenChatMessages(roomCode, setMessages);
  }, [roomCode]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (tab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, tab]);

  // Scroll on tab switch to chat
  useEffect(() => {
    if (tab === 'chat') {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 0);
    }
  }, [tab]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || sending) return;
    setSending(true);
    try {
      await sendChatMessage(roomCode, myUid, myDisplayName, inputText);
      setInputText('');
      inputRef.current?.focus();
    } catch (e) {
      console.error('[TextChat] send error:', e);
    } finally {
      setSending(false);
    }
  }, [inputText, sending, roomCode, myUid, myDisplayName]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Unread badge: count messages received after switching away from chat tab
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const unread = tab !== 'chat' ? Math.max(0, messages.length - lastSeenCount) : 0;
  useEffect(() => {
    if (tab === 'chat') setLastSeenCount(messages.length);
  }, [tab, messages.length]);

  // Total participants (me + peers in voice)
  const voiceParticipantsCount = voiceJoined ? peers.length + 1 : 0;

  return (
    <div style={S.root}>
      {/* ── Tab bar ── */}
      <div style={S.tabBar}>
        <button
          onClick={() => setTab('voice')}
          style={{ ...S.tabBtn, ...(tab === 'voice' ? S.tabActive : S.tabInactive) }}
        >
          <Users size={13} style={{ flexShrink: 0 }} />
          Voz
          {voiceParticipantsCount > 0 && (
            <span style={S.countBadge}>{voiceParticipantsCount}</span>
          )}
        </button>
        <button
          onClick={() => setTab('chat')}
          style={{ ...S.tabBtn, ...(tab === 'chat' ? S.tabActive : S.tabInactive) }}
        >
          <MessageSquare size={13} style={{ flexShrink: 0 }} />
          Chat
          {unread > 0 && <span style={S.unreadBadge}>{unread > 9 ? '9+' : unread}</span>}
        </button>
      </div>

      {/* ══════════════════════ VOICE TAB ══════════════════════════════════════ */}
      {tab === 'voice' && (
        <div style={S.tabContent}>

          {/* Error toast */}
          {voiceError && (
            <div style={S.errorBar}>
              <span>{voiceError}</span>
              <button onClick={onClearVoiceError} style={S.errorClose}>×</button>
            </div>
          )}

          {!voiceJoined ? (
            /* ── Not joined ── */
            <div style={S.notJoined}>
              <div style={S.micIcon}>
                <Mic size={28} color="#059669" />
              </div>
              <div style={S.notJoinedTitle}>Canal de Voz</div>
              <div style={S.notJoinedSub}>
                Entre para falar com os outros jogadores em tempo real.
              </div>
              <button
                onClick={onJoinVoice}
                disabled={voiceLoading}
                style={{ ...S.joinBtn, opacity: voiceLoading ? 0.6 : 1 }}
              >
                {voiceLoading ? 'Conectando…' : '🎤 Entrar no canal'}
              </button>
            </div>
          ) : (
            /* ── Joined ── */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

              {/* Controls row */}
              <div style={S.controls}>
                <button
                  onClick={onToggleMute}
                  title={voiceMuted ? 'Desmutar microfone' : 'Mutar microfone'}
                  style={{
                    ...S.ctrlBtn,
                    background: voiceMuted ? 'rgba(220,38,38,0.12)' : 'rgba(5,150,105,0.12)',
                    border: `1.5px solid ${voiceMuted ? 'rgba(220,38,38,0.3)' : 'rgba(5,150,105,0.3)'}`,
                    color: voiceMuted ? '#DC2626' : '#059669',
                  }}
                >
                  {voiceMuted ? <MicOff size={14} /> : <Mic size={14} />}
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    {voiceMuted ? 'Mutado' : 'Ativo'}
                  </span>
                </button>

                {/* Volume slider */}
                <div style={S.volumeRow}>
                  <Volume2 size={13} color="var(--text-mid)" style={{ flexShrink: 0 }} />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={voiceOutputVolume}
                    onChange={e => onSetVolume(Number(e.target.value))}
                    title={`Volume: ${Math.round(voiceOutputVolume * 100)}%`}
                    style={S.volumeSlider}
                  />
                  {voiceOutputVolume === 0 && (
                    <VolumeX size={13} color="#DC2626" style={{ flexShrink: 0 }} />
                  )}
                </div>

                <button
                  onClick={onLeaveVoice}
                  title="Sair do canal de voz"
                  style={S.leaveBtn}
                >
                  Sair
                </button>
              </div>

              {/* Participant list */}
              <div style={S.peerList}>
                {/* Local user (me) */}
                <PeerRow
                  uid={myUid}
                  displayName={`${myDisplayName} (você)`}
                  muted={voiceMuted}
                  speaking={voiceLocalSpeaking}
                  connected
                  locallyMuted={false}
                  isMe
                  onToggleMute={() => {}}
                />

                {/* Remote peers */}
                {peers.map(p => (
                  <PeerRow
                    key={p.uid}
                    uid={p.uid}
                    displayName={p.displayName}
                    muted={p.muted}
                    speaking={p.speaking}
                    connected={p.connected}
                    locallyMuted={p.locallyMuted}
                    isMe={false}
                    onToggleMute={() => onTogglePeerMute(p.uid)}
                  />
                ))}

                {peers.length === 0 && (
                  <div style={S.noPeers}>
                    Aguardando outros jogadores entrarem no canal…
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════ CHAT TAB ═══════════════════════════════════════ */}
      {tab === 'chat' && (
        <div style={S.chatRoot}>
          {/* Messages area */}
          <div style={S.msgList}>
            {messages.length === 0 && (
              <div style={S.noMsgs}>Nenhuma mensagem ainda. Seja o primeiro a escrever!</div>
            )}
            {messages.map((msg, idx) => {
              const isMe = msg.uid === myUid;
              const prevMsg = messages[idx - 1];
              const showName = !prevMsg || prevMsg.uid !== msg.uid;
              return (
                <div key={msg.id} style={{ ...S.msgBubbleWrap, alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  {showName && (
                    <div style={{ ...S.msgMeta, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <span style={{ ...S.msgSender, color: avatarColor(msg.uid) }}>
                        {isMe ? 'Você' : msg.displayName}
                      </span>
                      <span style={S.msgTime}>{formatTime(msg.timestamp)}</span>
                    </div>
                  )}
                  <div style={{
                    ...S.msgBubble,
                    background: isMe ? '#059669' : 'var(--surface)',
                    color: isMe ? '#fff' : 'var(--text)',
                    borderBottomRightRadius: isMe ? 4 : 12,
                    borderBottomLeftRadius: isMe ? 12 : 4,
                    border: isMe ? 'none' : '1px solid var(--border)',
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={S.inputRow}>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mensagem…"
              maxLength={500}
              style={S.chatInput}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || sending}
              style={{
                ...S.sendBtn,
                opacity: !inputText.trim() || sending ? 0.45 : 1,
                cursor: !inputText.trim() || sending ? 'not-allowed' : 'pointer',
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PeerRow sub-component ────────────────────────────────────────────────────

interface PeerRowProps {
  uid: string;
  displayName: string;
  muted: boolean;
  speaking: boolean;
  connected: boolean;
  locallyMuted: boolean;
  isMe: boolean;
  onToggleMute: () => void;
}

function PeerRow({ uid, displayName, muted, speaking, connected, locallyMuted, isMe, onToggleMute }: PeerRowProps) {
  const color = avatarColor(uid);
  const isSpeaking = speaking && !muted && !locallyMuted;

  return (
    <div style={S.peerRow}>
      {/* Avatar with speaking ring */}
      <div style={{
        ...S.avatarWrap,
        boxShadow: isSpeaking
          ? `0 0 0 2px #fff, 0 0 0 4px ${color}, 0 0 12px ${color}88`
          : '0 0 0 2px transparent',
        transition: 'box-shadow 0.15s',
      }}>
        <div style={{ ...S.avatar, background: color }}>
          {initials(displayName)}
        </div>
      </div>

      {/* Name + status */}
      <div style={S.peerInfo}>
        <span style={S.peerName}>{displayName}</span>
        <span style={{ ...S.peerStatus, color: getStatusColor(connected, muted, locallyMuted) }}>
          {getStatusLabel(connected, muted, locallyMuted, isMe)}
        </span>
      </div>

      {/* Indicators + per-peer mute button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
        {muted && !isMe && (
          <span title="Microfone mutado">
            <MicOff size={12} color="#94A3B8" />
          </span>
        )}
        {!isMe && (
          <button
            onClick={onToggleMute}
            title={locallyMuted ? 'Desmutar este participante' : 'Mutar este participante localmente'}
            style={{
              ...S.peerMuteBtn,
              background: locallyMuted ? 'rgba(220,38,38,0.1)' : 'transparent',
              border: locallyMuted ? '1px solid rgba(220,38,38,0.25)' : '1px solid transparent',
              color: locallyMuted ? '#DC2626' : '#94A3B8',
            }}
          >
            {locallyMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}

function getStatusColor(connected: boolean, muted: boolean, locallyMuted: boolean): string {
  if (locallyMuted) return '#DC2626';
  if (muted) return '#94A3B8';
  if (!connected) return '#F59E0B';
  return '#10B981';
}

function getStatusLabel(connected: boolean, muted: boolean, locallyMuted: boolean, isMe: boolean): string {
  if (locallyMuted && !isMe) return 'silenciado por você';
  if (muted) return 'mutado';
  if (!connected) return 'conectando…';
  return 'conectado';
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex', flexDirection: 'column',
    height: '100%', overflow: 'hidden',
    background: 'var(--card, #fff)',
    borderRadius: 'var(--radius, 10px)',
    border: '1px solid var(--border)',
    fontFamily: 'var(--font-body)',
  },

  // Tab bar
  tabBar: {
    display: 'flex', flexShrink: 0,
    borderBottom: '1px solid var(--border)',
    background: 'var(--card-alt, #F8FAFC)',
    borderRadius: 'var(--radius, 10px) var(--radius, 10px) 0 0',
  },
  tabBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 5, padding: '9px 4px',
    border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
    fontFamily: 'var(--font-body)',
    borderRadius: 0, transition: 'color 0.15s',
    position: 'relative',
  },
  tabActive: {
    color: '#059669',
    background: 'var(--card, #fff)',
    boxShadow: 'inset 0 -2px 0 #059669',
  },
  tabInactive: {
    color: 'var(--text-mid, #475569)',
    background: 'transparent',
  },
  countBadge: {
    fontSize: 10, fontWeight: 800,
    background: 'rgba(5,150,105,0.15)',
    color: '#059669',
    borderRadius: 99, padding: '1px 5px',
  },
  unreadBadge: {
    fontSize: 10, fontWeight: 800,
    background: '#DC2626',
    color: '#fff',
    borderRadius: 99, padding: '1px 5px',
  },

  // Tab content wrapper
  tabContent: {
    flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
  },

  // Error bar
  errorBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#FEF2F2', borderBottom: '1px solid #FECACA',
    padding: '8px 12px', fontSize: 12, color: '#DC2626', fontWeight: 600,
    flexShrink: 0,
  },
  errorClose: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#DC2626', fontSize: 16, lineHeight: 1, padding: '0 0 0 8px',
  },

  // Not joined state
  notJoined: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '24px 16px', textAlign: 'center',
  },
  micIcon: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'rgba(5,150,105,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  notJoinedTitle: {
    fontSize: 15, fontWeight: 800, color: 'var(--text)',
  },
  notJoinedSub: {
    fontSize: 12, color: 'var(--text-mid)', fontWeight: 500,
    lineHeight: 1.55, maxWidth: 200,
  },
  joinBtn: {
    marginTop: 8,
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    color: '#fff', border: 'none', borderRadius: 99,
    fontSize: 13, fontWeight: 800, cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    boxShadow: '0 3px 0 #047857',
    transition: 'opacity 0.15s',
  },

  // Controls row
  controls: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 10px', borderBottom: '1px solid var(--border)',
    background: 'var(--card-alt, #F8FAFC)', flexShrink: 0,
  },
  ctrlBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '5px 10px', borderRadius: 99,
    cursor: 'pointer', fontSize: 11, fontWeight: 700,
    fontFamily: 'var(--font-body)', transition: 'background 0.15s',
  },
  volumeRow: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 4,
  },
  volumeSlider: {
    flex: 1, height: 3, accentColor: '#059669', cursor: 'pointer',
  },
  leaveBtn: {
    padding: '5px 10px',
    background: 'rgba(220,38,38,0.1)',
    color: '#DC2626',
    border: '1.5px solid rgba(220,38,38,0.25)',
    borderRadius: 99,
    fontSize: 11, fontWeight: 800,
    cursor: 'pointer', fontFamily: 'var(--font-body)',
  },

  // Peer list
  peerList: {
    flex: 1, overflowY: 'auto', padding: '6px 0',
  },
  peerRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 10px', transition: 'background 0.12s',
  },
  avatarWrap: {
    borderRadius: '50%', flexShrink: 0,
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.5px',
    flexShrink: 0,
  },
  peerInfo: {
    display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0,
  },
  peerName: {
    fontSize: 12, fontWeight: 700, color: 'var(--text)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  peerStatus: {
    fontSize: 10, fontWeight: 600,
  },
  peerMuteBtn: {
    width: 22, height: 22, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0, transition: 'background 0.12s',
  },
  noPeers: {
    padding: '20px 16px', fontSize: 11, color: 'var(--text-mid)',
    textAlign: 'center', fontStyle: 'italic', lineHeight: 1.6,
  },

  // Chat tab
  chatRoot: {
    flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  msgList: {
    flex: 1, overflowY: 'auto',
    padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2,
  },
  noMsgs: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, color: 'var(--text-mid)', textAlign: 'center', padding: '24px 16px',
    fontStyle: 'italic', lineHeight: 1.6,
  },
  msgBubbleWrap: {
    display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  msgMeta: {
    display: 'flex', alignItems: 'baseline', gap: 5,
  },
  msgSender: {
    fontSize: 10, fontWeight: 800,
  },
  msgTime: {
    fontSize: 9, color: 'var(--text-light)', fontWeight: 500,
  },
  msgBubble: {
    padding: '6px 10px',
    borderRadius: 12,
    fontSize: 12, fontWeight: 500,
    lineHeight: 1.5, wordBreak: 'break-word',
  },
  inputRow: {
    display: 'flex', gap: 6, padding: '8px 10px',
    borderTop: '1px solid var(--border)',
    background: 'var(--card-alt, #F8FAFC)',
    flexShrink: 0,
  },
  chatInput: {
    flex: 1, padding: '8px 10px',
    background: 'var(--surface, #fff)',
    border: '1.5px solid var(--border)',
    borderRadius: 8, fontSize: 12, fontWeight: 500,
    color: 'var(--text)', outline: 'none',
    fontFamily: 'var(--font-body)',
  },
  sendBtn: {
    width: 32, height: 32,
    background: 'linear-gradient(135deg, #10B981, #059669)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 16, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'opacity 0.15s',
  },
};
