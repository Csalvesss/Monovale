import React, { useState } from 'react';
import type { Team } from '../../types';
import { cn } from '../../../../lib/utils';

interface Props {
  team: Team;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function TeamBadge({ team, size = 40, className, style }: Props) {
  const [failed, setFailed] = useState(false);

  // Get 2-3 letter abbreviation from team name
  const shortCode = team.shortName
    ? team.shortName.substring(0, 3).toUpperCase()
    : team.name.substring(0, 3).toUpperCase();

  const fontSize = Math.round(size * 0.32);
  const borderRadius = Math.round(size * 0.22);

  if (team.logoUrl && !failed) {
    return (
      <img
        src={team.logoUrl}
        alt={team.name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={cn('shrink-0 object-contain', className)}
        style={style}
      />
    );
  }

  return (
    <div
      className={cn('flex shrink-0 items-center justify-center font-black text-white select-none', className)}
      style={{
        width: size,
        height: size,
        borderRadius,
        background: `linear-gradient(135deg, ${team.primaryColor}dd, ${team.primaryColor}88)`,
        border: `2px solid ${team.primaryColor}99`,
        fontSize,
        letterSpacing: '-0.5px',
        boxShadow: `0 2px 8px ${team.primaryColor}44`,
        ...style,
      }}
      title={team.name}
    >
      {shortCode}
    </div>
  );
}
