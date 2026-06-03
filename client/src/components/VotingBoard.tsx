interface VotingBoardProps {
  cards: { playerId: string; cardId: string }[];
  myCardId: string | undefined;
  onVote: (cardId: string) => void;
  cantVoteOwnText: string;
}

import { getCardImage } from './CardHand';

export function VotingBoard({ cards, myCardId, onVote, cantVoteOwnText }: VotingBoardProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      flexWrap: 'wrap',
      padding: '8px 0',
    }}>
      {cards.map((card, index) => {
        const isMyCard = card.cardId === myCardId;
        return (
          <div
            key={card.cardId}
            style={{ position: 'relative' }}
          >
            {/* Card number */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#F7931A',
              color: '#000',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
              zIndex: 2,
            }}>
              {index + 1}
            </div>

            <div
              className={`game-card ${isMyCard ? '' : ''}`}
              onClick={() => {
                if (!isMyCard) onVote(card.cardId);
              }}
              style={{
                opacity: isMyCard ? 0.4 : 1,
                cursor: isMyCard ? 'not-allowed' : 'pointer',
              }}
            >
              <img src={getCardImage(card.cardId)} alt={`Card ${index + 1}`} draggable={false} />
            </div>

            {isMyCard && (
              <p style={{ color: '#666', fontSize: '9px', textAlign: 'center', marginTop: '4px', maxWidth: '120px' }}>
                {cantVoteOwnText}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
