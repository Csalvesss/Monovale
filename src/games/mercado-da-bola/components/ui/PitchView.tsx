import React from 'react';
import type { Player } from '../../types';

// ─── Slot positions (4-3-3 inspired) ─────────────────────────────────────────

const SLOT_POSITIONS: Record<string, [number, number][]> = {
  GK:  [[50, 86]],
  LB:  [[12, 68]],
  CB:  [[32, 70], [68, 70]],
  RB:  [[88, 68]],
  CDM: [[50, 56]],
  CM:  [[24, 46], [76, 46]],
  CAM: [[50, 36]],
  LW:  [[14, 20]],
  RW:  [[86, 20]],
  ST:  [[50, 16], [34, 16], [66, 16]],
  CF:  [[50, 13], [33, 13], [67, 13]],
};

function getSlot(pos: string, idx: number): [number, number] {
  const slots = SLOT_POSITIONS[pos] ?? [[50, 50]];
  return slots[idx % slots.length];
}

// ─── OVR from attributes ──────────────────────────────────────────────────────

function computeOVR(p: Player): number {
  const a = p.attributes;
  const vals = [a.pace, a.shooting, a.passing, a.dribbling, a.defending, a.physical,
                ...(a.goalkeeping !== undefined ? [a.goalkeeping] : [])];
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}

// ─── Mood helpers ─────────────────────────────────────────────────────────────

function moodColor(mood: string): string {
  if (mood === 'motivated') return 'var(--ldb-pitch-bright)';
  if (mood === 'happy')     return '#60A5FA';
  if (mood === 'neutral')   return 'var(--ldb-text-muted)';
  return 'var(--ldb-loss)';
}

// ─── Card visual gradient by legendary type ───────────────────────────────────

const VISUAL_BG: Record<string, string> = {
  gold:     'linear-gradient(160deg, #FBF5B7 0%, #D4AF37 45%, #7A5C00 100%)',
  platinum: 'linear-gradient(160deg, #F4F4F4 0%, #B0B8C4 45%, #6B7280 100%)',
  ruby:     'linear-gradient(160deg, #FFB3B3 0%, #DC2626 45%, #7F1D1D 100%)',
  sapphire: 'linear-gradient(160deg, #BFDBFE 0%, #3B82F6 45%, #1E3A8A 100%)',
};

// ─── Player card "totem" ──────────────────────────────────────────────────────

interface DotProps {
  player: Player;
  x: number;
  y: number;
  isSelected: boolean;
  onClick: () => void;
  teamColor: string;
}

function PlayerTotem({ player, x, y, isSelected, onClick, teamColor }: DotProps) {
  const isLegendary = player.rarity === 'legendary';
  const ovr = computeOVR(player);
  const mc  = moodColor(player.mood);
  const vis = player.legendaryCard?.visual ?? 'gold';

  const cardBg = isLegendary
    ? VISUAL_BG[vis] ?? VISUAL_BG.gold
    : isSelected
      ? 'linear-gradient(160deg, rgba(0,255,135,0.25), rgba(5,10,15,0.95))'
      : 'linear-gradient(160deg, rgba(22,36,56,0.95), rgba(5,10,15,0.98))';

  const cardBorder = isSelected
    ? 'var(--ldb-pitch-bright)'
    : isLegendary
      ? 'var(--ldb-gold-mid)'
      : 'rgba(255,255,255,0.18)';

  const textColor = isLegendary ? '#020406' : 'var(--ldb-text)';

  return (
    <div
      onClick={onClick}
      title={player.fullName}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        // Counter-rotate so the card stands perpendicular to the viewer
        transform: 'translateX(-50%) translateY(-50%) rotateX(-38deg)',
        transformOrigin: 'center bottom',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: isSelected ? 20 : 5,
        transition: 'filter 250ms var(--ldb-ease-out)',
        filter: isSelected
          ? 'drop-shadow(0 0 10px rgba(0,255,135,0.9))'
          : isLegendary
            ? 'drop-shadow(0 0 6px rgba(212,175,55,0.7))'
            : 'drop-shadow(0 3px 6px rgba(0,0,0,0.7))',
      }}
    >
      {/* Mini FC-style card */}
      <div style={{
        width: 36,
        height: 46,
        background: cardBg,
        border: `1.5px solid ${cardBorder}`,
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 3px 3px',
        boxShadow: isLegendary
          ? '0 6px 16px rgba(212,175,55,0.45), 0 2px 6px rgba(0,0,0,0.7)'
          : '0 4px 12px rgba(0,0,0,0.7)',
      }}>
        {/* OVR number */}
        <span style={{
          fontFamily: 'var(--ldb-font-display)',
          fontSize: 15,
          lineHeight: 1,
          color: textColor,
          letterSpacing: '-0.5px',
          fontWeight: 900,
        }}>
          {ovr}
        </span>

        {/* Position */}
        <div style={{
          fontSize: 7,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: isLegendary ? 'rgba(2,4,6,0.65)' : 'var(--ldb-text-muted)',
          lineHeight: 1,
        }}>
          {player.position}
        </div>

        {/* Mood dot */}
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: mc,
          boxShadow: `0 0 4px ${mc}`,
        }} />
      </div>

      {/* Name tag */}
      <div style={{
        marginTop: 3,
        background: 'rgba(2,4,6,0.88)',
        border: isSelected ? '1px solid var(--ldb-pitch-bright)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 3,
        padding: '1px 5px',
        fontSize: 8,
        fontWeight: 700,
        color: isSelected ? 'var(--ldb-pitch-bright)' : 'rgba(255,255,255,0.88)',
        whiteSpace: 'nowrap',
        maxWidth: 54,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        backdropFilter: 'blur(4px)',
        letterSpacing: '0.02em',
      }}>
        {player.name.split(' ')[0]}
      </div>
    </div>
  );
}

// ─── Pitch SVG lines ──────────────────────────────────────────────────────────

function PitchLines() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <rect x="3" y="3" width="94" height="94" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.5" />
      <line x1="3" y1="50" x2="97" y2="50" stroke="rgba(255,255,255,0.07)" strokeWidth="0.4" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
      <circle cx="50" cy="50" r="1.2" fill="rgba(255,255,255,0.1)" />
      <rect x="25" y="3" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
      <rect x="38" y="3" width="24" height="6" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
      <rect x="25" y="79" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
      <rect x="38" y="91" width="24" height="6" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  squad: Player[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  teamColor: string;
}

export default function PitchView({ squad, selectedId, onSelect, teamColor }: Props) {
  const posGroups: Record<string, Player[]> = {};
  for (const p of squad.slice(0, 11)) {
    if (!posGroups[p.position]) posGroups[p.position] = [];
    posGroups[p.position].push(p);
  }

  const dots: { player: Player; x: number; y: number }[] = [];
  for (const [pos, players] of Object.entries(posGroups)) {
    players.forEach((p, idx) => {
      const [x, y] = getSlot(pos, idx);
      dots.push({ player: p, x, y });
    });
  }

  return (
    /*
     * Outer wrapper: establishes 3D perspective.
     * paddingTop gives space for the standing cards at the top of the pitch
     * that extend visually "above" the tilted field.
     */
    <div style={{
      perspective: '700px',
      perspectiveOrigin: '50% 90%',
      paddingTop: 48,
      paddingBottom: 8,
    }}>
      <div
        className="ldb-pitch-bg"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '0.72',
          borderRadius: 'var(--ldb-r-lg)',
          /* Tilt the pitch back like a real stadium view */
          transform: 'rotateX(38deg)',
          transformOrigin: 'bottom center',
          transformStyle: 'preserve-3d',
          overflow: 'visible',
        }}
      >
        {/* Field stripes (clipped to pitch bounds) */}
        <div style={{
          position: 'absolute', inset: 0,
          overflow: 'hidden',
          borderRadius: 'var(--ldb-r-lg)',
          backgroundImage: `repeating-linear-gradient(
            180deg,
            transparent,
            transparent 12.5%,
            rgba(0,0,0,0.07) 12.5%,
            rgba(0,0,0,0.07) 25%
          )`,
          pointerEvents: 'none',
        }} />

        <PitchLines />

        {dots.map(({ player, x, y }) => (
          <PlayerTotem
            key={player.id}
            player={player}
            x={x}
            y={y}
            isSelected={selectedId === player.id}
            onClick={() => onSelect(player.id)}
            teamColor={teamColor}
          />
        ))}

        {squad.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.2)', fontSize: 13, fontWeight: 600,
          }}>
            Elenco vazio
          </div>
        )}
      </div>
    </div>
  );
}
