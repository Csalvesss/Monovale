import React, { useState } from 'react';
import type { Team } from '../../types';

interface Props {
  team: Team;
  size?: number;
  style?: React.CSSProperties;
}

export default function TeamBadge({ team, size = 40, style }: Props) {
  const [failed, setFailed] = useState(false);

  if (team.logoUrl && !failed) {
    return (
      <img
        src={team.logoUrl}
        alt={team.name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        style={{
          objectFit: 'contain',
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  // Fallback: colored circle with badge emoji
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: team.primaryColor + '33',
      border: `2px solid ${team.primaryColor}66`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45,
      ...style,
    }}>
      {team.badge}
    </div>
  );
}
