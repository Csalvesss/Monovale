import React from 'react';
import type { Player } from '../../types/game';

interface Props {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
}

const STAT_LABELS: [keyof import('../../types/game').Attributes, string][] = [
  ['pace',      'PAC'],
  ['shooting',  'SHO'],
  ['passing',   'PAS'],
  ['dribbling', 'DRI'],
  ['defending', 'DEF'],
  ['physical',  'PHY'],
];

const WIDTH_MAP = { sm: 128, md: 192, lg: 256 };

function getRarityColor(rarity: Player['rarity']) {
  if (rarity === 'legendary') return '#fbbf24';
  if (rarity === 'rare')      return '#3b82f6';
  return '#475569';
}

function getStarColor(rarity: Player['rarity']) {
  if (rarity === 'legendary') return '#fbbf24';
  if (rarity === 'rare')      return '#60a5fa';
  return '#94a3b8';
}

export default function PlayerCard({ player, size = 'md', onClick, selected }: Props) {
  const width = WIDTH_MAP[size];
  const rarityColor = getRarityColor(player.rarity);
  const starColor   = getStarColor(player.rarity);
  const isLegendary = player.rarity === 'legendary';

  return (
    <div
      className={`lenda-trading-card${isLegendary ? ' legendary' : player.rarity === 'rare' ? ' rare' : ''}`}
      style={{
        width,
        flexShrink: 0,
        outline: selected ? `2px solid var(--wc-gold)` : 'none',
        outlineOffset: 3,
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: size === 'sm' ? '6px 8px' : '8px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        zIndex: 2,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
      }}>
        {/* Stars */}
        <div style={{ display: 'flex', gap: 1 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{
              fontSize: size === 'sm' ? 8 : 10,
              color: i < player.stars ? starColor : 'rgba(255,255,255,0.15)',
            }}>★</span>
          ))}
        </div>
        {/* Position */}
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: size === 'sm' ? 11 : 13,
          letterSpacing: '0.05em',
          color: rarityColor,
          background: 'rgba(0,0,0,0.5)',
          padding: '1px 5px',
          borderRadius: 4,
        }}>
          {player.position}
        </span>
      </div>

      {/* Photo */}
      <div style={{
        width: '100%',
        height: size === 'sm' ? '55%' : '58%',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <img
          src={player.photo}
          alt={player.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(20%)',
            transition: 'filter 0.5s ease, transform 0.3s ease',
            display: 'block',
          }}
          onMouseEnter={e => {
            (e.target as HTMLImageElement).style.filter = 'grayscale(0%)';
            (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLImageElement).style.filter = 'grayscale(20%)';
            (e.target as HTMLImageElement).style.transform = 'scale(1)';
          }}
          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${player.name}&background=1e293b&color=fbbf24&size=200`; }}
        />
        {isLegendary && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '40%',
            background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.8))',
          }} />
        )}
      </div>

      {/* Name + Info */}
      <div style={{
        padding: size === 'sm' ? '4px 8px' : '6px 10px',
        textAlign: 'center',
        borderTop: `1px solid ${rarityColor}22`,
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: size === 'sm' ? 11 : size === 'md' ? 14 : 17,
          letterSpacing: '0.04em',
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {player.name}
        </div>
        <div style={{ fontSize: size === 'sm' ? 8 : 10, color: 'var(--text-muted)', marginTop: 1 }}>
          {player.nationality} · {player.age}a
        </div>
      </div>

      {/* Stats grid */}
      {size !== 'sm' && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 2, padding: size === 'lg' ? '6px 10px 10px' : '4px 8px 8px',
        }}>
          {STAT_LABELS.map(([key, label]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: size === 'lg' ? 16 : 13,
                letterSpacing: '0.03em',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}>
                {player.attributes[key]}
              </div>
              <div style={{ fontSize: 7, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom border accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3,
        background: rarityColor,
        opacity: 0.8,
      }} />
    </div>
  );
}
