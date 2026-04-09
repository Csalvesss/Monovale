import React, { useEffect, useRef } from 'react';
import GameLayout from './components/layout/GameLayout';
import { useGameStore } from './store/gameStore';
import { useSquadStore } from './store/squadStore';
import { GENERIC_PLAYERS } from './data/players';

interface Props {
  onBack: () => void;
}

// Positions for a 4-3-3 lineup from the first 11 generic players
// GK, LB, CB, CB, RB, CM, CM, CM, LW, ST, RW
const LINEUP_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // indices into GENERIC_PLAYERS

function GameInitializer({ onBack }: Props) {
  const { userTeamId, setGameData } = useGameStore();
  const { setPlayers, setLineup, setBench } = useSquadStore();
  const initialized = useRef(false);

  useEffect(() => {
    // Initialize once — either no saved team or first boot
    if (initialized.current) return;
    initialized.current = true;

    // Always set up the squad (squad store is not persisted)
    const initial15 = GENERIC_PLAYERS.slice(0, 15);
    setPlayers(initial15);
    setLineup(initial15.slice(0, 11).map(p => p.id));
    setBench(initial15.slice(11, 15).map(p => p.id));

    // Only set team if no saved game
    if (!userTeamId) {
      setGameData({ userTeamId: 'brazil' });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <GameLayout onBack={onBack} />;
}

export default function LendaDaBola({ onBack }: Props) {
  return <GameInitializer onBack={onBack} />;
}
