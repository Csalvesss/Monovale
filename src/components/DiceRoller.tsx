import React, { useEffect, useState } from 'react';

interface Props {
  dice: [number, number] | null;
}

const FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function DiceRoller({ dice }: Props) {
  const [display, setDisplay] = useState<[number, number]>(dice ?? [1, 1]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (dice) {
      setAnimating(true);
      let ticks = 0;
      const interval = setInterval(() => {
        setDisplay([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
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
        <div style={{ ...S.die, animation: animating ? 'spin 0.08s linear infinite' : 'none' }}>
          {FACES[display[0]] ?? '⚀'}
        </div>
        <div style={{ ...S.die, animation: animating ? 'spin 0.08s linear infinite' : 'none', animationDelay: '0.04s' }}>
          {FACES[display[1]] ?? '⚀'}
        </div>
      </div>
      {total && (
        <div style={S.info}>
          <span style={S.total}>{total}</span>
          {isDouble && <span style={S.doublePill}>PAR! 🎲</span>}
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  diceRow: { display: 'flex', gap: 6 },
  die: {
    width: 46,
    height: 46,
    background: 'white',
    borderRadius: 12,
    border: '2px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    boxShadow: '0 4px 0 var(--border), 0 6px 12px rgba(0,0,0,0.1)',
    userSelect: 'none',
  },
  info: { display: 'flex', alignItems: 'center', gap: 6 },
  total: {
    fontFamily: 'var(--font-title)',
    fontSize: 16,
    color: 'var(--gold-dark)',
    letterSpacing: '0.5px',
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
