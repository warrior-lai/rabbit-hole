import { useState } from 'react';
import { getCardImage } from './CardHand';

interface VotingBoardProps {
  cards: { playerId: string; cardId: string }[];
  myCardId: string | undefined;
  onVote: (cardId: string) => void;
  cantVoteOwnText: string;
}

export function VotingBoard({ cards, myCardId, onVote, cantVoteOwnText }: VotingBoardProps) {
  const [votedCard, setVotedCard] = useState<string | null>(null);

  const handleVote = (cardId: string) => {
    setVotedCard(cardId);
    onVote(cardId);
  };

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
        const isVoted = votedCard === card.cardId;
        const hasVoted = votedCard !== null;

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
              background: isVoted ? '#2ecc71' : '#F7931A',
              color: isVoted ? '#fff' : '#000',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
              zIndex: 2,
              transition: 'all 0.3s ease',
              boxShadow: isVoted ? '0 0 12px rgba(46,204,113,0.5)' : 'none',
            }}>
              {isVoted ? '✓' : index + 1}
            </div>

            <div
              className="game-card"
              onClick={() => {
                if (!isMyCard && !hasVoted) handleVote(card.cardId);
              }}
              style={{
                opacity: isMyCard ? 0.3 : hasVoted && !isVoted ? 0.4 : 1,
                cursor: isMyCard || hasVoted ? 'not-allowed' : 'pointer',
                border: isVoted ? '3px solid #2ecc71' : '2px solid transparent',
                boxShadow: isVoted ? '0 0 25px rgba(46,204,113,0.3)' : 'none',
                transform: isVoted ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease',
              }}
            >
              <img src={getCardImage(card.cardId)} alt={`Card ${index + 1}`} draggable={false} />
            </div>

            {/* Voted badge */}
            {isVoted && (
              <p style={{
                color: '#2ecc71',
                fontSize: '11px',
                textAlign: 'center',
                marginTop: '6px',
                fontWeight: 700,
                animation: 'fadeIn 0.3s ease',
              }}>
                ✓ {navigator.language.startsWith('es') ? 'Tu voto' : 'Your vote'}
              </p>
            )}

            {/* Can't vote own card */}
            {isMyCard && !hasVoted && (
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
