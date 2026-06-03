import { useState } from 'react';

interface CardHandProps {
  cards: string[];
  selectedCard: string | null;
  onSelect: (cardId: string) => void;
  disabled?: boolean;
}

// Card image: use real art if available, fallback to generated placeholder
export function getCardImage(cardId: string): string {
  const num = parseInt(cardId.replace('card_', ''), 10) || 0;
  
  // Real card art (add more as they come)
  const realCards: Record<number, string> = {
    1: '/cards/card_001.jpg',
    2: '/cards/card_002.jpg',
    3: '/cards/card_003.jpg',
    4: '/cards/card_004.jpg',
    5: '/cards/card_005.jpg',
  };
  
  if (realCards[num]) return realCards[num];
  
  // Placeholder: warm abstract gradient matching game aesthetic
  const hue1 = (num * 37 + 20) % 60 + 10; // warm range: 10-70 (oranges/ambers)
  const hue2 = (num * 73 + 240) % 60 + 250; // cool range: 250-310 (purples)
  const cx1 = 40 + (num * 13) % 160;
  const cy1 = 40 + (num * 17) % 160;
  const r1 = 30 + (num * 7) % 60;
  const cx2 = 80 + (num * 23) % 80;
  const cy2 = 160 + (num * 11) % 100;
  const r2 = 20 + (num * 9) % 70;

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="340" viewBox="0 0 240 340">
      <defs>
        <radialGradient id="bg${num}" cx="30%" cy="30%">
          <stop offset="0%" style="stop-color:hsl(${hue1},60%,30%)" />
          <stop offset="100%" style="stop-color:hsl(${hue2},40%,12%)" />
        </radialGradient>
      </defs>
      <rect width="240" height="340" fill="url(#bg${num})" rx="16"/>
      <circle cx="${cx1}" cy="${cy1}" r="${r1}" fill="hsla(35,70%,50%,0.1)" />
      <circle cx="${cx2}" cy="${cy2}" r="${r2}" fill="hsla(280,50%,40%,0.08)" />
      <text x="120" y="180" text-anchor="middle" font-size="40" fill="rgba(255,255,255,0.04)" font-family="serif">?</text>
    </svg>
  `)}`;
}

export function CardHand({ cards, selectedCard, onSelect, disabled }: CardHandProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      flexWrap: 'wrap',
      padding: '8px 0',
      perspective: '800px',
    }}>
      {cards.map((cardId, index) => {
        const isSelected = selectedCard === cardId;
        const isHovered = hoveredCard === cardId;
        // Fan effect: slight rotation based on position
        const totalCards = cards.length;
        const mid = (totalCards - 1) / 2;
        const rotation = (index - mid) * 3;
        const yOffset = Math.abs(index - mid) * 4;

        return (
          <div
            key={cardId}
            className={`game-card ${isSelected ? 'selected' : ''}`}
            onClick={() => !disabled && onSelect(cardId)}
            onMouseEnter={() => setHoveredCard(cardId)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              transform: `rotate(${isHovered ? 0 : rotation}deg) translateY(${isHovered ? -12 : isSelected ? -10 : yOffset}px)`,
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.2s ease',
              zIndex: isHovered ? 10 : index,
            }}
          >
            <img src={getCardImage(cardId)} alt="" draggable={false} />
          </div>
        );
      })}
    </div>
  );
}
