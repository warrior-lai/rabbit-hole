import { useState, useCallback } from 'react';
import type { GameState } from '@shared/types';
import { CardHand } from './CardHand';
import { VotingBoard } from './VotingBoard';
import { RoundResults } from './RoundResults';
import { Scoreboard } from './Scoreboard';
import { Timer } from './Timer';
import { PhaseInstruction } from './PhaseInstruction';

interface GameBoardProps {
  t: (key: string) => string;
  gameState: GameState;
  playerId: string;
  myHand: string[];
  revealedCards: { playerId: string; cardId: string }[];
  onSubmitClue: (cardId: string, clue: string) => void;
  onPlayCard: (cardId: string) => void;
  onVote: (cardId: string) => void;
  onNextRound: () => void;
  onLeaveGame: () => void;
  onEndGame: () => void;
  isHost: boolean;
}

const TURN_SECONDS = 30;
const VOTE_SECONDS = 30;

export function GameBoard({
  t, gameState, playerId, myHand, revealedCards,
  onSubmitClue, onPlayCard, onVote, onNextRound, onLeaveGame, onEndGame, isHost
}: GameBoardProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [clue, setClue] = useState('');
  const isStoryteller = gameState.currentStorytellerId === playerId;
  const storyteller = gameState.players.find(p => p.id === gameState.currentStorytellerId);
  const hasPlayed = gameState.playedCards.some(c => c.playerId === playerId);
  const hasVoted = gameState.votes.some(v => v.voterId === playerId);
  const myPlayedCard = gameState.playedCards.find(c => c.playerId === playerId)?.cardId;
  const activePlayers = gameState.players.filter(p => p.isConnected);
  const lang = gameState.language || (navigator.language.startsWith('es') ? 'es' : 'en');

  const handleClueSubmit = useCallback(() => {
    if (selectedCard && clue.trim()) {
      onSubmitClue(selectedCard, clue.trim());
      setClue('');
      setSelectedCard(null);
    }
  }, [selectedCard, clue, onSubmitClue]);

  // Determine instruction phase
  const getInstructionPhase = () => {
    if (gameState.phase === 'storytelling') return isStoryteller ? 'storytelling-you' : 'storytelling-wait';
    if (gameState.phase === 'choosing') return hasPlayed || isStoryteller ? 'choosing-done' : 'choosing';
    if (gameState.phase === 'voting') return hasVoted || isStoryteller ? 'voting-done' : 'voting';
    return 'scoring';
  };

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
      {/* ===== HEADER BAR ===== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        background: 'rgba(10,10,15,0.5)',
        borderRadius: '12px',
        backdropFilter: 'blur(16px)',
        marginBottom: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{ fontSize: '18px', cursor: 'pointer', transition: 'transform 0.3s' }}
            onClick={onLeaveGame}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3) rotate(-10deg)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title={lang === 'es' ? 'Abandonar juego' : 'Leave game'}
          >🐇</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
            {lang === 'es' ? 'Ronda' : 'Round'}
          </span>
          <span style={{ color: '#F7931A', fontWeight: 700, fontSize: '16px' }}>
            {gameState.round}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>🎭</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            {storyteller?.name}
            {isStoryteller && <span style={{ color: '#F7931A' }}> ({lang === 'es' ? 'vos' : 'you'})</span>}
          </span>
        </div>
        <div style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.3)',
        }}>
          {activePlayers.length} 👥
        </div>
      </div>

      {/* ===== PERSISTENT CLUE BANNER ===== */}
      {gameState.clue && gameState.phase !== 'storytelling' && (
        <div style={{
          background: 'rgba(247,147,26,0.08)',
          border: '1px solid rgba(247,147,26,0.2)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '12px',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '10px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}>
            🎭 {storyteller?.name}
          </p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#F7931A',
            textShadow: '0 0 20px rgba(247,147,26,0.2)',
          }}>
            "{gameState.clue}"
          </p>
        </div>
      )}

      {/* ===== INSTRUCTION BANNER ===== */}
      {gameState.phase !== 'scoring' && (
        <PhaseInstruction
          lang={lang}
          phase={getInstructionPhase() as any}
          storytellerName={storyteller?.name}
        />
      )}

      {/* ===== TIMER ===== */}
      {((gameState.phase === 'storytelling' && isStoryteller) ||
        (gameState.phase === 'choosing' && !isStoryteller && !hasPlayed) ||
        (gameState.phase === 'voting' && !isStoryteller && !hasVoted)) && (
        <Timer
          seconds={gameState.phase === 'voting' ? VOTE_SECONDS : TURN_SECONDS}
          onTimeUp={() => {}}
        />
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ flex: 1 }}>

        {/* STORYTELLING: Storyteller picks card + clue */}
        {gameState.phase === 'storytelling' && isStoryteller && (
          <div className="fade-in">
            <CardHand cards={myHand} selectedCard={selectedCard} onSelect={setSelectedCard} />
            {selectedCard && (
              <div style={{
                display: 'flex',
                gap: '8px',
                maxWidth: '400px',
                margin: '16px auto 0',
              }}>
                <input
                  className="input"
                  type="text"
                  placeholder={lang === 'es' ? 'Escribí tu pista...' : 'Write your clue...'}
                  value={clue}
                  onChange={(e) => setClue(e.target.value)}
                  maxLength={100}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleClueSubmit()}
                  style={{ borderRadius: '12px' }}
                />
                <button
                  className="btn btn-accent"
                  disabled={!clue.trim()}
                  onClick={handleClueSubmit}
                  style={{ padding: '14px 20px', borderRadius: '12px' }}
                >
                  ✓
                </button>
              </div>
            )}
          </div>
        )}

        {/* STORYTELLING: Others wait — interactive rabbit */}
        {gameState.phase === 'storytelling' && !isStoryteller && (
          <div className="fade-in" style={{ textAlign: 'center', paddingTop: '24px' }}>
            <div style={{
              fontSize: '80px',
              filter: 'drop-shadow(0 0 30px rgba(247,147,26,0.4))',
              animation: 'rabbitFloat 4s ease-in-out infinite',
              cursor: 'pointer',
              userSelect: 'none',
            }}
              onClick={(e) => {
                e.currentTarget.style.animation = 'none';
                e.currentTarget.style.transform = 'scale(1.3) rotate(15deg)';
                setTimeout(() => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.animation = 'rabbitFloat 4s ease-in-out infinite';
                }, 400);
              }}
            >🐇</div>
            <style>{`
              @keyframes rabbitFloat {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                25% { transform: translateY(-12px) rotate(-3deg); }
                50% { transform: translateY(-4px) rotate(0deg); }
                75% { transform: translateY(-16px) rotate(3deg); }
              }
            `}</style>
          </div>
        )}

        {/* CHOOSING: Pick your card */}
        {gameState.phase === 'choosing' && !isStoryteller && !hasPlayed && (
          <div className="fade-in">
            <CardHand
              cards={myHand}
              selectedCard={null}
              onSelect={(id) => onPlayCard(id)}
            />
          </div>
        )}

        {/* CHOOSING: Waiting */}
        {gameState.phase === 'choosing' && (isStoryteller || hasPlayed) && (
          <div style={{ textAlign: 'center', paddingTop: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '30px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.4)',
            }}>
              <span className="pulse">⏳</span>
              {gameState.playedCards.length}/{activePlayers.length}
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>
                {lang === 'es' ? 'cartas elegidas' : 'cards chosen'}
              </span>
            </div>
          </div>
        )}

        {/* VOTING: Vote for storyteller's card */}
        {gameState.phase === 'voting' && !isStoryteller && !hasVoted && (
          <div className="fade-in">
            <VotingBoard
              cards={revealedCards}
              myCardId={myPlayedCard}
              onVote={onVote}
              cantVoteOwnText={t('cantVoteOwn')}
            />
          </div>
        )}

        {/* VOTING: Waiting */}
        {gameState.phase === 'voting' && (isStoryteller || hasVoted) && (
          <div style={{ textAlign: 'center', paddingTop: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '30px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.4)',
            }}>
              <span className="pulse">🗳️</span>
              {gameState.votes.length}/{activePlayers.filter(p => p.id !== gameState.currentStorytellerId).length}
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>
                {lang === 'es' ? 'votos' : 'votes'}
              </span>
            </div>
          </div>
        )}

        {/* SCORING */}
        {gameState.phase === 'scoring' && gameState.roundResults.length > 0 && (
          <div>
            <RoundResults
              t={t}
              result={gameState.roundResults[gameState.roundResults.length - 1]}
              players={gameState.players}
              playerId={playerId}
            />
            <button
              className="btn btn-accent"
              onClick={onNextRound}
              style={{
                width: '100%',
                marginTop: '20px',
                fontSize: '16px',
                padding: '16px',
              }}
            >
              ▶ {lang === 'es' ? 'Siguiente Ronda' : 'Next Round'}
            </button>
          </div>
        )}
      </div>

      {/* ===== SCOREBOARD ===== */}
      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <Scoreboard players={gameState.players} currentStorytellerId={gameState.currentStorytellerId} />
        <button
          onClick={onLeaveGame}
          style={{
            width: '100%',
            marginTop: '8px',
            padding: '10px',
            background: 'none',
            border: '1px solid rgba(231,76,60,0.2)',
            borderRadius: '10px',
            color: 'rgba(231,76,60,0.5)',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(231,76,60,0.5)'; e.currentTarget.style.color = '#e74c3c'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(231,76,60,0.2)'; e.currentTarget.style.color = 'rgba(231,76,60,0.5)'; }}
        >
          🚪 {lang === 'es' ? 'Abandonar Juego' : 'Leave Game'}
        </button>
        {isHost && (
          <button
            onClick={onEndGame}
            style={{
              width: '100%',
              marginTop: '4px',
              padding: '10px',
              background: 'none',
              border: '1px solid rgba(247,147,26,0.2)',
              borderRadius: '10px',
              color: 'rgba(247,147,26,0.5)',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(247,147,26,0.5)'; e.currentTarget.style.color = '#F7931A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(247,147,26,0.2)'; e.currentTarget.style.color = 'rgba(247,147,26,0.5)'; }}
          >
            🏁 {lang === 'es' ? 'Finalizar Partida' : 'End Game'}
          </button>
        )}
      </div>
    </div>
  );
}
