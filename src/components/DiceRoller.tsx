import React, { useEffect, useState } from 'react';

interface Props {
  dice: [number, number] | null;
}

const DOT_POS: Record<number, [number, number][]> = {
  1: [[5,5]],
  2: [[3,3],[7,7]],
  3: [[3,3],[5,5],[7,7]],
  4: [[3,3],[7,3],[3,7],[7,7]],
  5: [[3,3],[7,3],[5,5],[3,7],[7,7]],
  6: [[3,2],[7,2],[3,5],[7,5],[3,8],[7,8]],
};

function Die({ value, animating }: { value: number; animating: boolean }) {
  const dots = DOT_POS[value] ?? DOT_POS[1];
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 10 10"
      style={{
        borderRadius: 3,
        transition: animating ? 'none' : 'transform 0.15s ease',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
      }}
    >
      <rect x="0.3" y="0.3" width="9.4" height="9.4" rx="1.6" fill="white" stroke="#d1d5db" strokeWidth="0.4" />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="0.85" fill="#1f2937" />
      ))}
    </svg>
  );
}

export default function DiceRoller({ dice }: Props) {
  const [display, setDisplay] = useState<[number, number]>(dice ?? [1, 1]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (dice) {
      setAnimating(true);
      let ticks = 0;
      const interval = setInterval(() => {
        setDisplay([
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ]);
        ticks++;
        if (ticks >= 8) {
          clearInterval(interval);
          setDisplay(dice);
          setAnimating(false);
        }
      }, 60);
      return () => clearInterval(interval);
    }
  }, [dice]);

  const isDouble = dice && dice[0] === dice[1];
  const total = dice ? dice[0] + dice[1] : null;

  return (
    <div style={S.wrap}>
      <div style={S.diceRow}>
        <Die value={display[0]} animating={animating} />
        <Die value={display[1]} animating={animating} />
      </div>
      {total && (
        <div style={S.info}>
          <span style={S.total}>{total}</span>
          {isDouble && <span style={S.doublePill}>PAR!</span>}
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  diceRow: { display: 'flex', gap: 6 },
  info: { display: 'flex', alignItems: 'center', gap: 6 },
  total: {
    fontFamily: 'var(--font-title)',
    fontSize: 16,
    color: 'var(--text-mid)',
    letterSpacing: '0.5px',
    fontWeight: 700,
  },
  doublePill: {
    fontSize: 10,
    fontWeight: 800,
    color: 'var(--green-dark)',
    background: '#dcfce7',
    padding: '2px 8px',
    borderRadius: 99,
    border: '1px solid #bbf7d0',
    fontFamily: 'var(--font-title)',
  },
};
