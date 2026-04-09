import React, { useEffect, useRef } from 'react';
import GameLayout from './components/layout/GameLayout';
import { useGameStore } from './store/gameStore';
import { useSquadStore } from './store/squadStore';
import { GENERIC_PLAYERS } from './data/players';

interface Props {
  onBack: () => void;
}

export default function ManagerGame({ onBack }: Props) {
  const { userTeamId, setGameData } = useGameStore();
  const { setPlayers, setLineup, setBench } = useSquadStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initial15 = GENERIC_PLAYERS.slice(0, 15);
    setPlayers(initial15);
    setLineup(initial15.slice(0, 11).map(p => p.id));
    setBench(initial15.slice(11, 15).map(p => p.id));

    if (!userTeamId) {
      setGameData({ userTeamId: 'brazil' });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <GameLayout onBack={onBack} />;
}
