import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './hooks/useLanguage';
import { useSocket } from './hooks/useSocket';
import { Landing } from './pages/Landing';
import { Lobby } from './pages/Lobby';
import { GameBoard } from './components/GameBoard';
import { GameOver } from './components/GameOver';
import { GameCancelled } from './components/GameCancelled';
import { Challenge } from './components/Challenge';
import type { Room, GameState, PlayerProfile, LeaderboardEntry } from '@shared/types';

type Screen = 'landing' | 'lobby' | 'game' | 'results' | 'cancelled' | 'challenge';

export function App() {
  const { lang, t, toggleLang } = useLanguage();
  const { socket, isConnected } = useSocket();
  const [screen, setScreen] = useState<Screen>('landing');
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myHand, setMyHand] = useState<string[]>([]);
  const [revealedCards, setRevealedCards] = useState<{ playerId: string; cardId: string }[]>([]);
  const [playedCount, setPlayedCount] = useState(0);
  const [lastRoundResult, setLastRoundResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [statsId] = useState(() => {
    let id = localStorage.getItem('rh-stats-id');
    if (!id) {
      try { id = crypto.randomUUID(); } catch { id = Math.random().toString(36).substring(2) + Date.now().toString(36); }
      localStorage.setItem('rh-stats-id', id);
    }
    return id;
  });

  useEffect(() => {
    if (!socket) return;

    // LOBBY
    socket.on('room:updated', (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.gameState.phase === 'waiting') {
        setScreen('lobby');
      }
    });

    // GAME START — this is the main state setter
    socket.on('game:started', (state) => {
      setGameState(state);
      setRevealedCards([]);
      setPlayedCount(0);
      setLastRoundResult(null);
      setScreen('game');
    });

    socket.on('player:hand', (cards) => {
      setMyHand(cards);
    });

    // PHASE CHANGES
    socket.on('game:phase-changed', (phase) => {
      // Don't overwrite scoring — game:round-result handles that with full data
      if (phase === 'scoring') return;
      setGameState(prev => prev ? { ...prev, phase } : null);
      if (phase === 'choosing' || phase === 'storytelling') {
        setPlayedCount(0);
        setRevealedCards([]);
      }
    });

    socket.on('game:clue', (clue) => {
      setGameState(prev => prev ? { ...prev, clue } : null);
    });

    socket.on('game:played-count', (count) => {
      setPlayedCount(count);
    });

    socket.on('game:cards-revealed', (cards) => {
      setRevealedCards(cards);
    });

    // SCORING
    socket.on('game:round-result', (result) => {
      setLastRoundResult(result);
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          phase: 'scoring' as const,
          roundResults: [...prev.roundResults, result],
          players: prev.players.map(p => {
            const bonus = result.scores.filter(s => s.playerId === p.id).reduce((sum, s) => sum + s.points, 0);
            return { ...p, score: p.score + bonus };
          }),
        };
      });
    });

    // GAME END
    socket.on('game:finished', () => {
      setScreen('results');
    });

    socket.on('game:cancelled', () => {
      setScreen('cancelled');
    });

    socket.on('host:changed', () => {});

    socket.on('player:left', () => {});

    // PROFILE/LEADERBOARD
    socket.on('profile:data', (data) => setProfile(data));
    socket.on('leaderboard:data', (entries) => setLeaderboard(entries));

    socket.on('error', (msg) => {
      setError(msg);
      setTimeout(() => setError(null), 3000);
    });

    return () => { socket.removeAllListeners(); };
  }, [socket]);

  // === HANDLERS ===
  const handleQuickPlay = useCallback((name: string, npub?: string) => {
    socket?.emit('room:create', { playerName: name, npub, language: lang, isPrivate: false });
  }, [socket, lang]);

  const handleJoinRoom = useCallback((name: string, code: string, npub?: string) => {
    socket?.emit('room:join', { code, playerName: name, npub });
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

  const handleNextRound = useCallback(() => {
    socket?.emit('game:next-round');
  }, [socket]);

  const handleEndGame = useCallback(() => {
    socket?.emit('game:end');
  }, [socket]);

  const handleLeaveGame = useCallback(() => {
    socket?.disconnect();
    socket?.connect();
    setScreen('landing');
    setRoom(null);
    setGameState(null);
    setMyHand([]);
    setRevealedCards([]);
    setPlayedCount(0);
  }, [socket]);

  const handleBackToLobby = useCallback(() => {
    setScreen('landing');
    setRoom(null);
    setGameState(null);
    setMyHand([]);
    setRevealedCards([]);
    setPlayedCount(0);
  }, []);

  // Inject playedCount into gameState for display
  const displayGameState = gameState ? {
    ...gameState,
    playedCards: playedCount > gameState.playedCards.length
      ? Array.from({ length: playedCount }, (_, i) => gameState.playedCards[i] || { playerId: `p${i}`, cardId: `c${i}` })
      : gameState.playedCards,
  } : null;

  return (
    <>
      {/* Animated background */}
      <div className="animated-bg">
        <div className="blob" /><div className="blob" /><div className="blob" />
        <div className="blob" /><div className="blob" />
        <div className="sparkle" /><div className="sparkle" /><div className="sparkle" />
        <div className="sparkle" /><div className="sparkle" /><div className="sparkle" />
        <div className="sparkle" /><div className="sparkle" /><div className="sparkle" />
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

      {screen !== 'landing' && screen !== 'challenge' && (
        <button className="lang-toggle" onClick={toggleLang}>
          {lang === 'en' ? '🇪🇸 ES' : '🇬🇧 EN'}
        </button>
      )}

      {screen === 'landing' && (
        <Landing
          t={t} lang={lang} toggleLang={toggleLang}
          onQuickPlay={(name, npub) => handleQuickPlay(name, npub)}
          onJoinRoom={(name, code, npub) => handleJoinRoom(name, code, npub)}
          onChallenge={() => setScreen('challenge')}
          profile={profile}
          leaderboard={leaderboard}
          onRequestProfile={() => socket?.emit('profile:get', { statsId })}
          onRequestLeaderboard={(period) => socket?.emit('leaderboard:get', { period })}
        />
      )}

      {screen === 'lobby' && room && socket && (
        <Lobby t={t} room={room} playerId={socket.id || ''} onStart={handleStartGame} />
      )}

      {screen === 'game' && displayGameState && socket && (
        <GameBoard
          t={t} gameState={displayGameState}
          playerId={socket.id || ''}
          myHand={myHand}
          revealedCards={revealedCards}
          onSubmitClue={handleSubmitClue}
          onPlayCard={handlePlayCard}
          onVote={handleVote}
          onNextRound={handleNextRound}
          onLeaveGame={handleLeaveGame}
          onEndGame={handleEndGame}
          isHost={room?.hostId === socket?.id}
          lastRoundResult={lastRoundResult}
        />
      )}

      {screen === 'results' && gameState && (
        <GameOver
          t={t} players={gameState.players}
          onPlayAgain={handleStartGame}
          onBackToLobby={handleBackToLobby}
        />
      )}

      {screen === 'challenge' && (
        <Challenge lang={lang} onBack={() => setScreen('landing')} />
      )}

      {screen === 'cancelled' && (
        <GameCancelled lang={lang} reason="not_enough_players" onNewGame={handleBackToLobby} />
      )}
    </>
  );
}
