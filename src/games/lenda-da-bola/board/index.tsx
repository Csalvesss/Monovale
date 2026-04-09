import React, { useState } from 'react';
import EntryScreen from './EntryScreen';
import LobbyScreen from './LobbyScreen';
import GameScreen from './GameScreen';

type Screen = 'entry' | 'lobby' | 'game';

interface Props {
  onBack: () => void;
}

export default function LendasBoardGame({ onBack }: Props) {
  const [screen, setScreen] = useState<Screen>('entry');
  const [roomCode, setRoomCode] = useState('');

  function handleRoomReady(code: string) {
    setRoomCode(code);
    setScreen('lobby');
  }

  function handleGameStart() {
    setScreen('game');
  }

  function handleExit() {
    setScreen('entry');
    setRoomCode('');
  }

  if (screen === 'lobby') {
    return (
      <LobbyScreen
        roomCode={roomCode}
        onGameStart={handleGameStart}
        onBack={() => { setScreen('entry'); setRoomCode(''); }}
      />
    );
  }

  if (screen === 'game') {
    return (
      <GameScreen
        roomCode={roomCode}
        onExit={handleExit}
      />
    );
  }

  return <EntryScreen onBack={onBack} onRoomReady={handleRoomReady} />;
}
