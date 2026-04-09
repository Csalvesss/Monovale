import React from 'react';
import type { Team } from '../../types';
import { cn } from '../../../../lib/utils';

interface Props {
  team: Team;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Shield outer path per league (48-wide, 52-tall viewBox)
const SHIELD_PATHS: Record<string, string> = {
  brasileirao: 'M24 2L46 14V30C46 42 36 48 24 50C12 48 2 42 2 30V14Z',
  premier:     'M4 4H44V30C44 42 35 48 24 50C13 48 4 42 4 30V4Z',
  laliga:      'M4 4H44V26L24 46L4 26V4Z',
  seriea:      'M6 8L24 2L42 8V32C42 44 34 48 24 50C14 48 6 44 6 32V8Z',
  bundesliga:  'M24 2L46 14V36L24 48L2 36V14Z',
  ligue1:      'M8 4H40V28C40 40 33 46 24 48C15 46 8 40 8 28V4Z',
};

// Text Y-center per league shape
const TEXT_Y: Record<string, number> = {
  brasileirao: 30,
  premier:     28,
  laliga:      22,
  seriea:      30,
  bundesliga:  26,
  ligue1:      28,
};

// Internal decoration based on team.badge field
function Decor({
  decor, secondary, clipId,
}: {
  decor: string;
  secondary: string;
  clipId: string;
}) {
  const fill = secondary;
  const clip = `url(#${clipId})`;
  switch (decor) {
    case 'stripe':
      return <rect x="0" y="21" width="48" height="10" fill={fill} fillOpacity="0.55" clipPath={clip} />;
    case 'sash':
      return <polygon points="0,16 48,4 48,18 0,30" fill={fill} fillOpacity="0.5" clipPath={clip} />;
    case 'chevron':
      return <polygon points="0,18 24,34 48,18 48,28 24,44 0,28" fill={fill} fillOpacity="0.5" clipPath={clip} />;
    case 'thirds':
      return <rect x="16" y="0" width="16" height="52" fill={fill} fillOpacity="0.45" clipPath={clip} />;
    case 'quarters':
      return (
        <>
          <rect x="24" y="0"  width="24" height="26" fill={fill} fillOpacity="0.5" clipPath={clip} />
          <rect x="0"  y="26" width="24" height="26" fill={fill} fillOpacity="0.5" clipPath={clip} />
        </>
      );
    case 'cross':
      return (
        <>
          <rect x="0"  y="21" width="48" height="8" fill={fill} fillOpacity="0.5" clipPath={clip} />
          <rect x="20" y="0"  width="8" height="52" fill={fill} fillOpacity="0.5" clipPath={clip} />
        </>
      );
    case 'diagonal':
      return <polygon points="0,52 0,0 28,0" fill={fill} fillOpacity="0.35" clipPath={clip} />;
    default: // plain
      return null;
  }
}

export default function TeamBadge({ team, size = 40, className, style }: Props) {
  const shortCode = (team.shortName ?? team.name).substring(0, 3).toUpperCase();
  const shieldPath = SHIELD_PATHS[team.leagueId] ?? SHIELD_PATHS.brasileirao;
  const textY      = TEXT_Y[team.leagueId] ?? 28;
  const clipId     = `bc-${team.id}`;
  const gradId     = `bg-${team.id}`;

  const h = team.leagueId === 'laliga' ? 50 : 54;
  const scaledH = Math.round(size * h / 48);

  return (
    <svg
      width={size}
      height={scaledH}
      viewBox={`0 0 48 ${h}`}
      className={cn('shrink-0', className)}
      style={style}
      aria-label={team.name}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={shieldPath} />
        </clipPath>
        <linearGradient id={gradId} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor={team.primaryColor} stopOpacity="1" />
          <stop offset="100%" stopColor={team.primaryColor} stopOpacity="0.72" />
        </linearGradient>
      </defs>

      {/* Base fill */}
      <path d={shieldPath} fill={`url(#${gradId})`} />

      {/* Inner decoration */}
      <Decor decor={team.badge} secondary={team.secondaryColor} clipId={clipId} />

      {/* Inner highlight (top sheen) */}
      <ellipse cx="24" cy="16" rx="14" ry="8" fill="rgba(255,255,255,0.08)" clipPath={`url(#${clipId})`} />

      {/* Outer border */}
      <path d={shieldPath} fill="none" stroke={team.secondaryColor} strokeWidth="1.8" strokeOpacity="0.65" />

      {/* Inner border inset */}
      <path d={shieldPath} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />

      {/* Team initials */}
      <text
        x="24"
        y={textY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={team.secondaryColor}
        fontSize="10.5"
        fontWeight="900"
        letterSpacing="-0.4"
        fontFamily="'Inter', 'Roboto Condensed', sans-serif"
        fillOpacity="0.95"
      >
        {shortCode}
      </text>
    </svg>
  );
}
