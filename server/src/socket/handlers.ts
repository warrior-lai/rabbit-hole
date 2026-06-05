import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types';
import { createRoom, joinRoom, startGame, getRoomByPlayer, removePlayer } from '../game/rooms';
import { submitClue, playCard, submitVote, nextRound } from '../game/engine';
import { getStats, updateStats, getLeaderboard, getWeeklyLeaderboard } from '../game/stats';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function setupSocketHandlers(io: TypedServer, socket: TypedSocket): void {
  // Create room
  socket.on('room:create', (data) => {
    try {
      const room = createRoom(socket.id, data.playerName, data.npub, data.language, data.isPrivate);
      socket.join(room.id);
      socket.emit('room:updated', room);
      console.log(`🏠 Room ${room.code} created by ${data.playerName}`);
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  // Join room
  socket.on('room:join', (data) => {
    try {
      const room = joinRoom(data.code, socket.id, data.playerName, data.npub);
      socket.join(room.id);
      io.to(room.id).emit('room:updated', room);
      io.to(room.id).emit('player:joined', room.gameState.players.find(p => p.id === socket.id)!);
      console.log(`👤 ${data.playerName} joined room ${data.code}`);
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  // Start game
  socket.on('game:start', () => {
    try {
      const room = getRoomByPlayer(socket.id);
      if (!room) throw new Error('Not in a room');

      const updatedRoom = startGame(room.id, socket.id);
      io.to(room.id).emit('game:started', updatedRoom.gameState);

      // Send individual hands
      updatedRoom.gameState.players.forEach(p => {
        io.to(p.id).emit('player:hand', p.hand);
      });

      console.log(`🎮 Game started in room ${room.code}`);
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  // Submit clue (storyteller)
  socket.on('game:submit-clue', (data) => {
    try {
      const room = getRoomByPlayer(socket.id);
      if (!room) throw new Error('Not in a room');

      room.gameState = submitClue(room.gameState, socket.id, data.cardId, data.clue);
      io.to(room.id).emit('game:phase-changed', room.gameState.phase);
      io.to(room.id).emit('game:clue', data.clue);
      console.log(`💬 Clue: "${data.clue}"`);
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  // Play card (non-storyteller)
  socket.on('game:play-card', (data) => {
    try {
      const room = getRoomByPlayer(socket.id);
      if (!room) throw new Error('Not in a room');

      console.log(`🃏 ${socket.id} played card ${data.cardId}. Phase: ${room.gameState.phase}`);
      room.gameState = playCard(room.gameState, socket.id, data.cardId);
      console.log(`🃏 Cards played: ${room.gameState.playedCards.length}/${room.gameState.players.length}. New phase: ${room.gameState.phase}`);

      if (room.gameState.phase === 'voting') {
        const shuffled = [...room.gameState.playedCards].sort(() => Math.random() - 0.5);
        io.to(room.id).emit('game:cards-revealed', shuffled);
        io.to(room.id).emit('game:phase-changed', 'voting');
      } else {
        io.to(room.id).emit('room:updated', room);
      }
    } catch (err: any) {
      console.log(`❌ play-card error: ${err.message} (player: ${socket.id})`);
      socket.emit('error', err.message);
    }
  });

  // Vote
  socket.on('game:vote', (data) => {
    try {
      const room = getRoomByPlayer(socket.id);
      if (!room) throw new Error('Not in a room');

      room.gameState = submitVote(room.gameState, socket.id, data.cardId);

      if (room.gameState.phase === 'scoring') {
        const lastResult = room.gameState.roundResults[room.gameState.roundResults.length - 1];
        io.to(room.id).emit('game:round-result', lastResult);
        io.to(room.id).emit('game:phase-changed', 'scoring');

        // Save stats after each round
        room.gameState.players.forEach(p => {
          const r = lastResult;
          let correct = 0, total = 0, deceived = 0;
          if (p.id !== r.storytellerId) {
            total = 1;
            const voted = r.votes.find(v => v.voterId === p.id);
            if (voted && voted.cardId === r.storytellerCardId) correct = 1;
          }
          const playerCard = r.playedCards.find(c => c.playerId === p.id);
          if (playerCard && p.id !== r.storytellerId) {
            deceived = r.votes.filter(v => v.cardId === playerCard.cardId).length;
          }
          const roundPoints = r.scores.filter(s => s.playerId === p.id).reduce((sum, s) => sum + s.points, 0);
          updateStats(p.id, p.name, roundPoints, false, correct, total, deceived, p.npub);
        });

        // Don't auto-advance — wait for host to click 'Next Round'
      } else {
        io.to(room.id).emit('room:updated', room);
      }
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  // Next round (manual, triggered by any player)
  socket.on('game:next-round', () => {
    try {
      const room = getRoomByPlayer(socket.id);
      if (!room) throw new Error('Not in a room');
      if (room.gameState.phase !== 'scoring') throw new Error('Not in scoring phase');

      room.gameState = nextRound(room.gameState);

      if (room.gameState.phase === 'finished') {
        // Mark winner (stats already saved per round)
        const sorted = [...room.gameState.players].sort((a, b) => b.score - a.score);
        const winnerId = sorted[0]?.id;
        if (winnerId) {
          const stats = getStats(winnerId);
          if (stats) {
            stats.gamesWon++;
          }
        }
        // Mark games played for all
        room.gameState.players.forEach(p => {
          const stats = getStats(p.id);
          if (stats) {
            stats.gamesPlayed++;
          }
        });

        const finalScores = room.gameState.players.map(p => ({
          playerId: p.id,
          score: p.score,
        }));
        io.to(room.id).emit('game:finished', finalScores);
      } else {
        io.to(room.id).emit('game:phase-changed', room.gameState.phase);
        io.to(room.id).emit('room:updated', room);
        room.gameState.players.forEach(p => {
          io.to(p.id).emit('player:hand', p.hand);
        });
      }
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  // End game (host only)
  socket.on('game:end', () => {
    try {
      const room = getRoomByPlayer(socket.id);
      if (!room) throw new Error('Not in a room');
      if (room.hostId !== socket.id) throw new Error('Only host can end game');

      room.gameState.phase = 'finished';

      // Mark winner + games played (round stats already saved)
      const sorted = [...room.gameState.players].sort((a, b) => b.score - a.score);
      const winnerId = sorted[0]?.id;
      if (winnerId) {
        const winnerStats = getStats(winnerId);
        if (winnerStats) winnerStats.gamesWon++;
      }
      room.gameState.players.forEach(p => {
        const s = getStats(p.id);
        if (s) s.gamesPlayed++;
      });

      const finalScores = room.gameState.players.map(p => ({
        playerId: p.id,
        score: p.score,
      }));
      io.to(room.id).emit('game:finished', finalScores);
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  // Profile
  socket.on('profile:get', (data) => {
    const stats = getStats(data.statsId);
    if (stats) {
      socket.emit('profile:data', stats);
    } else {
      socket.emit('profile:data', {
        id: data.statsId,
        name: '',
        gamesPlayed: 0,
        gamesWon: 0,
        totalPoints: 0,
        correctGuesses: 0,
        totalGuesses: 0,
        timesDeceived: 0,
        bestScore: 0,
        lastPlayed: 0,
      });
    }
  });

  // Leaderboard
  socket.on('leaderboard:get', (data) => {
    const entries = data.period === 'weekly' ? getWeeklyLeaderboard() : getLeaderboard();
    socket.emit('leaderboard:data', entries.map(e => ({
      name: e.name,
      npub: e.npub,
      totalPoints: e.totalPoints,
      gamesPlayed: e.gamesPlayed,
      gamesWon: e.gamesWon,
    })));
  });

  // Disconnect
  // Grace period before removing player (handles brief disconnects)
  socket.on('disconnect', () => {
    const room = getRoomByPlayer(socket.id);
    if (!room) return;

    // Mark as temporarily disconnected
    const player = room.gameState.players.find(p => p.id === socket.id);
    if (player) player.isConnected = false;
    io.to(room.id).emit('room:updated', room);

    // Wait 15 seconds before actually removing
    setTimeout(() => {
      // Check if they reconnected (socket would rejoin)
      const currentRoom = getRoomByPlayer(socket.id);
      if (!currentRoom) return; // already removed or room gone

      const p = currentRoom.gameState.players.find(pl => pl.id === socket.id);
      if (p && !p.isConnected) {
        // Still disconnected after grace period — remove
        const { room: updatedRoom, tooFewPlayers } = removePlayer(socket.id);
        if (updatedRoom) {
          io.to(updatedRoom.id).emit('player:left', socket.id);
          io.to(updatedRoom.id).emit('host:changed', updatedRoom.hostId);

          if (tooFewPlayers) {
            updatedRoom.gameState.phase = 'finished';
            io.to(updatedRoom.id).emit('game:cancelled', 'not_enough_players');
          } else {
            io.to(updatedRoom.id).emit('room:updated', updatedRoom);
          }
        }
      }
    }, 15000);
  });
}
