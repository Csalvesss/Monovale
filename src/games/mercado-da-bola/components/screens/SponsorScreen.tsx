import React from 'react';
import { useMB } from '../../store/gameStore';
import { ALL_SPONSORS } from '../../data/sponsors';
import type { Sponsor } from '../../types';

const TIER_LABEL: Record<number, string> = { 1: 'Local', 2: 'Regional', 3: 'Nacional' };
const TIER_COLOR: Record<number, string> = { 1: '#64748b', 2: '#3b82f6', 3: '#f59e0b' };

function SponsorCard({ sponsor, active, locked, onSelect }: {
  sponsor: Sponsor; active: boolean; locked: boolean; onSelect: () => void;
}) {
  const tc = TIER_COLOR[sponsor.tier];
  return (
    <div style={{
      background: active ? 'rgba(37,99,235,0.15)' : '#1e293b',
      border: `1px solid ${active ? '#2563eb' : '#334155'}`,
      borderRadius: 14, padding: 16, opacity: locked ? 0.5 : 1, position: 'relative',
    }}>
      {active && (
        <div style={{
          position: 'absolute', top: 8, right: 8, background: '#2563eb', color: '#fff',
          fontSize: 9, fontWeight: 900, letterSpacing: 1, padding: '2px 8px', borderRadius: 99,
        }}>ATIVO</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 32 }}>{sponsor.logo}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{sponsor.name}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 800, background: tc + '22', color: tc, padding: '2px 8px', borderRadius: 99, border: `1px solid ${tc}44` }}>
              Tier {sponsor.tier} · {TIER_LABEL[sponsor.tier]}
            </span>
            <span style={{ fontSize: 11, color: '#64748b' }}>{sponsor.industry}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Vitória', value: sponsor.winFee, icon: '✅', color: '#4ade80' },
          { label: 'Empate', value: sponsor.drawFee, icon: '🟡', color: '#facc15' },
          { label: 'Derrota', value: sponsor.lossFee, icon: '❌', color: '#f87171' },
        ].map(f => (
          <div key={f.label} style={{ background: '#0f172a', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 14 }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: f.color }}>+${f.value}k</div>
            <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>{f.label}</div>
          </div>
        ))}
      </div>
      {locked ? (
        <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>🔒 Reputação mínima: {sponsor.minReputation}</div>
      ) : active ? (
        <div style={{ fontSize: 12, color: '#60a5fa', textAlign: 'center', fontWeight: 700 }}>Patrocínio atual ativo ✓</div>
      ) : (
        <button onClick={onSelect} style={{
          width: '100%', padding: '10px', borderRadius: 8, border: 'none',
          background: '#2563eb', color: '#fff', fontWeight: 800, fontSize: 13,
          cursor: 'pointer', fontFamily: 'var(--font-body)',
        }}>Fechar Patrocínio</button>
      )}
    </div>
  );
}

export default function SponsorScreen() {
  const { state, setSponsor } = useMB();
  const { save } = state;
  if (!save) return null;

  const myStanding = save.standings.find(s => s.teamId === save.myTeamId);
  const sorted = [...save.standings].sort((a, b) => b.points - a.points);
  const position = myStanding ? sorted.findIndex(s => s.teamId === save.myTeamId) + 1 : 10;
  const reputation = Math.max(20, 80 - (position - 1) * 3 + (myStanding?.won ?? 0) * 2);
  const currentSponsor = ALL_SPONSORS.find(s => s.id === save.sponsorId);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9' }}>💰 Patrocínio</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          Reputação: {reputation} · {currentSponsor ? currentSponsor.name : 'Sem patrocinador'}
        </div>
      </div>

      {currentSponsor && (
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f, #1d4ed8)',
          border: '1px solid #2563eb', borderRadius: 14, padding: 16,
        }}>
          <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>PATROCÍNIO ATUAL</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36 }}>{currentSponsor.logo}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{currentSponsor.name}</div>
              <div style={{ fontSize: 12, color: '#93c5fd', marginTop: 4 }}>
                +${currentSponsor.winFee}k (V) / +${currentSponsor.drawFee}k (E) / +${currentSponsor.lossFee}k (D)
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[3, 2, 1].map(tier => (
          <div key={tier}>
            <div style={{ fontSize: 10, fontWeight: 800, color: TIER_COLOR[tier], letterSpacing: 2, marginBottom: 8, paddingLeft: 4 }}>
              ── TIER {tier} · {TIER_LABEL[tier].toUpperCase()} ──
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ALL_SPONSORS.filter(s => s.tier === tier).map(sp => (
                <SponsorCard
                  key={sp.id}
                  sponsor={sp}
                  active={save.sponsorId === sp.id}
                  locked={reputation < sp.minReputation}
                  onSelect={() => setSponsor(sp.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
