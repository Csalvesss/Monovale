import React from 'react';
import { useMB } from '../../store/gameStore';
import { ALL_SPONSORS } from '../../data/sponsors';
import type { Sponsor } from '../../types';
import { CheckCircle, Minus, XCircle, Lock, Star, Handshake } from 'lucide-react';

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<number, { label: string; color: string; glow: string }> = {
  1: { label: 'Local',    color: 'rgba(148,163,184,0.9)', glow: 'rgba(148,163,184,0.15)' },
  2: { label: 'Regional', color: 'rgba(96,165,250,0.9)',  glow: 'rgba(96,165,250,0.12)' },
  3: { label: 'Nacional', color: 'var(--ldb-gold-bright)', glow: 'rgba(255,215,0,0.12)' },
};

// ─── Sponsor card ─────────────────────────────────────────────────────────────

function SponsorCard({ sponsor, active, locked, onSelect }: {
  sponsor: Sponsor; active: boolean; locked: boolean; onSelect: () => void;
}) {
  const tc = TIER_CONFIG[sponsor.tier];

  return (
    <div style={{
      borderRadius: 16,
      border: active
        ? '1.5px solid rgba(26,122,64,0.5)'
        : '1px solid rgba(255,255,255,0.07)',
      background: active ? 'rgba(26,122,64,0.08)' : 'var(--ldb-surface)',
      overflow: 'hidden',
      opacity: locked ? 0.5 : 1,
      transition: 'all 0.15s ease',
    }}>
      {active && (
        <div style={{
          background: 'var(--ldb-pitch-mid)',
          padding: '4px 12px', textAlign: 'center',
          fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
          color: '#fff', textTransform: 'uppercase',
        }}>PATROCINADOR ATIVO</div>
      )}

      <div style={{ padding: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: tc.glow, border: `1px solid ${tc.color}33`,
            fontSize: 26,
          }}>
            {sponsor.logo}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0 }}>{sponsor.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 9, fontWeight: 900,
                background: tc.glow, color: tc.color,
                borderRadius: 6, padding: '2px 8px',
                border: `1px solid ${tc.color}33`,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>Tier {sponsor.tier} · {tc.label}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sponsor.industry}</span>
            </div>
          </div>
        </div>

        {/* Fee grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Vitória', value: sponsor.winFee,  Icon: CheckCircle, color: 'var(--ldb-pitch-bright)', bg: 'rgba(26,122,64,0.12)' },
            { label: 'Empate',  value: sponsor.drawFee, Icon: Minus,       color: 'rgba(255,180,50,0.9)',     bg: 'rgba(255,180,50,0.08)' },
            { label: 'Derrota', value: sponsor.lossFee, Icon: XCircle,     color: 'rgba(255,80,80,0.9)',      bg: 'rgba(255,80,80,0.08)' },
          ].map(({ label, value, Icon, color, bg }) => (
            <div key={label} style={{
              borderRadius: 10, padding: '10px 6px', textAlign: 'center',
              background: bg, border: `1px solid ${color}22`,
            }}>
              <Icon size={14} color={color} style={{ margin: '0 auto 4px' }} />
              <p style={{ fontSize: 13, fontWeight: 900, color, margin: 0, fontFamily: 'var(--ldb-font-display)', letterSpacing: '0.04em' }}>
                +${value}k
              </p>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Action */}
        {locked ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)',
            background: 'var(--ldb-deep)', padding: '10px 0',
            fontSize: 12, color: 'rgba(255,255,255,0.3)',
          }}>
            <Lock size={12} />
            Reputação mínima: {sponsor.minReputation}
          </div>
        ) : active ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 10, border: '1px solid rgba(26,122,64,0.3)',
            background: 'rgba(26,122,64,0.1)', padding: '10px 0',
            fontSize: 12, fontWeight: 700, color: 'var(--ldb-pitch-bright)',
          }}>
            <CheckCircle size={12} />
            Patrocínio ativo
          </div>
        ) : (
          <button
            onClick={onSelect}
            className="ldb-btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Fechar Patrocínio
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SponsorScreen() {
  const { state, setSponsor } = useMB();
  const { save } = state;
  if (!save) return null;

  const myStanding     = save.standings.find(s => s.teamId === save.myTeamId);
  const sorted         = [...save.standings].sort((a, b) => b.points - a.points);
  const position       = myStanding ? sorted.findIndex(s => s.teamId === save.myTeamId) + 1 : 10;
  const reputation     = Math.max(20, 80 - (position - 1) * 3 + (myStanding?.won ?? 0) * 2);
  const currentSponsor = ALL_SPONSORS.find(s => s.id === save.sponsorId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '16px 16px 32px' }}>

      {/* ── Header ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.2)',
          }}>
            <Handshake size={18} color="var(--ldb-gold-bright)" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 22, letterSpacing: '0.04em', color: '#fff', margin: 0 }}>PATROCÍNIO</h2>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
              {currentSponsor ? currentSponsor.name : 'Sem patrocinador ativo'}
            </p>
          </div>
        </div>

        {/* Reputation bar */}
        <div style={{ background: 'var(--ldb-surface)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={12} color="var(--ldb-gold-bright)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Reputação</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--ldb-gold-bright)', fontFamily: 'var(--ldb-font-display)', letterSpacing: '0.04em' }}>
              {reputation}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--ldb-elevated)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${Math.min(100, reputation)}%`,
              background: 'linear-gradient(90deg, var(--ldb-gold-deep), var(--ldb-gold-bright))',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </div>

      {/* ── Active sponsor highlight ── */}
      {currentSponsor && (
        <div style={{
          borderRadius: 16, padding: 20,
          background: 'linear-gradient(135deg, rgba(26,122,64,0.2) 0%, rgba(26,122,64,0.05) 100%)',
          border: '1px solid rgba(26,122,64,0.3)',
        }}>
          <p className="ldb-section-label" style={{ marginBottom: 12 }}>Patrocínio Atual</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.1)', fontSize: 30,
            }}>
              {currentSponsor.logo}
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0, fontFamily: 'var(--ldb-font-display)', letterSpacing: '0.04em' }}>
                {currentSponsor.name.toUpperCase()}
              </p>
              <p style={{ fontSize: 12, color: 'var(--ldb-pitch-bright)', marginTop: 4, fontWeight: 700 }}>
                +${currentSponsor.winFee}k (V) · +${currentSponsor.drawFee}k (E) · +${currentSponsor.lossFee}k (D)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Sponsor tiers ── */}
      {[3, 2, 1].map(tier => {
        const tc = TIER_CONFIG[tier];
        const sponsors = ALL_SPONSORS.filter(s => s.tier === tier);
        return (
          <div key={tier}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: `${tc.color}33` }} />
              <span style={{
                fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: tc.color,
              }}>Tier {tier} · {tc.label}</span>
              <div style={{ flex: 1, height: 1, background: `${tc.color}33` }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sponsors.map(sp => (
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
        );
      })}
    </div>
  );
}
