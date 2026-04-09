import React, { useState, useEffect, useRef } from 'react';
import { useMB } from '../../store/gameStore';
import { ALL_TEAMS } from '../../data/teams';
import { LEAGUES } from '../../constants';
import { getAvailablePlayers } from '../../data/players';
import TeamBadge from '../ui/TeamBadge';
import gsap from 'gsap';
import type { LeagueId, Team, GameSave, Stadium, PlayerProfile } from '../../types';
import { Users, User, Globe, ChevronLeft, Trophy, ArrowRight, Check, Zap } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSquad(team: Team) {
  return getAvailablePlayers(team.id, 16);
}

function generateFixtures(myTeamId: string, leagueTeams: Team[], excludeTeamId?: string) {
  const others = leagueTeams.filter(t => t.id !== myTeamId && t.id !== excludeTeamId);
  const home = others.slice(0, 9).map((t, i) => ({
    round: i + 1, homeTeamId: myTeamId, awayTeamId: t.id, played: false,
  }));
  const away = others.slice(0, 9).map((t, i) => ({
    round: i + 10, homeTeamId: t.id, awayTeamId: myTeamId, played: false,
  }));
  return [...home, ...away];
}

function generateStandings(teams: Team[]) {
  return teams.map(t => ({
    teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, points: 0,
  }));
}

function makeStadium(team: Team): Stadium {
  return {
    name: team.stadiumName,
    capacity: team.stadiumCapacity,
    vipSections: 0, trainingLevel: 0, academyLevel: 0, mediaLevel: 0, ticketPrice: 1,
  };
}

// ─── Team Picker ──────────────────────────────────────────────────────────────

function TeamPicker({
  selected, onSelect, disabledTeamId, lockLeague,
}: {
  selected: Team | null;
  onSelect: (t: Team | null) => void;
  disabledTeamId?: string;
  lockLeague?: LeagueId;
}) {
  const [leagueFilter, setLeagueFilter] = useState<LeagueId | 'all'>(lockLeague ?? 'all');

  const filteredTeams = (leagueFilter === 'all'
    ? ALL_TEAMS
    : ALL_TEAMS.filter(t => t.leagueId === leagueFilter)
  ).filter(t => t.id !== disabledTeamId);

  return (
    <div>
      {!lockLeague && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16 }}>
          <button
            onClick={() => setLeagueFilter('all')}
            className="ldb-badge"
            style={{
              flexShrink: 0,
              background: leagueFilter === 'all' ? 'var(--ldb-pitch-mid)' : 'var(--ldb-elevated)',
              color: leagueFilter === 'all' ? '#fff' : 'rgba(255,255,255,0.5)',
              border: leagueFilter === 'all' ? '1px solid var(--ldb-pitch-bright)' : '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
            }}
          >Todos</button>
          {LEAGUES.map(lg => (
            <button
              key={lg.id}
              onClick={() => setLeagueFilter(lg.id)}
              className="ldb-badge"
              style={{
                flexShrink: 0,
                background: leagueFilter === lg.id ? 'var(--ldb-pitch-mid)' : 'var(--ldb-elevated)',
                color: leagueFilter === lg.id ? '#fff' : 'rgba(255,255,255,0.5)',
                border: leagueFilter === lg.id ? '1px solid var(--ldb-pitch-bright)' : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
              }}
            >{lg.flag} {lg.name}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {filteredTeams.map(team => {
          const league = LEAGUES.find(l => l.id === team.leagueId);
          const isSelected = selected?.id === team.id;
          return (
            <button
              key={team.id}
              onClick={() => onSelect(isSelected ? null : team)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                borderRadius: 12,
                padding: '14px 10px',
                border: isSelected
                  ? '1.5px solid var(--ldb-pitch-bright)'
                  : '1px solid rgba(255,255,255,0.07)',
                background: isSelected ? 'rgba(26,122,64,0.12)' : 'var(--ldb-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: 'var(--ldb-pitch-bright)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={11} color="#fff" />
                </div>
              )}
              <TeamBadge team={team} size={44} />
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: 11, fontWeight: 900,
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.85)',
                  lineHeight: 1.3, fontFamily: 'var(--ldb-font-body)',
                }}>{team.name}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                  {league?.flag} Rep. {team.reputation}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Mode = 'solo' | 'local-multi';
type Step = 'mode' | 'p1' | 'p2' | 'confirm';
interface Props { onBack: () => void; }

export default function TeamSelectionScreen({ onBack }: Props) {
  const { dispatch, setScreen } = useMB();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode | null>(null);
  const [step, setStep] = useState<Step>('mode');
  const [p1Name, setP1Name] = useState('Jogador 1');
  const [p2Name, setP2Name] = useState('Jogador 2');
  const [p1Team, setP1Team] = useState<Team | null>(null);
  const [p2Team, setP2Team] = useState<Team | null>(null);

  useEffect(() => {
    if (!heroRef.current || !cardsRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(heroRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 });
    tl.fromTo(cardsRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.4 }, '-=0.2');
  }, [step]);

  // ── Confirm solo ──────────────────────────────────────────────────────────
  function handleSoloConfirm() {
    if (!p1Team) return;
    const leagueTeams = ALL_TEAMS.filter(t => t.leagueId === p1Team.leagueId);
    const squad = generateSquad(p1Team);
    const allPlayers = ALL_TEAMS.flatMap(t => t.id === p1Team.id ? [] : getAvailablePlayers(t.id, 14));

    const save: GameSave = {
      version: '1.0',
      timestamp: Date.now(),
      myTeamId: p1Team.id,
      budget: 500 + p1Team.reputation * 5,
      currentSeason: 1, currentRound: 1,
      mySquad: squad,
      allPlayers: [...squad, ...allPlayers],
      fixtures: generateFixtures(p1Team.id, leagueTeams),
      standings: generateStandings(leagueTeams),
      sponsorId: null, sponsorPoints: 0,
      stadium: makeStadium(p1Team),
      finances: [], newsFeed: [],
      legendaryCardsOwned: [], legendaryChanceBonus: 0,
      pendingOffers: [], seasonHistory: [], totalRoundsPlayed: 0,
      mode: 'solo', currentTurn: 1, playerProfiles: null,
      randomSeed: Math.floor(Math.random() * 1_000_000),
      playerMessages: [], unreadMessages: 0,
    };
    dispatch({ type: 'START_NEW_GAME', save });
  }

  // ── Confirm multi ─────────────────────────────────────────────────────────
  function handleMultiConfirm() {
    if (!p1Team || !p2Team) return;
    const leagueTeams = ALL_TEAMS.filter(t => t.leagueId === p1Team.leagueId);
    const p1Squad = generateSquad(p1Team);
    const p2Squad = generateSquad(p2Team);
    const allPlayers = ALL_TEAMS.flatMap(t => {
      if (t.id === p1Team.id || t.id === p2Team.id) return [];
      return getAvailablePlayers(t.id, 14);
    });

    const p1Profile: PlayerProfile = {
      name: p1Name.trim() || 'Jogador 1',
      teamId: p1Team.id,
      squad: p1Squad,
      budget: 500 + p1Team.reputation * 5,
      stadium: makeStadium(p1Team),
      sponsorId: null, sponsorPoints: 0,
      legendaryCardsOwned: [], legendaryChanceBonus: 0,
      pendingOffers: [], finances: [],
      fixtures: generateFixtures(p1Team.id, leagueTeams, p2Team.id),
      currentRound: 1, currentSeason: 1, seasonHistory: [], totalRoundsPlayed: 0,
    };

    const p2Profile: PlayerProfile = {
      name: p2Name.trim() || 'Jogador 2',
      teamId: p2Team.id,
      squad: p2Squad,
      budget: 500 + p2Team.reputation * 5,
      stadium: makeStadium(p2Team),
      sponsorId: null, sponsorPoints: 0,
      legendaryCardsOwned: [], legendaryChanceBonus: 0,
      pendingOffers: [], finances: [],
      fixtures: generateFixtures(p2Team.id, leagueTeams, p1Team.id),
      currentRound: 1, currentSeason: 1, seasonHistory: [], totalRoundsPlayed: 0,
    };

    const save: GameSave = {
      version: '1.0',
      timestamp: Date.now(),
      myTeamId: p1Team.id,
      budget: p1Profile.budget,
      currentSeason: 1, currentRound: 1,
      mySquad: p1Squad,
      allPlayers: [...p1Squad, ...p2Squad, ...allPlayers],
      fixtures: p1Profile.fixtures,
      standings: generateStandings(leagueTeams),
      sponsorId: null, sponsorPoints: 0,
      stadium: makeStadium(p1Team),
      finances: [], newsFeed: [],
      legendaryCardsOwned: [], legendaryChanceBonus: 0,
      pendingOffers: [], seasonHistory: [], totalRoundsPlayed: 0,
      mode: 'local-multi',
      currentTurn: 1,
      playerProfiles: [p1Profile, p2Profile],
      randomSeed: Math.floor(Math.random() * 1_000_000),
      playerMessages: [], unreadMessages: 0,
    };
    dispatch({ type: 'START_NEW_GAME', save });
  }

  // ── Back handler ──────────────────────────────────────────────────────────
  function handleBack() {
    if (step === 'mode') { onBack(); return; }
    if (step === 'p1') setStep('mode');
    else if (step === 'p2') setStep('p1');
    else if (step === 'confirm') setStep(mode === 'local-multi' ? 'p2' : 'p1');
  }

  return (
    <div
      ref={containerRef}
      className="ldb-game"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--ldb-void)',
        color: '#fff',
      }}
    >
      {/* ── Header ── */}
      <div
        ref={heroRef}
        style={{
          background: 'linear-gradient(180deg, rgba(26,122,64,0.15) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '24px 20px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={handleBack}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              borderRadius: 8, padding: '6px 12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'var(--ldb-surface)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <ChevronLeft size={14} />
            {step === 'mode' ? 'Sair' : 'Voltar'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={16} color="var(--ldb-gold-bright)" />
            <span style={{
              fontFamily: 'var(--ldb-font-display)',
              fontSize: 20, letterSpacing: '0.08em',
              color: '#fff',
            }}>LENDA DA BOLA</span>
          </div>
        </div>

        <h2 style={{
          fontFamily: 'var(--ldb-font-display)',
          fontSize: 28, letterSpacing: '0.04em',
          color: '#fff', margin: 0,
        }}>
          {step === 'mode' && 'COMO QUER JOGAR?'}
          {step === 'p1' && (mode === 'local-multi' ? `${(p1Name || 'JOGADOR 1').toUpperCase()}: ESCOLHA SEU TIME` : 'ESCOLHA SEU TIME')}
          {step === 'p2' && `${(p2Name || 'JOGADOR 2').toUpperCase()}: ESCOLHA SEU TIME`}
          {step === 'confirm' && 'PRONTO PARA COMEÇAR!'}
        </h2>

        {step === 'p2' && p1Team && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            Mesma liga do {p1Team.name} · {LEAGUES.find(l => l.id === p1Team.leagueId)?.name}
          </p>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 120px' }}>

        {/* ── Mode selection ── */}
        {step === 'mode' && (
          <div ref={cardsRef} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400, margin: '0 auto', paddingTop: 8 }}>
            {/* Solo */}
            <button
              onClick={() => { setMode('solo'); setStep('p1'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                borderRadius: 16, padding: '18px 20px',
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'var(--ldb-surface)',
                textAlign: 'left', cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(26,122,64,0.2)',
                border: '1px solid rgba(26,122,64,0.3)',
              }}>
                <User size={22} color="var(--ldb-pitch-bright)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: 'var(--ldb-font-display)',
                  fontSize: 22, letterSpacing: '0.04em', color: '#fff', margin: 0,
                }}>SOLO</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  Gerencie seu time contra a IA
                </p>
              </div>
              <ArrowRight size={18} color="rgba(255,255,255,0.3)" />
            </button>

            {/* Local Multi */}
            <button
              onClick={() => { setMode('local-multi'); setStep('p1'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                borderRadius: 16, padding: '18px 20px',
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'var(--ldb-surface)',
                textAlign: 'left', cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(168,85,247,0.2)',
                border: '1px solid rgba(168,85,247,0.3)',
              }}>
                <Users size={22} color="#a855f7" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: 'var(--ldb-font-display)',
                  fontSize: 22, letterSpacing: '0.04em', color: '#fff', margin: 0,
                }}>JOGAR COM AMIGO</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  2 jogadores, mesmo dispositivo
                </p>
              </div>
              <ArrowRight size={18} color="rgba(255,255,255,0.3)" />
            </button>

            {/* Online */}
            <button
              onClick={() => setScreen('online-lobby')}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                borderRadius: 16, padding: '18px 20px',
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'var(--ldb-surface)',
                textAlign: 'left', cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,215,0,0.15)',
                border: '1px solid rgba(255,215,0,0.2)',
              }}>
                <Globe size={22} color="var(--ldb-gold-bright)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: 'var(--ldb-font-display)',
                  fontSize: 22, letterSpacing: '0.04em', color: '#fff', margin: 0,
                }}>JOGAR ONLINE</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  Liga com amigos em outros dispositivos
                </p>
              </div>
              <ArrowRight size={18} color="rgba(255,255,255,0.3)" />
            </button>
          </div>
        )}

        {/* ── Player 1 setup ── */}
        {step === 'p1' && (
          <div>
            {mode === 'local-multi' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700,
                  color: 'rgba(255,255,255,0.45)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
                }}>Nome do Jogador 1</label>
                <input
                  value={p1Name}
                  onChange={e => setP1Name(e.target.value)}
                  maxLength={20}
                  style={{
                    width: '100%', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'var(--ldb-surface)',
                    padding: '12px 16px',
                    fontSize: 14, fontWeight: 700, color: '#fff',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                  placeholder="Jogador 1"
                />
              </div>
            )}
            <TeamPicker selected={p1Team} onSelect={setP1Team} />
          </div>
        )}

        {/* ── Player 2 setup ── */}
        {step === 'p2' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: 'rgba(255,255,255,0.45)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
              }}>Nome do Jogador 2</label>
              <input
                value={p2Name}
                onChange={e => setP2Name(e.target.value)}
                maxLength={20}
                style={{
                  width: '100%', borderRadius: 12,
                  border: '1px solid rgba(168,85,247,0.3)',
                  background: 'var(--ldb-surface)',
                  padding: '12px 16px',
                  fontSize: 14, fontWeight: 700, color: '#fff',
                  outline: 'none', boxSizing: 'border-box',
                }}
                placeholder="Jogador 2"
              />
            </div>
            <TeamPicker
              selected={p2Team}
              onSelect={setP2Team}
              disabledTeamId={p1Team?.id}
              lockLeague={p1Team?.leagueId}
            />
          </div>
        )}

        {/* ── Confirm screen ── */}
        {step === 'confirm' && (
          <div ref={cardsRef} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400, margin: '0 auto', paddingTop: 8 }}>
            {mode === 'solo' && p1Team && (
              <div className="ldb-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
                <TeamBadge team={p1Team} size={56} />
                <div>
                  <p style={{
                    fontFamily: 'var(--ldb-font-display)',
                    fontSize: 24, letterSpacing: '0.04em',
                    color: '#fff', margin: 0,
                  }}>{p1Team.name.toUpperCase()}</p>
                  <p style={{ fontSize: 13, color: 'var(--ldb-gold-bright)', fontWeight: 700, marginTop: 4 }}>
                    ${(500 + p1Team.reputation * 5).toLocaleString('pt-BR')}k iniciais
                  </p>
                </div>
              </div>
            )}

            {mode === 'local-multi' && p1Team && p2Team && (
              <>
                {[
                  { name: p1Name || 'Jogador 1', team: p1Team, color: '#3b82f6', label: 'J1' },
                  { name: p2Name || 'Jogador 2', team: p2Team, color: '#a855f7', label: 'J2' },
                ].map(({ name, team, color, label }) => (
                  <div key={label} className="ldb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 900, color: '#fff',
                    }}>{label}</div>
                    <TeamBadge team={team} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{team.name}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ldb-gold-bright)', flexShrink: 0 }}>
                      ${(500 + team.reputation * 5).toLocaleString('pt-BR')}k
                    </span>
                  </div>
                ))}

                <div style={{
                  borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)',
                  background: 'var(--ldb-surface)', padding: '12px 16px',
                  textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)',
                }}>
                  {LEAGUES.find(l => l.id === p1Team.leagueId)?.flag} Mesma liga · Turnos alternados
                </div>
              </>
            )}

            {/* Game features summary */}
            <div style={{
              borderRadius: 12, border: '1px solid rgba(26,122,64,0.25)',
              background: 'rgba(26,122,64,0.08)', padding: 16,
            }}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
              }}>O que te espera</p>
              {[
                '18 rodadas de campeonato por temporada',
                'Sistema de lenda (cartas especiais raras)',
                'Mercado de transferências dinâmico',
                'Evolução de jogadores e XP',
              ].map(feat => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Zap size={11} color="var(--ldb-gold-bright)" />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky footer CTA ── */}
      {step !== 'mode' && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(0deg, var(--ldb-void) 60%, transparent)',
          padding: '20px 20px 32px',
        }}>
          {step === 'p1' && p1Team && (
            <button
              className="ldb-btn-primary"
              onClick={() => mode === 'local-multi' ? setStep('p2') : setStep('confirm')}
              style={{ width: '100%', justifyContent: 'center', gap: 8, fontSize: 15 }}
            >
              {p1Team.name.toUpperCase()}
              <ArrowRight size={16} />
            </button>
          )}

          {step === 'p2' && p2Team && (
            <button
              onClick={() => setStep('confirm')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                borderRadius: 12, padding: '14px 24px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                border: 'none', color: '#fff',
                fontSize: 15, fontWeight: 800, cursor: 'pointer',
                fontFamily: 'var(--ldb-font-display)', letterSpacing: '0.04em',
              }}
            >
              {p2Team.name.toUpperCase()}
              <ArrowRight size={16} />
            </button>
          )}

          {step === 'confirm' && (
            <button
              className="ldb-btn-gold"
              onClick={() => mode === 'local-multi' ? handleMultiConfirm() : handleSoloConfirm()}
              style={{ width: '100%', justifyContent: 'center', gap: 10, fontSize: 16 }}
            >
              <Trophy size={18} />
              COMEÇAR TEMPORADA!
            </button>
          )}
        </div>
      )}
    </div>
  );
}
