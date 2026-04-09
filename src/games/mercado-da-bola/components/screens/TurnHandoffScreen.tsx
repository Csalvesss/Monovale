import React from 'react';
import { useMB } from '../../store/gameStore';
import { getTeam } from '../../data/teams';
import TeamBadge from '../ui/TeamBadge';
import { Users2, Play } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export default function TurnHandoffScreen() {
  const { state, setScreen } = useMB();
  const { save } = state;

  if (!save || !save.playerProfiles) return null;

  const currentProfile = save.playerProfiles[save.currentTurn - 1];
  const myTeam = getTeam(save.myTeamId);
  const turnColor = save.currentTurn === 1 ? '#3b82f6' : '#a855f7';

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-[#0f172a] px-6 text-center">

      {/* Turn badge */}
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border"
        style={{ background: `${turnColor}20`, borderColor: `${turnColor}40` }}
      >
        <Users2 size={32} style={{ color: turnColor }} />
      </div>

      <p className="text-[11px] font-black uppercase tracking-widest mb-2"
        style={{ color: turnColor }}>
        Jogador {save.currentTurn}
      </p>

      <h1 className="text-3xl font-black text-slate-100 mb-1"
        style={{ fontFamily: 'var(--font-title)' }}>
        {currentProfile.name}
      </h1>

      <p className="text-sm text-slate-500 mb-8">é a sua vez de jogar</p>

      {/* Team card */}
      {myTeam && (
        <div
          className="mb-10 flex flex-col items-center gap-3 rounded-2xl border p-6 w-full max-w-xs"
          style={{ borderColor: `${turnColor}30`, background: `${turnColor}08` }}
        >
          <TeamBadge team={myTeam} size={64} />
          <div>
            <p className="text-lg font-black text-slate-100">{myTeam.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Rodada {save.currentRound} · ${new Intl.NumberFormat('pt-BR').format(save.budget)}k
            </p>
          </div>
        </div>
      )}

      {/* Ready button */}
      <button
        onClick={() => setScreen('home')}
        className={cn(
          'flex items-center gap-3 rounded-2xl px-10 py-4 text-lg font-black text-white transition-all',
          'shadow-xl active:scale-[0.97]',
        )}
        style={{
          background: `linear-gradient(135deg, ${turnColor}, ${turnColor}cc)`,
          boxShadow: `0 16px 32px ${turnColor}40`,
        }}
      >
        <Play size={20} />
        Estou pronto!
      </button>

      <p className="mt-6 text-xs text-slate-600">
        Passe o dispositivo para {currentProfile.name}
      </p>
    </div>
  );
}
