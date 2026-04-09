import React, { useEffect, useState } from 'react';

interface Props {
  dice: [number, number] | null;
  rolling?: boolean;
}

const FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function DiceRoller({ dice, rolling }: Props) {
  const [display, setDisplay] = useState<[number, number]>(dice ?? [1, 1]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (dice) {
      setAnimating(true);
      let ticks = 0;
      const interval = setInterval(() => {
        setDisplay([
          Math.ceil(Math.random() * 6),
          Math.ceil(Math.random() * 6),
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
  const total = dice ? dice[0] + dice[1] : 0;

  return (
    <div style={styles.container}>
      <div style={styles.dice}>
        <Die value={display[0]} animating={animating} />
        <Die value={display[1]} animating={animating} />
      </div>
      {dice && (
        <div style={styles.result}>
          <span style={styles.total}>Total: {total}</span>
          {isDouble && (
            <span style={styles.doubleBadge}>🎲 PAR! Joga de novo!</span>
          )}
        </div>
      )}
    </div>
  );
}

function Die({ value, animating }: { value: number; animating: boolean }) {
  return (
    <div style={{
      ...styles.die,
      animation: animating ? 'spin 0.1s linear infinite' : 'none',
    }}>
      {FACES[value] ?? '⚀'}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  dice: {
    display: 'flex',
    gap: 8,
  },
  die: {
    width: 44,
    height: 44,
    background: '#fff',
    borderRadius: 8,
    border: '2px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    userSelect: 'none',
  },
  result: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  total: {
    fontSize: 13,
    fontWeight: 700,
    color: '#d4af37',
  },
  doubleBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#86efac',
    background: 'rgba(134,239,172,0.1)',
    padding: '2px 8px',
    borderRadius: 20,
    border: '1px solid rgba(134,239,172,0.3)',
  },
};
