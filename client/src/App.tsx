import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './hooks/useLanguage';
import { useSocket } from './hooks/useSocket';
import { Landing } from './pages/Landing';
import { Lobby } from './pages/Lobby';
import { GameBoard } from './components/GameBoard';
import { GameOver } from './components/GameOver';
import type { Room, GameState } from '@shared/types';

type Screen = 'landing' | 'lobby' | 'game' | 'results';

export function App() {
  const { lang, t, toggleLang } = useLanguage();
  const { socket, isConnected } = useSocket();
  const [screen, setScreen] = useState<Screen>('landing');
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myHand, setMyHand] = useState<string[]>([]);
  const [revealedCards, setRevealedCards] = useState<{ playerId: string; cardId: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('room:updated', (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.gameState.phase === 'waiting') {
        setScreen('lobby');
      }
      if (updatedRoom.gameState.phase !== 'waiting') {
        setGameState(updatedRoom.gameState);
      }
    });

    socket.on('game:started', (state) => {
      setGameState(state);
      setScreen('game');
    });

    socket.on('player:hand', (cards) => {
      setMyHand(cards);
    });

    socket.on('game:phase-changed', (phase) => {
      setGameState(prev => prev ? { ...prev, phase } : null);
    });

    socket.on('game:clue', (clue) => {
      setGameState(prev => prev ? { ...prev, clue } : null);
    });

    socket.on('game:cards-revealed', (cards) => {
      setRevealedCards(cards);
    });

    socket.on('game:round-result', (result) => {
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          phase: 'scoring' as const,
          roundResults: [...prev.roundResults, result],
          players: prev.players.map(p => {
            const scoreEntries = result.scores.filter(s => s.playerId === p.id);
            const bonus = scoreEntries.reduce((sum, s) => sum + s.points, 0);
            return { ...p, score: p.score + bonus };
          }),
        };
      });
    });

    socket.on('game:finished', () => {
      setScreen('results');
    });

    socket.on('error', (msg) => {
      setError(msg);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [socket]);

  const handleQuickPlay = useCallback((name: string, npub?: string) => {
    if (!socket) return;
    socket.emit('room:create', {
      playerName: name,
      npub,
      language: lang,
      isPrivate: false,
    });
  }, [socket, lang]);

  const handleJoinRoom = useCallback((name: string, code: string, npub?: string) => {
    if (!socket) return;
    socket.emit('room:join', { code, playerName: name, npub });
  }, [socket]);

  const handleStartGame = useCallback(() => {
    socket?.emit('game:start');
  }, [socket]);

  const handleSubmitClue = useCallback((cardId: string, clue: string) => {
    socket?.emit('game:submit-clue', { cardId, clue });
    setMyHand(prev => prev.filter(c => c !== cardId));
  }, [socket]);

  const handlePlayCard = useCallback((cardId: string) => {
    socket?.emit('game:play-card', { cardId });
    setMyHand(prev => prev.filter(c => c !== cardId));
  }, [socket]);

  const handleVote = useCallback((cardId: string) => {
    socket?.emit('game:vote', { cardId });
  }, [socket]);

  const handlePlayAgain = useCallback(() => {
    socket?.emit('game:start');
  }, [socket]);

  const handleBackToLobby = useCallback(() => {
    setScreen('landing');
    setRoom(null);
    setGameState(null);
    setMyHand([]);
    setRevealedCards([]);
  }, []);

  return (
    <>
      {/* Animated vibrant background */}
      <div className="animated-bg">
        <div className="blob" />
        <div className="blob" />
        <div className="blob" />
        <div className="blob" />
        <div className="blob" />
        <div className="sparkle" />
        <div className="sparkle" />
        <div className="sparkle" />
        <div className="sparkle" />
        <div className="sparkle" />
        <div className="sparkle" />
        <div className="sparkle" />
        <div className="sparkle" />
        <div className="sparkle" />
        <div className="sparkle" />
      </div>

      {!isConnected && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          background: '#e74c3c', color: '#fff',
          textAlign: 'center', padding: '6px',
          fontSize: '12px', fontWeight: 600, zIndex: 1000,
        }}>
          {lang === 'en' ? '⚡ Connecting...' : '⚡ Conectando...'}
        </div>
      )}

      {error && (
        <div style={{
          position: 'fixed', top: '16px', left: '50%',
          transform: 'translateX(-50%)',
          background: '#e74c3c', color: '#fff',
          padding: '12px 24px', borderRadius: '8px',
          fontSize: '13px', fontWeight: 600, zIndex: 1000,
        }}>
          {error}
        </div>
      )}

      {screen !== 'landing' && (
        <button className="lang-toggle" onClick={toggleLang}>
          {lang === 'en' ? '🇪🇸 ES' : '🇬🇧 EN'}
        </button>
      )}

      {screen === 'landing' && (
        <Landing
          t={t} lang={lang} toggleLang={toggleLang}
          onQuickPlay={(name: string, npub?: string) => handleQuickPlay(name, npub)}
          onJoinRoom={(name: string, code: string, npub?: string) => handleJoinRoom(name, code, npub)}
        />
      )}

      {screen === 'lobby' && room && socket && (
        <Lobby
          t={t} room={room}
          playerId={socket.id || ''}
          onStart={handleStartGame}
        />
      )}

      {screen === 'game' && gameState && socket && (
        <GameBoard
          t={t} gameState={gameState}
          playerId={socket.id || ''}
          myHand={myHand}
          revealedCards={revealedCards}
          onSubmitClue={handleSubmitClue}
          onPlayCard={handlePlayCard}
          onVote={handleVote}
        />
      )}

      {screen === 'results' && gameState && (
        <GameOver
          t={t}
          players={gameState.players}
          onPlayAgain={handlePlayAgain}
          onBackToLobby={handleBackToLobby}
        />
      )}
    </>
  );
}
