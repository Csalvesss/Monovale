import React from 'react';
import { useMB } from '../../store/gameStore';

const POSITION_COLORS: Record<string, string> = {
  GK: '#f59e0b', CB: '#3b82f6', LB: '#3b82f6', RB: '#3b82f6',
  CDM: '#10b981', CM: '#10b981', CAM: '#8b5cf6',
  LW: '#ef4444', RW: '#ef4444', ST: '#ef4444', CF: '#ef4444',
};

const MOOD_LABEL: Record<string, string> = {
  motivated: '🔥 Motivado', happy: '😊 Feliz', neutral: '😐 Neutro', unhappy: '😤 Insatisfeito',
};
const MOOD_COLOR: Record<string, string> = {
  motivated: '#4ade80', happy: '#86efac', neutral: '#fbbf24', unhappy: '#f87171',
};
const LIFESTYLE_LABEL: Record<string, string> = {
  poor: '🏚️ Humilde', modest: '🏠 Modesto', comfortable: '🏡 Confortável',
  luxury: '🏰 Luxo', superstar: '🌟 Superestrela',
};

function AttrBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, fontSize: 10, fontWeight: 700, color: '#94a3b8', textAlign: 'right' }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: '#334155', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 99 }} />
      </div>
      <div style={{ width: 28, fontSize: 12, fontWeight: 800, color, textAlign: 'right' }}>{value}</div>
    </div>
  );
}

export default function PlayerDetailScreen() {
  const { state, selectPlayer, trainPlayer, sellPlayer } = useMB();
  const { save, selectedPlayerId } = state;

  if (!save || !selectedPlayerId) return null;
  const player = save.mySquad.find(p => p.id === selectedPlayerId);
  if (!player) return null;

  const posColor = POSITION_COLORS[player.position] ?? '#94a3b8';
  const xpInLevel = player.xp % 500;
  const xpProgress = xpInLevel / 500;
  const xpToNext = 500 - xpInLevel;
  const trainCost = 50 * player.level;
  const canTrain = save.budget >= trainCost && player.level < 10;

  const attrs = player.attributes;
  const attrList: [string, number, string][] = player.position === 'GK'
    ? [['GOL', attrs.goalkeeping ?? 60, '#f59e0b'], ['DEF', attrs.defending, '#3b82f6'], ['FÍS', attrs.physical, '#8b5cf6'], ['PAS', attrs.passing, '#10b981']]
    : [['RIT', attrs.pace, '#ef4444'], ['FIN', attrs.shooting, '#f59e0b'], ['PAS', attrs.passing, '#10b981'], ['DRI', attrs.dribbling, '#8b5cf6'], ['DEF', attrs.defending, '#3b82f6'], ['FÍS', attrs.physical, '#64748b']];

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button onClick={() => selectPlayer(null)} style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
        color: '#94a3b8', padding: '8px 14px', fontSize: 13, cursor: 'pointer',
        fontFamily: 'var(--font-body)', alignSelf: 'flex-start', fontWeight: 700,
      }}>← Voltar ao Elenco</button>

      <div style={{
        background: player.rarity === 'legendary' ? 'linear-gradient(135deg, #78350f, #451a03)' : '#1e293b',
        border: `1px solid ${player.rarity === 'legendary' ? '#d97706' : '#334155'}`,
        borderRadius: 16, padding: 20,
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 14, flexShrink: 0,
            background: player.rarity === 'legendary' ? 'linear-gradient(135deg, #d97706, #92400e)' : posColor + '33',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            border: player.rarity === 'legendary' ? '2px solid #d97706' : 'none',
          }}>{player.rarity === 'legendary' ? '⭐' : player.flag}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9' }}>{player.name}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{player.fullName}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 800, background: posColor + '33', color: posColor, padding: '3px 8px', borderRadius: 6 }}>{player.position}</span>
              <span style={{ color: '#fbbf24', fontSize: 12 }}>{'★'.repeat(player.stars)}{'☆'.repeat(5 - player.stars)}</span>
              {player.rarity === 'legendary' && <span style={{ fontSize: 10, fontWeight: 900, background: '#d97706', color: '#fff', padding: '2px 8px', borderRadius: 99 }}>LENDÁRIO</span>}
              {player.injured && <span style={{ fontSize: 12 }}>🚑 Lesionado</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { label: 'Idade', value: `${player.age}a`, icon: '🎂' },
            { label: 'Nível', value: `Nv.${player.level}`, icon: '⬆️' },
            { label: 'Valor', value: `$${player.marketValue}k`, icon: '💰' },
            { label: 'Salário', value: `$${player.wage}k/s`, icon: '💳' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0f172a', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#f1f5f9', marginTop: 2 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9' }}>⬆️ Evolução</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {player.level < 10 ? `${xpToNext} XP para nível ${player.level + 1}` : 'Nível MÁXIMO'}
          </div>
        </div>
        <div style={{ height: 10, background: '#334155', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${player.level < 10 ? xpProgress * 100 : 100}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: 99 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
          <span>XP: {player.xp}</span><span>Nível {player.level}/10</span>
        </div>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }}>📊 Atributos</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {attrList.map(([lbl, val, col]) => <AttrBar key={lbl} label={lbl} value={val} color={col} />)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 700 }}>HUMOR</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: MOOD_COLOR[player.mood] }}>{MOOD_LABEL[player.mood]}</div>
          <div style={{ height: 6, background: '#334155', borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${player.moodPoints}%`, height: '100%', background: MOOD_COLOR[player.mood], borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{player.moodPoints}/100</div>
        </div>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 700 }}>ESTILO</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9' }}>{LIFESTYLE_LABEL[player.lifestyle]}</div>
          <div style={{ fontSize: 12, color: '#fde68a', marginTop: 6 }}>-${player.lifestyleExpenses}k/mês</div>
        </div>
      </div>

      {player.rarity === 'legendary' && player.legendaryCard && (
        <div style={{ background: 'linear-gradient(135deg, #78350f, #451a03)', border: '1px solid #d97706', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#fde68a', fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>
            🌟 CARTA LENDÁRIA · {player.legendaryCard.visual.toUpperCase()}
          </div>
          <div style={{ fontSize: 13, color: '#fef3c7', fontStyle: 'italic', marginBottom: 8 }}>"{player.legendaryCard.lore}"</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#fde68a', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: 8 }}>Era: {player.legendaryCard.era}</span>
            <span style={{ fontSize: 12, color: '#4ade80', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: 8 }}>+{Math.round((player.legendaryCard.boostMultiplier - 1) * 100)}% atributos</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => { if (canTrain) trainPlayer(player.id, trainCost); }} disabled={!canTrain} style={{
          flex: 1, padding: '12px', borderRadius: 10, border: 'none',
          background: canTrain ? '#2563eb' : '#374151', color: canTrain ? '#fff' : '#6b7280',
          fontWeight: 800, fontSize: 13, cursor: canTrain ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-body)',
        }}>
          🏋️ Treino Extra<br /><span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>+200 XP · ${trainCost}k</span>
        </button>
        <button onClick={() => {
          const price = Math.round(player.marketValue * 0.8);
          sellPlayer(player.id, price, 'Mercado Livre');
          selectPlayer(null);
        }} style={{
          flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #334155',
          background: '#0f172a', color: '#f87171', fontWeight: 800, fontSize: 13,
          cursor: 'pointer', fontFamily: 'var(--font-body)',
        }}>
          💸 Vender<br /><span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>${Math.round(player.marketValue * 0.8).toLocaleString('pt-BR')}k</span>
        </button>
      </div>
    </div>
  );
}
