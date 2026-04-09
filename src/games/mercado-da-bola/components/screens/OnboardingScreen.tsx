import React, { useState } from 'react';
import { useMB } from '../../store/gameStore';
import { getTeam } from '../../data/teams';
import TeamBadge from '../ui/TeamBadge';
import type { ManagerProfile, ManagerStyle } from '../../types';
import { ChevronRight, User, Trophy, MessageSquare, Star, Building2 } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const NATIONALITIES = [
  { name: 'Brasil', flag: '🇧🇷' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Espanha', flag: '🇪🇸' },
  { name: 'Itália', flag: '🇮🇹' },
  { name: 'França', flag: '🇫🇷' },
  { name: 'Alemanha', flag: '🇩🇪' },
  { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Holanda', flag: '🇳🇱' },
  { name: 'Uruguai', flag: '🇺🇾' },
];

const NICKNAMES = [
  'O Estrategista', 'O Professor', 'O Louco', 'O Mago',
  'O Frio', 'O Guerreiro', 'O Tático', 'O Sonhador',
];

const STYLES: { value: ManagerStyle; label: string; emoji: string; desc: string }[] = [
  { value: 'attacking',   label: 'Ofensivo',       emoji: '⚔️',  desc: 'Ataque total, pressão alta' },
  { value: 'balanced',    label: 'Equilibrado',     emoji: '⚖️',  desc: 'Adaptável a qualquer situação' },
  { value: 'defensive',   label: 'Defensivo',       emoji: '🛡️',  desc: 'Sólido atrás, eficiente na frente' },
  { value: 'counter',     label: 'Contra-ataque',   emoji: '⚡',  desc: 'Velocidade e transição rápida' },
  { value: 'possession',  label: 'Posse de bola',   emoji: '🔄',  desc: 'Controle do jogo e paciência' },
];

const AVATARS = ['👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🏫', '👩‍🏫', '🧔', '👴', '🧑'];

// ─── Press Conference Questions ───────────────────────────────────────────────

interface PressQuestion {
  question: string;
  options: { text: string; effect: string; moralDelta: number }[];
}

function getPressQuestions(teamName: string, managerName: string): PressQuestion[] {
  return [
    {
      question: `${managerName}, qual é o seu objetivo principal nesta temporada?`,
      options: [
        { text: '🏆 "Queremos o título! Nada menos que isso!"', effect: '+Pressão, +Moral elenco', moralDelta: 10 },
        { text: '📈 "Nosso foco é o desenvolvimento do time."', effect: '+Relação diretoria, -Expectativa torcida', moralDelta: 5 },
        { text: '🤐 "Prefiro não fazer promessas agora."', effect: 'Neutro, +Credibilidade', moralDelta: 0 },
      ],
    },
    {
      question: `Como você descreve o seu estilo de jogo para o ${teamName}?`,
      options: [
        { text: '⚽ "Futebol bonito, ofensivo e com muitos gols!"', effect: '+Torcida, +Atacantes', moralDelta: 8 },
        { text: '🧱 "Solidez defensiva é a base de tudo."', effect: '+Defensores, +Diretoria', moralDelta: 5 },
        { text: '🎯 "Adaptável. Cada jogo tem sua estratégia."', effect: '+Elenco completo', moralDelta: 7 },
      ],
    },
    {
      question: 'O que você diz para a torcida que está esperando por você?',
      options: [
        { text: '❤️ "Vou dar tudo por este clube. Contem comigo!"', effect: '+Torcida, +Moral geral', moralDelta: 12 },
        { text: '💪 "Precisamos de paciência, mas o resultado virá."', effect: '+Diretoria, neutro torcida', moralDelta: 3 },
        { text: '🔥 "Que venham os grandes jogos. Estamos prontos!"', effect: '+Moral elenco', moralDelta: 8 },
      ],
    },
  ];
}

// ─── Step Components ──────────────────────────────────────────────────────────

interface StepIndicatorProps {
  current: number;
  total: number;
}

function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 99,
            background: i === current ? '#059669' : i < current ? '#065f46' : '#1e293b',
            transition: 'all 0.3s',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
}

export default function OnboardingScreen({ onBack }: Props) {
  const { state, setManagerProfile } = useMB();
  const save = state.save!;
  const myTeam = getTeam(save.myTeamId)!;

  const [step, setStep] = useState(0);
  const [managerName, setManagerName] = useState('');
  const [nationality, setNationality] = useState(NATIONALITIES[0]);
  const [nickname, setNickname] = useState(NICKNAMES[0]);
  const [style, setStyle] = useState<ManagerStyle>('balanced');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [pressAnswers, setPressAnswers] = useState<number[]>([]);
  const [moraleBonus, setMoraleBonus] = useState(0);
  const [pressStep, setPressStep] = useState(0);

  const pressQuestions = getPressQuestions(myTeam.name, managerName || 'Treinador');
  const TOTAL_STEPS = 4; // create manager, choose style, press conference, director welcome

  // ── Step 1: Manager creation ──

  function renderManagerCreation() {
    const canProceed = managerName.trim().length >= 2;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{AVATARS[avatarIndex]}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {AVATARS.map((a, i) => (
              <button
                key={i}
                onClick={() => setAvatarIndex(i)}
                style={{
                  width: 44, height: 44, borderRadius: 12, border: `2px solid ${avatarIndex === i ? '#059669' : '#334155'}`,
                  background: avatarIndex === i ? 'rgba(5,150,105,0.15)' : '#1e293b',
                  fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >{a}</button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
            Nome do Manager
          </label>
          <input
            type="text"
            value={managerName}
            onChange={e => setManagerName(e.target.value)}
            placeholder="Ex: José Mourinho"
            maxLength={30}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12, border: '2px solid #334155',
              background: '#1e293b', color: '#f1f5f9', fontSize: 15, fontFamily: 'var(--font-body)',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Nationality */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
            Nacionalidade
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NATIONALITIES.map(n => (
              <button
                key={n.name}
                onClick={() => setNationality(n)}
                style={{
                  padding: '6px 10px', borderRadius: 8, border: `2px solid ${nationality.name === n.name ? '#059669' : '#334155'}`,
                  background: nationality.name === n.name ? 'rgba(5,150,105,0.15)' : '#1e293b',
                  color: '#f1f5f9', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >{n.flag} {n.name}</button>
            ))}
          </div>
        </div>

        {/* Nickname */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
            Alcunha
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NICKNAMES.map(n => (
              <button
                key={n}
                onClick={() => setNickname(n)}
                style={{
                  padding: '6px 10px', borderRadius: 8, border: `2px solid ${nickname === n ? '#059669' : '#334155'}`,
                  background: nickname === n ? 'rgba(5,150,105,0.15)' : '#1e293b',
                  color: nickname === n ? '#a7f3d0' : '#94a3b8', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
                  fontWeight: nickname === n ? 800 : 400,
                }}
              >{n}</button>
            ))}
          </div>
        </div>

        <button
          onClick={() => canProceed && setStep(1)}
          disabled={!canProceed}
          style={{
            width: '100%', padding: 14, borderRadius: 14, border: 'none',
            background: canProceed ? 'linear-gradient(135deg, #059669, #065f46)' : '#1e293b',
            color: canProceed ? '#fff' : '#475569',
            fontWeight: 900, fontSize: 15, cursor: canProceed ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          Próximo <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // ── Step 2: Style selection ──

  function renderStyleSelection() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 4 }}>
          Qual é o seu estilo de jogo favorito?
        </p>
        {STYLES.map(s => (
          <button
            key={s.value}
            onClick={() => setStyle(s.value)}
            style={{
              padding: '14px 16px', borderRadius: 14,
              border: `2px solid ${style === s.value ? '#059669' : '#334155'}`,
              background: style === s.value ? 'rgba(5,150,105,0.12)' : '#1e293b',
              color: '#f1f5f9', cursor: 'pointer', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 28 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: style === s.value ? '#a7f3d0' : '#f1f5f9' }}>
                {s.label}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.desc}</div>
            </div>
          </button>
        ))}
        <button
          onClick={() => setStep(2)}
          style={{
            width: '100%', padding: 14, borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #059669, #065f46)',
            color: '#fff', fontWeight: 900, fontSize: 15, cursor: 'pointer',
            fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 4,
          }}
        >
          Próximo <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // ── Step 3: Press conference ──

  function renderPressConference() {
    if (pressStep >= pressQuestions.length) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🎙️</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9' }}>Coletiva encerrada!</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            Suas respostas geraram +{moraleBonus} de moral inicial para o elenco.
          </div>
          <div style={{
            background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.3)',
            borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#a7f3d0', width: '100%',
          }}>
            ✅ A imprensa ficou satisfeita com sua postura
          </div>
          <button
            onClick={() => setStep(3)}
            style={{
              width: '100%', padding: 14, borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #059669, #065f46)',
              color: '#fff', fontWeight: 900, fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            Próximo <ChevronRight size={16} />
          </button>
        </div>
      );
    }

    const q = pressQuestions[pressStep];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{
          background: '#1e293b', borderRadius: 12, padding: '14px 16px',
          border: '1px solid #334155', display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 22 }}>🎙️</span>
          <div>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Jornalista — ESPN Brasil
            </div>
            <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.5 }}>{q.question}</p>
          </div>
        </div>

        <p style={{ fontSize: 11, color: '#64748b', textAlign: 'center' }}>
          Pergunta {pressStep + 1} de {pressQuestions.length} — Escolha sua resposta:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                setPressAnswers(prev => [...prev, i]);
                setMoraleBonus(prev => prev + opt.moralDelta);
                setPressStep(prev => prev + 1);
              }}
              style={{
                padding: '12px 14px', borderRadius: 12, border: '1px solid #334155',
                background: '#1e293b', color: '#f1f5f9', cursor: 'pointer', fontFamily: 'var(--font-body)',
                display: 'flex', flexDirection: 'column', textAlign: 'left', gap: 4,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#059669'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#334155'; }}
            >
              <span style={{ fontSize: 13, fontWeight: 700 }}>{opt.text}</span>
              <span style={{ fontSize: 10, color: '#10b981' }}>{opt.effect}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Step 4: Director welcome ──

  function renderDirectorWelcome() {
    const budget = save.budget;
    const seasonGoal = myTeam.reputation >= 75
      ? 'Lutar pelo título do campeonato'
      : myTeam.reputation >= 50
        ? 'Classificar entre os primeiros 4 colocados'
        : 'Garantir a permanência na divisão';

    function handleStart() {
      const profile: ManagerProfile = {
        name: managerName.trim(),
        nationality: nationality.name,
        nationalityFlag: nationality.flag,
        nickname,
        style,
        avatarIndex,
      };
      setManagerProfile(profile, save);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Director card */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          border: '1px solid #334155', borderRadius: 16, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b, #065f46)',
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}>🏢</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>Diretoria do {myTeam.name}</div>
              <div style={{ fontSize: 11, color: '#a7f3d0', marginTop: 2 }}>Mensagem oficial de boas-vindas</div>
            </div>
          </div>

          {/* Message */}
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.7, marginBottom: 16 }}>
              Bem-vindo, <strong style={{ color: '#a7f3d0' }}>{managerName}</strong>!
              O {myTeam.name} tem enorme satisfação em tê-lo como novo treinador.
              O clube depositou total confiança em sua capacidade técnica e acreditamos
              que sua filosofia de jogo é exatamente o que precisamos.
            </p>
            <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.7, marginBottom: 16 }}>
              A diretoria espera que você <strong style={{ color: '#fde68a' }}>"{seasonGoal}"</strong> nesta temporada.
              Para isso, liberamos um orçamento inicial de{' '}
              <strong style={{ color: '#10b981' }}>${budget.toLocaleString('pt-BR')}k</strong> para reforços.
            </p>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, fontStyle: 'italic' }}>
              "A torcida está ansiosa. O momento é agora. Boa sorte, treinador!"
            </p>
          </div>
        </div>

        {/* Goals summary */}
        <div style={{ background: '#1e293b', borderRadius: 12, padding: '14px 16px', border: '1px solid #334155' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Metas da Temporada
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '🎯', label: 'Meta Principal', value: seasonGoal },
              { icon: '💰', label: 'Orçamento', value: `$${budget.toLocaleString('pt-BR')}k` },
              { icon: '🏟️', label: 'Estádio', value: myTeam.stadiumName },
              { icon: '🏆', label: 'Temporada', value: `1 de muitas` },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: '#64748b', width: 100 }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          style={{
            width: '100%', padding: 16, borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #059669, #065f46)',
            color: '#fff', fontWeight: 900, fontSize: 16, cursor: 'pointer',
            fontFamily: 'var(--font-body)', boxShadow: '0 8px 24px rgba(5,150,105,0.3)',
          }}
        >
          ✅ Aceitar o Desafio
        </button>
      </div>
    );
  }

  const STEP_TITLES = [
    { icon: <User size={18} />, title: 'Criação do Manager', sub: 'Defina sua identidade' },
    { icon: <Star size={18} />, title: 'Estilo de Jogo', sub: 'Sua filosofia em campo' },
    { icon: <MessageSquare size={18} />, title: 'Coletiva de Imprensa', sub: 'Primeiras palavras ao clube' },
    { icon: <Building2 size={18} />, title: 'Mensagem da Diretoria', sub: 'Bem-vindo oficialmente' },
  ];

  const current = STEP_TITLES[step];

  return (
    <div style={{
      minHeight: '100dvh', background: '#0f172a', fontFamily: 'var(--font-body)',
      color: '#f1f5f9', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b, #065f46)',
        padding: '20px 20px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <TeamBadge team={myTeam} size={44} />
          <div>
            <div style={{ fontSize: 11, color: '#a7f3d0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {myTeam.name}
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>Novo Treinador</div>
          </div>
        </div>
        <StepIndicator current={step} total={TOTAL_STEPS} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        {/* Step title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669',
          }}>
            {current.icon}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#f1f5f9' }}>{current.title}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{current.sub}</div>
          </div>
        </div>

        {step === 0 && renderManagerCreation()}
        {step === 1 && renderStyleSelection()}
        {step === 2 && renderPressConference()}
        {step === 3 && renderDirectorWelcome()}
      </div>
    </div>
  );
}
