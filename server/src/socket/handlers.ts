import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types';
import { createRoom, joinRoom, startGame, getRoomByPlayer, removePlayer } from '../game/rooms';
import { submitClue, playCard, submitVote, nextRound } from '../game/engine';
import { getStats, updateStats, getLeaderboard, getWeeklyLeaderboard } from '../game/stats';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function setupSocketHandlers(io: TypedServer, socket: TypedSocket): void {

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

  socket.on('room:join', (data) => {
    try {
      const room = joinRoom(data.code, socket.id, data.playerName, data.npub);
      socket.join(room.id);
      io.to(room.id).emit('room:updated', room);
      console.log(`👤 ${data.playerName} joined room ${data.code}`);
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  socket.on('game:start', () => {
    try {
      const room = getRoomByPlayer(socket.id);
      if (!room) throw new Error('Not in a room');
      const updatedRoom = startGame(room.id, socket.id);
      io.to(room.id).emit('game:started', updatedRoom.gameState);
      updatedRoom.gameState.players.forEach(p => {
        io.to(p.id).emit('player:hand', p.hand);
      });
      console.log(`🎮 Game started in room ${room.code}`);
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  socket.on('game:submit-clue', (data) => {
    try {
      const room = getRoomByPlayer(socket.id);
      if (!room) throw new Error('Not in a room');
      room.gameState = submitClue(room.gameState, socket.id, data.cardId, data.clue);
      io.to(room.id).emit('game:phase-changed', 'choosing');
      io.to(room.id).emit('game:clue', data.clue);
      console.log(`💬 Clue: "${data.clue}"`);
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  socket.on('game:play-card', (data) => {
    try {
      const room = getRoomByPlayer(socket.id);
      if (!room) throw new Error('Not in a room');

      room.gameState = playCard(room.gameState, socket.id, data.cardId);
      const total = room.gameState.players.length;
      const played = room.gameState.playedCards.length;
      console.log(`🃏 Card played. ${played}/${total}. Phase: ${room.gameState.phase}`);

      // Tell everyone how many cards are in
      io.to(room.id).emit('game:played-count', played);

      if (room.gameState.phase === 'voting') {
        const shuffled = [...room.gameState.playedCards].sort(() => Math.random() - 0.5);
        io.to(room.id).emit('game:cards-revealed', shuffled);
        io.to(room.id).emit('game:phase-changed', 'voting');
      }
    } catch (err: any) {
      console.log(`❌ play-card error: ${err.message}`);
      socket.emit('error', err.message);
    }
  });

  socket.on('game:vote', (data) => {
    try {
      const room = getRoomByPlayer(socket.id);
      if (!room) throw new Error('Not in a room');

      room.gameState = submitVote(room.gameState, socket.id, data.cardId);
      const totalVoters = room.gameState.players.filter(p => p.id !== room.gameState.currentStorytellerId).length;
      const voted = room.gameState.votes.length;
      console.log(`🗳️ Vote cast. ${voted}/${totalVoters}. Phase: ${room.gameState.phase}`);

      if (room.gameState.phase === 'scoring') {
        const lastResult = room.gameState.roundResults[room.gameState.roundResults.length - 1];
        io.to(room.id).emit('game:round-result', lastResult);
        io.to(room.id).emit('game:phase-changed', 'scoring');

        // Save stats per round
        room.gameState.players.forEach(p => {
          const r = lastResult;
          let correct = 0, total = 0, deceived = 0;
          if (p.id !== r.storytellerId) {
            total = 1;
            const v = r.votes.find(v => v.voterId === p.id);
            if (v && v.cardId === r.storytellerCardId) correct = 1;
          }
          const pc = r.playedCards.find(c => c.playerId === p.id);
          if (pc && p.id !== r.storytellerId) {
            deceived = r.votes.filter(v => v.cardId === pc.cardId).length;
          }
          const pts = r.scores.filter(s => s.playerId === p.id).reduce((sum, s) => sum + s.points, 0);
          updateStats(p.id, p.name, pts, false, correct, total, deceived, p.npub);
        });
      } else {
        // Tell everyone vote count
        io.to(room.id).emit('game:played-count', voted);
      }
    } catch (err: any) {
      console.log(`❌ vote error: ${err.message}`);
      socket.emit('error', err.message);
    }
  });

  socket.on('game:next-round', () => {
    try {
      const room = getRoomByPlayer(socket.id);
      if (!room) throw new Error('Not in a room');
      if (room.gameState.phase !== 'scoring') throw new Error('Not in scoring phase');

      room.gameState = nextRound(room.gameState);

      if (room.gameState.phase === 'finished') {
        const sorted = [...room.gameState.players].sort((a, b) => b.score - a.score);
        const winnerId = sorted[0]?.id;
        if (winnerId) { const s = getStats(winnerId); if (s) s.gamesWon++; }
        room.gameState.players.forEach(p => { const s = getStats(p.id); if (s) s.gamesPlayed++; });

        io.to(room.id).emit('game:finished', room.gameState.players.map(p => ({ playerId: p.id, score: p.score })));
      } else {
        io.to(room.id).emit('game:started', room.gameState);
        room.gameState.players.forEach(p => {
          io.to(p.id).emit('player:hand', p.hand);
        });
      }
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  socket.on('game:end', () => {
    try {
      const room = getRoomByPlayer(socket.id);
      if (!room) throw new Error('Not in a room');
      if (room.hostId !== socket.id) throw new Error('Only host can end game');

      room.gameState.phase = 'finished';
      const sorted = [...room.gameState.players].sort((a, b) => b.score - a.score);
      const winnerId = sorted[0]?.id;
      if (winnerId) { const s = getStats(winnerId); if (s) s.gamesWon++; }
      room.gameState.players.forEach(p => { const s = getStats(p.id); if (s) s.gamesPlayed++; });

      io.to(room.id).emit('game:finished', room.gameState.players.map(p => ({ playerId: p.id, score: p.score })));
    } catch (err: any) {
      socket.emit('error', err.message);
    }
  });

  socket.on('profile:get', (data) => {
    const stats = getStats(data.statsId);
    socket.emit('profile:data', stats || {
      id: data.statsId, name: '', gamesPlayed: 0, gamesWon: 0,
      totalPoints: 0, correctGuesses: 0, totalGuesses: 0,
      timesDeceived: 0, bestScore: 0, lastPlayed: 0,
    });
  });

  socket.on('leaderboard:get', (data) => {
    const entries = data.period === 'weekly' ? getWeeklyLeaderboard() : getLeaderboard();
    socket.emit('leaderboard:data', entries.map(e => ({
      name: e.name, npub: e.npub, totalPoints: e.totalPoints,
      gamesPlayed: e.gamesPlayed, gamesWon: e.gamesWon,
    })));
  });

  // Simple disconnect - remove after 15s
  socket.on('disconnect', () => {
    const room = getRoomByPlayer(socket.id);
    if (!room) return;
    const player = room.gameState.players.find(p => p.id === socket.id);
    console.log(`💀 ${player?.name || socket.id} disconnected`);

    setTimeout(() => {
      const currentRoom = getRoomByPlayer(socket.id);
      if (!currentRoom) return;
      const p = currentRoom.gameState.players.find(pl => pl.id === socket.id);
      if (p && !p.isConnected) {
        const { room: updatedRoom, tooFewPlayers } = removePlayer(socket.id);
        if (updatedRoom && tooFewPlayers) {
          updatedRoom.gameState.phase = 'finished';
          io.to(updatedRoom.id).emit('game:cancelled', 'not_enough_players');
        }
      }
    }, 15000);

    if (player) player.isConnected = false;
  });
}
