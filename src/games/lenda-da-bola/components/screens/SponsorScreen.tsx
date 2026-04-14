import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { SPONSORS } from '../../data/initialData';

export default function SponsorScreen() {
  const { selectedSponsorId, setGameData, budget } = useGameStore();

  function handleSelect(id: string) {
    if (selectedSponsorId === id) return;
    const sponsor = SPONSORS.find(s => s.id === id);
    if (!sponsor) return;
    setGameData({
      selectedSponsorId: id,
      budget: budget + sponsor.reward,
    });
  }

  return (
    <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
      <div className="lenda-section-title">PATROCINADORES</div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {SPONSORS.map((sponsor, i) => {
          const isActive = selectedSponsorId === sponsor.id;
          return (
            <div
              key={sponsor.id}
              className="lenda-anim-fade-up"
              style={{
                animationDelay: `${i * 100}ms`,
                display: 'flex', flexDirection: 'column',
              }}
            >
              <div
                className={`lenda-card${isActive ? ' lenda-anim-pulse-gold' : ''}`}
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: isActive ? '1.5px solid var(--wc-gold)' : '1px solid var(--border-default)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  display: 'flex', flexDirection: 'column',
                  cursor: isActive ? 'default' : 'pointer',
                }}
                onClick={() => handleSelect(sponsor.id)}
              >
                {/* Logo header */}
                <div style={{
                  padding: '28px 20px',
                  background: isActive
                    ? `linear-gradient(135deg, ${sponsor.color}22, ${sponsor.color}11)`
                    : 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderBottom: '1px solid var(--border-default)',
                  flexDirection: 'column', gap: 8, position: 'relative',
                }}>
                  <div style={{
                    width: 64, height: 64,
                    background: '#fff',
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}>
                    {sponsor.logo}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 24, letterSpacing: '0.08em',
                    color: isActive ? 'var(--wc-gold)' : 'var(--text-primary)',
                  }}>
                    {sponsor.name}
                  </div>

                  {isActive && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'rgba(251,191,36,0.15)',
                      border: '1px solid var(--border-gold)',
                      borderRadius: 'var(--r-pill)',
                      padding: '3px 8px',
                      fontSize: 10, fontWeight: 700, color: 'var(--wc-gold)',
                    }}>
                      <CheckCircle size={10} />
                      ATIVO
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Reward */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px',
                    background: 'rgba(251,191,36,0.06)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 'var(--r-md)',
                  }}>
                    <div className="lenda-label">Bônus de Assinatura</div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 20,
                      color: 'var(--wc-gold)', letterSpacing: '0.05em',
                    }}>
                      €{new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(sponsor.reward)}
                    </div>
                  </div>

                  {/* Requirement */}
                  <div>
                    <div className="lenda-label" style={{ marginBottom: 4 }}>REQUISITO</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      📋 {sponsor.requirement}
                    </div>
                  </div>

                  {/* Perks */}
                  <div>
                    <div className="lenda-label" style={{ marginBottom: 6 }}>BENEFÍCIOS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {sponsor.perks.map((perk, pi) => (
                        <div key={pi} style={{
                          fontSize: 12, color: 'var(--text-secondary)',
                          display: 'flex', alignItems: 'flex-start', gap: 6,
                        }}>
                          <span style={{ color: 'var(--wc-gold)', flexShrink: 0 }}>✓</span>
                          {perk}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={e => { e.stopPropagation(); handleSelect(sponsor.id); }}
                    disabled={isActive}
                    style={{
                      marginTop: 4,
                      padding: '12px',
                      background: isActive
                        ? 'rgba(251,191,36,0.1)'
                        : 'linear-gradient(135deg, var(--wc-gold), var(--wc-gold-dark))',
                      color: isActive ? 'var(--wc-gold)' : '#000',
                      border: isActive ? '1px solid var(--border-gold)' : 'none',
                      borderRadius: 'var(--r-md)',
                      fontFamily: 'var(--font-display)',
                      fontSize: 17, letterSpacing: '0.08em',
                      cursor: isActive ? 'not-allowed' : 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {isActive ? '✅ CONTRATO ATIVO' : '✍️ ASSINAR CONTRATO'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
