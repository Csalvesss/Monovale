import React, { useEffect } from 'react';
import { MBProvider, useMB, loadSave } from './store/gameStore';
import GameLayout from './components/layout/GameLayout';
import TeamSelectionScreen from './components/screens/TeamSelectionScreen';
import OnboardingScreen from './components/screens/OnboardingScreen';
import HomeScreen from './components/screens/HomeScreen';
import SquadScreen from './components/screens/SquadScreen';
import MarketScreen from './components/screens/MarketScreen';
import MatchScreen from './components/screens/MatchScreen';
import SponsorScreen from './components/screens/SponsorScreen';
import StandingsScreen from './components/screens/StandingsScreen';
import SocialScreen from './components/screens/SocialScreen';
import StadiumScreen from './components/screens/StadiumScreen';
import PlayerDetailScreen from './components/screens/PlayerDetailScreen';
import TurnHandoffScreen from './components/screens/TurnHandoffScreen';
import OnlineLobbyScreen from './components/screens/OnlineLobbyScreen';
import OnboardingScreen from './components/screens/OnboardingScreen';
import InboxScreen from './components/screens/InboxScreen';

interface Props {
  onBack: () => void;
}

function GameRouter({ onBack }: Props) {
  const { state, dispatch, setScreen } = useMB();

  // Load save on mount
  useEffect(() => {
    const saved = loadSave();
    if (saved) {
      dispatch({ type: 'LOAD_SAVE', save: saved });
    }
    // If no save, screen stays 'team-select'
  }, []); // eslint-disable-line

  const { screen, save } = state;

  // Online lobby — shown before a save exists
  if (screen === 'online-lobby') {
    return <OnlineLobbyScreen onBack={() => setScreen('team-select')} />;
  }

  // Team selection (no save yet)
  if (!save || screen === 'team-select') {
    return <TeamSelectionScreen onBack={onBack} />;
  }

  // Turn handoff — fullscreen, no game layout chrome
  if (screen === 'turn-handoff') {
    return <TurnHandoffScreen />;
  }

  // Onboarding (first time, no manager profile)
  if (screen === 'onboarding') {
    return <OnboardingScreen onBack={onBack} />;
  }

  const screenComponent = (() => {
    switch (screen) {
      case 'home':          return <HomeScreen />;
      case 'squad':         return <SquadScreen />;
      case 'market':        return <MarketScreen />;
      case 'match':         return <MatchScreen />;
      case 'sponsor':       return <SponsorScreen />;
      case 'standings':     return <StandingsScreen />;
      case 'social':        return <SocialScreen />;
      case 'stadium':       return <StadiumScreen />;
      case 'player-detail': return <PlayerDetailScreen />;
      case 'inbox':         return <InboxScreen />;
      default:              return <HomeScreen />;
    }
  })();

  return (
    <GameLayout onBack={onBack}>
      {screenComponent}
    </GameLayout>
  );
}

export default function MercadoDaBola({ onBack }: Props) {
  return (
    <MBProvider>
      <GameRouter onBack={onBack} />
    </MBProvider>
  );
}
