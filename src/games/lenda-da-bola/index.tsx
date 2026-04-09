import React from 'react';
import LendasBoardGame from './board/index';
import './styles/lenda.css';

interface Props {
  onBack: () => void;
}

export default function LendaDaBola({ onBack }: Props) {
  return <LendasBoardGame onBack={onBack} />;
}
