import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types';
import { createRoom, joinRoom, startGame, getRoomByPlayer, removePlayer } from '../game/rooms';
import { submitClue, playCard, submitVote, nextRound } from '../game/engine';

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

      room.gameState = playCard(room.gameState, socket.id, data.cardId);

      if (room.gameState.phase === 'voting') {
        const shuffled = [...room.gameState.playedCards].sort(() => Math.random() - 0.5);
        io.to(room.id).emit('game:cards-revealed', shuffled);
        io.to(room.id).emit('game:phase-changed', 'voting');
      } else {
        io.to(room.id).emit('room:updated', room);
      }
    } catch (err: any) {
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

        // Auto advance after 8 seconds
        setTimeout(() => {
          if (!room) return;
          room.gameState = nextRound(room.gameState);

          if (room.gameState.phase === 'finished') {
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
        }, 8000);
      } else {
        io.to(room.id).emit('room:updated', room);
      }
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const { room: updatedRoom, tooFewPlayers } = removePlayer(socket.id);
    if (updatedRoom) {
      io.to(updatedRoom.id).emit('player:left', socket.id);
      io.to(updatedRoom.id).emit('host:changed', updatedRoom.hostId);

      if (tooFewPlayers) {
        // Cancel the game — not enough players
        updatedRoom.gameState.phase = 'finished';
        io.to(updatedRoom.id).emit('game:cancelled', 'not_enough_players');
      } else {
        io.to(updatedRoom.id).emit('room:updated', updatedRoom);
      }
    }
  });
}
