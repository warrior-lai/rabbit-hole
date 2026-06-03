import { useState, useCallback } from 'react';
import type { GameState } from '@shared/types';
import { CardHand } from './CardHand';
import { VotingBoard } from './VotingBoard';
import { RoundResults } from './RoundResults';
import { Scoreboard } from './Scoreboard';
import { Timer } from './Timer';

interface GameBoardProps {
  t: (key: string) => string;
  gameState: GameState;
  playerId: string;
  myHand: string[];
  revealedCards: { playerId: string; cardId: string }[];
  onSubmitClue: (cardId: string, clue: string) => void;
  onPlayCard: (cardId: string) => void;
  onVote: (cardId: string) => void;
}

const TURN_SECONDS = 30;
const VOTE_SECONDS = 30;

export function GameBoard({
  t, gameState, playerId, myHand, revealedCards,
  onSubmitClue, onPlayCard, onVote
}: GameBoardProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [clue, setClue] = useState('');
  const isStoryteller = gameState.currentStorytellerId === playerId;
  const storyteller = gameState.players.find(p => p.id === gameState.currentStorytellerId);
  const hasPlayed = gameState.playedCards.some(c => c.playerId === playerId);
  const hasVoted = gameState.votes.some(v => v.voterId === playerId);
  const myPlayedCard = gameState.playedCards.find(c => c.playerId === playerId)?.cardId;
  const activePlayers = gameState.players.filter(p => p.isConnected);

  const handleClueSubmit = useCallback(() => {
    if (selectedCard && clue.trim()) {
      onSubmitClue(selectedCard, clue.trim());
      setClue('');
      setSelectedCard(null);
    }
  }, [selectedCard, clue, onSubmitClue]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 16px',
      maxWidth: '900px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid #1a1a1a',
        marginBottom: '16px',
      }}>
        <span style={{ fontSize: '13px' }}>
          <span style={{ color: '#F7931A', fontWeight: 700 }}>🐇 </span>
          <span style={{ color: '#555' }}>Round </span>
          <span style={{ color: '#fff', fontWeight: 700 }}>{gameState.round}</span>
        </span>
        <span style={{ fontSize: '12px', color: '#666' }}>
          🎭 {storyteller?.name}
          {isStoryteller && <span style={{ color: '#F7931A' }}> ({t('you')})</span>}
        </span>
      </div>

      {/* Persistent clue banner — always visible when there's a clue */}
      {gameState.clue && gameState.phase !== 'storytelling' && (
        <div style={{
          width: '100%',
          maxWidth: '800px',
          background: 'rgba(247,147,26,0.1)',
          border: '1px solid rgba(247,147,26,0.25)',
          borderRadius: '16px',
          padding: '14px 20px',
          marginBottom: '16px',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
            🎭 {storyteller?.name}
          </p>
          <p style={{ fontSize: '22px', fontWeight: 700, color: '#F7931A' }}>
            "{gameState.clue}"
          </p>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1 }}>

        {/* ===== STORYTELLING ===== */}
        {gameState.phase === 'storytelling' && isStoryteller && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '4px', color: '#F7931A' }}>
              🎭 {t('yourTurn')}
            </h2>
            <Timer seconds={TURN_SECONDS} onTimeUp={() => {}} />
            <CardHand cards={myHand} selectedCard={selectedCard} onSelect={setSelectedCard} />
            {selectedCard && (
              <div style={{
                display: 'flex', gap: '8px',
                maxWidth: '400px', margin: '16px auto 0',
              }}>
                <input
                  className="input"
                  type="text"
                  placeholder={t('enterClue')}
                  value={clue}
                  onChange={(e) => setClue(e.target.value)}
                  maxLength={100}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleClueSubmit()}
                />
                <button className="btn btn-primary" disabled={!clue.trim()} onClick={handleClueSubmit}>
                  ✓
                </button>
              </div>
            )}
          </div>
        )}

        {gameState.phase === 'storytelling' && !isStoryteller && (
          <div className="fade-in" style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div className="pulse" style={{ fontSize: '56px', marginBottom: '16px' }}>🎭</div>
            <p style={{ color: '#888', fontSize: '16px' }}>
              <strong>{storyteller?.name}</strong> {lang === 'es' ? 'está pensando...' : 'is thinking...'}
            </p>
            <p style={{ color: '#444', fontSize: '12px', marginTop: '8px' }}>
              {t('waitingForCards')}
            </p>
          </div>
        )}

        {/* ===== CHOOSING ===== */}
        {gameState.phase === 'choosing' && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            {!isStoryteller && !hasPlayed && (
              <>
                <Timer seconds={TURN_SECONDS} onTimeUp={() => {}} />
                <p style={{ color: '#999', fontSize: '13px', marginBottom: '8px' }}>
                  {t('pickCard')}
                </p>
                <CardHand
                  cards={myHand}
                  selectedCard={null}
                  onSelect={(id) => onPlayCard(id)}
                />
              </>
            )}

            {(isStoryteller || hasPlayed) && (
              <div style={{ paddingTop: '16px' }}>
                <p className="pulse" style={{ color: '#555', fontSize: '14px' }}>
                  {t('waitingForCards')}
                </p>
                <p style={{ color: '#333', fontSize: '12px', marginTop: '4px' }}>
                  {gameState.playedCards.length}/{activePlayers.length} ✓
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== VOTING ===== */}
        {gameState.phase === 'voting' && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            {!isStoryteller && !hasVoted ? (
              <>
                <Timer seconds={VOTE_SECONDS} onTimeUp={() => {}} />
                <p style={{ color: '#999', fontSize: '13px', marginBottom: '8px' }}>
                  {t('voteNow')}
                </p>
                <VotingBoard
                  cards={revealedCards}
                  myCardId={myPlayedCard}
                  onVote={onVote}
                  cantVoteOwnText={t('cantVoteOwn')}
                />
              </>
            ) : (
              <div style={{ paddingTop: '16px' }}>
                <p className="pulse" style={{ color: '#555', fontSize: '14px' }}>
                  {t('waitingForVotes')}
                </p>
                <p style={{ color: '#333', fontSize: '12px', marginTop: '4px' }}>
                  {gameState.votes.length}/{activePlayers.filter(p => p.id !== gameState.currentStorytellerId).length} ✓
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== SCORING ===== */}
        {gameState.phase === 'scoring' && gameState.roundResults.length > 0 && (
          <RoundResults
            t={t}
            result={gameState.roundResults[gameState.roundResults.length - 1]}
            players={gameState.players}
            playerId={playerId}
          />
        )}
      </div>

      {/* Scoreboard - always at bottom */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #1a1a1a' }}>
        <Scoreboard players={gameState.players} currentStorytellerId={gameState.currentStorytellerId} />
      </div>
    </div>
  );
}

// Need lang for the waiting message
const lang = navigator.language.startsWith('es') ? 'es' : 'en';
