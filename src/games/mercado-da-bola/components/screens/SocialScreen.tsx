import React, { useState } from 'react';
import { useMB } from '../../store/gameStore';
import type { NewsPost } from '../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Filter = 'all' | 'instagram' | 'twitter' | 'report' | 'myteam';

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`;
  return String(n);
}

function timeAgo(timestamp: number): string {
  const diff = Math.max(0, Date.now() - timestamp);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}sem`;
}

const PLATFORM_ICON: Record<string, string> = {
  instagram: '📸',
  twitter:   '🐦',
  report:    '📰',
};

// ─── Card variants ────────────────────────────────────────────────────────────

function InstagramCard({ post }: { post: NewsPost }) {
  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      background: '#1e293b',
      border: '1px solid #334155',
    }}>
      {/* Gradient header bar */}
      <div style={{
        height: 6,
        background: 'linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045)',
      }} />

      {/* Author row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px 8px',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #833ab4, #fd1d1d)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>
          📸
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9' }}>{post.author}</div>
          {post.authorHandle && (
            <div style={{ fontSize: 10, color: '#64748b' }}>{post.authorHandle}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {post.isMyTeam && (
            <span style={{
              fontSize: 9, fontWeight: 800, background: '#2563eb',
              color: '#fff', padding: '2px 7px', borderRadius: 99,
            }}>
              Meu Time
            </span>
          )}
          <span style={{ fontSize: 10, color: '#475569' }}>{timeAgo(post.timestamp)}</span>
        </div>
      </div>

      {/* Image emoji */}
      {post.imageEmoji && (
        <div style={{
          fontSize: 64,
          textAlign: 'center',
          padding: '12px 0',
          background: '#0f172a',
          lineHeight: 1.2,
        }}>
          {post.imageEmoji}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '10px 14px', fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
        {post.content}
      </div>

      {/* Engagement */}
      <div style={{
        padding: '8px 14px 14px',
        display: 'flex',
        gap: 16,
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>❤️ {formatCount(post.likes)}</span>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>💬 {formatCount(post.comments)}</span>
      </div>
    </div>
  );
}

function TwitterCard({ post }: { post: NewsPost }) {
  return (
    <div style={{
      borderRadius: 14,
      background: '#1e293b',
      border: '1px solid #334155',
      padding: '14px 16px',
    }}>
      {/* Author row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 8,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: '#1DA1F233',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>
          🐦
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9' }}>{post.author}</span>
            {post.authorHandle && (
              <span style={{ fontSize: 11, color: '#475569' }}>{post.authorHandle}</span>
            )}
            {post.isMyTeam && (
              <span style={{
                fontSize: 9, fontWeight: 800, background: '#2563eb',
                color: '#fff', padding: '2px 7px', borderRadius: 99,
              }}>
                Meu Time
              </span>
            )}
            <span style={{ fontSize: 10, color: '#475569', marginLeft: 'auto' }}>
              {timeAgo(post.timestamp)}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginTop: 4 }}>
            {post.imageEmoji && <span style={{ marginRight: 6 }}>{post.imageEmoji}</span>}
            {post.content}
          </div>
        </div>
      </div>

      {/* Engagement */}
      <div style={{ display: 'flex', gap: 16, paddingLeft: 42 }}>
        <span style={{ fontSize: 11, color: '#64748b' }}>❤️ {formatCount(post.likes)}</span>
        <span style={{ fontSize: 11, color: '#64748b' }}>💬 {formatCount(post.comments)}</span>
      </div>
    </div>
  );
}

function ReportCard({ post }: { post: NewsPost }) {
  return (
    <div style={{
      borderRadius: 14,
      background: '#1e293b',
      border: '1px solid #334155',
      borderLeft: '4px solid #3b82f6',
      padding: '14px 16px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
      }}>
        <span style={{ fontSize: 16 }}>📰</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {post.author}
        </span>
        {post.isMyTeam && (
          <span style={{
            fontSize: 9, fontWeight: 800, background: '#2563eb',
            color: '#fff', padding: '2px 7px', borderRadius: 99,
          }}>
            Meu Time
          </span>
        )}
        <span style={{ fontSize: 10, color: '#475569', marginLeft: 'auto' }}>
          {timeAgo(post.timestamp)}
        </span>
      </div>

      {/* Content */}
      <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.65, marginBottom: 10 }}>
        {post.imageEmoji && (
          <span style={{ fontSize: 20, marginRight: 8, verticalAlign: 'middle' }}>{post.imageEmoji}</span>
        )}
        {post.content}
      </div>

      {/* Engagement */}
      <div style={{ display: 'flex', gap: 14 }}>
        <span style={{ fontSize: 11, color: '#64748b' }}>❤️ {formatCount(post.likes)}</span>
        <span style={{ fontSize: 11, color: '#64748b' }}>💬 {formatCount(post.comments)}</span>
      </div>
    </div>
  );
}

function NewsCard({ post }: { post: NewsPost }) {
  if (post.platform === 'instagram') return <InstagramCard post={post} />;
  if (post.platform === 'twitter')   return <TwitterCard post={post} />;
  return <ReportCard post={post} />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SocialScreen() {
  const { state } = useMB();
  const { save } = state;

  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  if (!save) return null;

  const followerCount = save.stadium.mediaLevel * 1000 + 5000;

  const filters: { key: Filter; label: string; icon: string }[] = [
    { key: 'all',       label: 'Tudo',       icon: '🌐' },
    { key: 'instagram', label: 'Instagram',  icon: '📸' },
    { key: 'twitter',   label: 'Twitter',    icon: '🐦' },
    { key: 'report',    label: 'Reportagem', icon: '📰' },
    { key: 'myteam',    label: 'Meu Time',   icon: '🏆' },
  ];

  const filtered = save.newsFeed.filter(post => {
    if (activeFilter === 'all')       return true;
    if (activeFilter === 'myteam')    return post.isMyTeam;
    return post.platform === activeFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '16px 16px 0',
        background: 'linear-gradient(180deg, #1e293b, #0f172a)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              📱 Feed Social
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              {formatCount(followerCount)} seguidores · Nível de mídia {save.stadium.mediaLevel}
            </div>
          </div>
          <div style={{
            background: '#1e3a5f',
            border: '1px solid #1d4ed8',
            borderRadius: 10,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 800,
            color: '#60a5fa',
          }}>
            {PLATFORM_ICON['instagram']} {PLATFORM_ICON['twitter']} {PLATFORM_ICON['report']}
          </div>
        </div>

        {/* Filter buttons */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 12,
        }}>
          {filters.map(f => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  flexShrink: 0,
                  padding: '7px 14px',
                  borderRadius: 99,
                  border: active ? '1.5px solid #3b82f6' : '1.5px solid #334155',
                  background: active ? 'rgba(59,130,246,0.2)' : '#1e293b',
                  color: active ? '#60a5fa' : '#94a3b8',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {f.icon} {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Feed ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#475569',
            fontSize: 14,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            Nenhuma postagem nesta categoria ainda.
          </div>
        ) : (
          filtered.map(post => (
            <NewsCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
