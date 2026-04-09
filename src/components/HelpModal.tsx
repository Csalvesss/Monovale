import React from 'react';

interface Props {
  onClose: () => void;
}

const SECTIONS = [
  {
    color: '#059669',
    title: 'Objetivo',
    text: 'Ser o último jogador com dinheiro. Os demais vão à falência ao não conseguir pagar dívidas.',
  },
  {
    color: '#3b82f6',
    title: 'Início do jogo',
    text: 'Cada jogador começa com R$1.500 no Pedágio da Dutra (casa 0). A ordem dos turnos é definida pelo jogo.',
  },
  {
    color: '#6366f1',
    title: 'Seu turno',
    text: 'Role os dados e mova seu peão o número de casas indicado. Em seguida, realize a ação da casa em que parou.',
  },
  {
    color: '#f59e0b',
    title: 'Dados iguais',
    text: 'Tirou o mesmo número nos dois dados? Jogue novamente após resolver a casa! Se tirar dados iguais três vezes seguidas, você vai direto para o DETRAN (preso).',
  },
  {
    color: '#10b981',
    title: 'Pedágio da Dutra (Início)',
    text: 'Toda vez que passar ou parar nesta casa, receba R$200 do banco. É a principal fonte de renda do jogo.',
  },
  {
    color: '#8b5cf6',
    title: 'Bilhete da Fortuna / Voz do Vale',
    text: 'Compre uma carta do baralho. Ela pode dar dinheiro, tirar dinheiro, mover seu peão ou liberar você do DETRAN.',
  },
  {
    color: '#ef4444',
    title: 'Preso no DETRAN',
    text: 'Você pode sair pagando R$50, usando um "Bilhete de Liberdade" (carta especial), ou tirando dados iguais. Você permanece preso por até 3 turnos; depois paga obrigatoriamente R$50.',
  },
  {
    color: '#0ea5e9',
    title: 'Comprar propriedades',
    text: 'Ao parar em uma propriedade sem dono, você pode comprar pelo preço indicado. Se recusar, ela vai a leilão entre todos os jogadores.',
  },
  {
    color: '#22c55e',
    title: 'Construir casas e hotel',
    text: 'Ao ter o grupo completo (todas as propriedades da cor), você pode construir casas. Com 4 casas, pode trocar por um hotel. Mais casas = aluguel maior. Construções devem ser distribuídas uniformemente no grupo.',
  },
  {
    color: '#f97316',
    title: 'Pagar aluguel',
    text: 'Ao parar na propriedade de outro jogador, pague o aluguel indicado. Com o grupo completo sem casas, o aluguel dobra. Propriedades hipotecadas não cobram aluguel.',
  },
  {
    color: '#64748b',
    title: 'Hipotecar',
    text: 'Em apuros? Hipoteque uma propriedade (sem casas) para receber metade do valor. Você não cobra aluguel nela enquanto hipotecada. Para resgatar, pague 55% do valor original.',
  },
  {
    color: '#0891b2',
    title: 'Negociar',
    text: 'Use o botão "Negociar" para propor trocas de propriedades com outros jogadores. Acordos mútuos podem virar o jogo.',
  },
  {
    color: '#dc2626',
    title: 'Falência',
    text: 'Se não conseguir pagar uma dívida (aluguel, imposto ou leilão), você vai à falência. Todas as suas propriedades voltam ao banco e você sai do jogo.',
  },
  {
    color: '#374151',
    title: 'Estações e Empresas',
    text: 'Estações: aluguel aumenta com cada estação que você possui (1=R$25, 2=R$50, 3=R$100, 4=R$200). Empresas: o aluguel é 4× ou 10× o valor dos dados, dependendo de quantas você tem.',
  },
];

export default function HelpModal({ onClose }: Props) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.header}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={S.headerTitle}>Como Jogar — Monovale</span>
          <button style={S.closeBtn} onClick={onClose} aria-label="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={S.body}>
          {SECTIONS.map((sec, i) => (
            <div key={i} style={S.section}>
              <div style={{ ...S.accent, background: sec.color }} />
              <div style={S.sectionInner}>
                <div style={S.sectionTitle}>{sec.title}</div>
                <div style={S.sectionText}>{sec.text}</div>
              </div>
            </div>
          ))}

          <div style={S.tip}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span>Dica: clique em qualquer propriedade no tabuleiro para ver os detalhes, valores de aluguel e quem é o dono.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    backdropFilter: 'blur(6px)',
    padding: '16px',
  },
  modal: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxWidth: 520,
    maxHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
    animation: 'pop-in 0.22s ease',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '13px 16px',
    background: 'linear-gradient(90deg, #065F46, #059669)',
    flexShrink: 0,
  },
  headerTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    flex: 1,
    letterSpacing: '0.3px',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    padding: 0,
  },
  body: {
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  section: {
    display: 'flex',
    gap: 0,
    background: 'var(--card-alt)',
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid var(--border)',
  },
  accent: {
    width: 4,
    flexShrink: 0,
  },
  sectionInner: {
    padding: '10px 12px',
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    fontWeight: 800,
    color: 'var(--text)',
    marginBottom: 3,
  },
  sectionText: {
    fontSize: 12,
    color: 'var(--text-mid)',
    lineHeight: 1.55,
    fontWeight: 500,
  },
  tip: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 12,
    color: 'var(--green-dark)',
    fontWeight: 600,
    lineHeight: 1.5,
  },
};
