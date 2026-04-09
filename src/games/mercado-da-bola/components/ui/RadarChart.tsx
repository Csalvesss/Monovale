import React, { useEffect, useRef } from 'react';

interface RadarData {
  label: string;
  value: number;   // 0-100
  color?: string;
}

interface Props {
  data: RadarData[];
  size?: number;
  animate?: boolean;
}

function polarToXY(angle: number, r: number, cx: number, cy: number): [number, number] {
  const rad = (angle - 90) * (Math.PI / 180);
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export default function RadarChart({ data, size = 200, animate = true }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const count = data.length;
  if (count < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const maxR = (size / 2) * 0.72;
  const labelR = (size / 2) * 0.92;
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const angleStep = 360 / count;

  // Build polygon points from data
  function buildPath(values: number[], scale = 1): string {
    const pts = values.map((v, i) => {
      const r = (v / 100) * maxR * scale;
      const [x, y] = polarToXY(i * angleStep, r, cx, cy);
      return `${x},${y}`;
    });
    return `M ${pts.join(' L ')} Z`;
  }

  const dataPath = buildPath(data.map(d => d.value));

  // Animate on mount
  useEffect(() => {
    if (!animate || !pathRef.current) return;
    const path = pathRef.current;
    const len = path.getTotalLength?.() ?? 400;
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    path.style.transition = 'none';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        path.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)';
        path.style.strokeDashoffset = '0';
      });
    });
  }, [animate, dataPath]);

  // Axis lines & grid
  const gridPaths = gridLevels.map(level => {
    const pts = Array.from({ length: count }, (_, i) => {
      const r = level * maxR;
      const [x, y] = polarToXY(i * angleStep, r, cx, cy);
      return `${x},${y}`;
    });
    return `M ${pts.join(' L ')} Z`;
  });

  const axisLines = Array.from({ length: count }, (_, i) => {
    const [x, y] = polarToXY(i * angleStep, maxR, cx, cy);
    return { x, y };
  });

  const labelPositions = data.map((d, i) => {
    const [x, y] = polarToXY(i * angleStep, labelR, cx, cy);
    return { x, y, label: d.label, value: d.value };
  });

  // Dot positions
  const dotPositions = data.map((d, i) => {
    const r = (d.value / 100) * maxR;
    const [x, y] = polarToXY(i * angleStep, r, cx, cy);
    return { x, y, value: d.value, color: d.color };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Grid rings */}
      {gridPaths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={0.8}
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((pt, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={pt.x} y2={pt.y}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={0.8}
        />
      ))}

      {/* Data fill */}
      <path
        d={dataPath}
        fill="rgba(26,122,64,0.18)"
        stroke="none"
      />

      {/* Data outline (animated) */}
      <path
        ref={pathRef}
        d={dataPath}
        fill="none"
        stroke="var(--ldb-pitch-bright)"
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 4px rgba(26,122,64,0.6))' }}
      />

      {/* Data dots */}
      {dotPositions.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={3.5}
          fill={pt.color ?? 'var(--ldb-pitch-bright)'}
          stroke="var(--ldb-void)"
          strokeWidth={1.5}
          style={{ filter: 'drop-shadow(0 0 3px rgba(26,122,64,0.8))' }}
        />
      ))}

      {/* Labels */}
      {labelPositions.map((pt, i) => {
        const isLeft   = pt.x < cx - 5;
        const isRight  = pt.x > cx + 5;
        const isTop    = pt.y < cy - 5;
        const isBottom = pt.y > cy + 5;
        const anchor   = isLeft ? 'end' : isRight ? 'start' : 'middle';
        const dy       = isTop ? -4 : isBottom ? 12 : 4;

        return (
          <g key={i}>
            <text
              x={pt.x}
              y={pt.y + dy}
              textAnchor={anchor}
              fontSize={9}
              fontWeight={700}
              fontFamily="'Inter', system-ui, sans-serif"
              letterSpacing="0.05em"
              fill="rgba(255,255,255,0.45)"
              textTransform="uppercase"
            >
              {pt.label}
            </text>
            <text
              x={pt.x}
              y={pt.y + dy + 11}
              textAnchor={anchor}
              fontSize={10}
              fontWeight={800}
              fontFamily="'Bebas Neue', sans-serif"
              fill="rgba(255,255,255,0.85)"
              letterSpacing="0.05em"
            >
              {pt.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
