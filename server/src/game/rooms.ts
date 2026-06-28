import type { Room, Player, Language } from '../../../shared/types';
import { createGameState } from './engine';

const rooms = new Map<string, Room>();
const playerRooms = new Map<string, string>(); // socketId -> roomId
const sessionToSocket = new Map<string, string>(); // sessionToken -> socketId (current, clobbered on reconnect)
const socketToSession = new Map<string, string>(); // socketId -> sessionToken
// Stable token-based ownership for rejoin — NOT touched by session:register, so a
// reconnecting socket can always find its old player even after the token->socket map moved.
const tokenToRoom = new Map<string, string>();     // sessionToken -> roomId
const tokenToPlayerId = new Map<string, string>(); // sessionToken -> current socketId of that player

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function createRoom(
  hostId: string,
  playerName: string,
  npub: string | undefined,
  language: Language,
  isPrivate: boolean
): Room {
  const code = generateCode();
  const roomId = `room_${code}`;

  const host: Player = {
    id: hostId,
    name: playerName,
    npub,
    score: 0,
    hand: [],
    isStoryteller: false,
    isReady: true,
    isConnected: true,
  };

  const room: Room = {
    id: roomId,
    code,
    hostId,
    gameState: {
      id: roomId,
      phase: 'waiting',
      players: [host],
      currentStorytellerId: '',
      clue: '',
      playedCards: [],
      votes: [],
      round: 0,
      maxRounds: 0,
      roundResults: [],
      deck: [],
      language,
      isPrivate,
      createdAt: Date.now(),
    },
    maxPlayers: 10,
    minPlayers: 3,
  };

  rooms.set(roomId, room);
  playerRooms.set(hostId, roomId);
  bindToken(hostId, roomId);
  return room;
}

// Associate this socket's session token with its room+player so rejoin can find it
// again after the socket id changes. Safe to call even if no token registered yet.
function bindToken(socketId: string, roomId: string): void {
  const token = socketToSession.get(socketId);
  if (!token) return;
  tokenToRoom.set(token, roomId);
  tokenToPlayerId.set(token, socketId);
}

export function joinRoom(
  code: string,
  playerId: string,
  playerName: string,
  npub?: string
): Room {
  const room = Array.from(rooms.values()).find(r => r.code === code);
  if (!room) throw new Error('Room not found');
  if (room.gameState.phase !== 'waiting') throw new Error('Game already started');
  if (room.gameState.players.length >= room.maxPlayers) throw new Error('Room is full');

  const player: Player = {
    id: playerId,
    name: playerName,
    npub,
    score: 0,
    hand: [],
    isStoryteller: false,
    isReady: true,
    isConnected: true,
  };

  room.gameState.players.push(player);
  playerRooms.set(playerId, room.id);
  bindToken(playerId, room.id);
  return room;
}

export function rejoinRoom(sessionToken: string, newSocketId: string): { room: Room; player: Player } | null {
  // Use the stable token->room/player maps. These are NOT overwritten by session:register,
  // so they still point at the disconnected player even though the client already
  // re-registered the token under the new socket id during the reconnect handshake.
  const roomId = tokenToRoom.get(sessionToken);
  if (!roomId) return null;

  const room = rooms.get(roomId);
  if (!room) return null;

  const oldSocketId = tokenToPlayerId.get(sessionToken);
  const player = room.gameState.players.find(p => p.id === oldSocketId);
  if (!player) return null;

  // Swap socket ID
  player.id = newSocketId;
  player.isConnected = true;

  if (oldSocketId) playerRooms.delete(oldSocketId);
  playerRooms.set(newSocketId, roomId);

  // Update host if needed
  if (room.hostId === oldSocketId) {
    room.hostId = newSocketId;
  }

  // Update storyteller if needed
  if (room.gameState.currentStorytellerId === oldSocketId) {
    room.gameState.currentStorytellerId = newSocketId;
  }

  // Update all maps to the new socket id
  sessionToSocket.set(sessionToken, newSocketId);
  if (oldSocketId) socketToSession.delete(oldSocketId);
  socketToSession.set(newSocketId, sessionToken);
  tokenToPlayerId.set(sessionToken, newSocketId);

  return { room, player };
}

// Why would a rejoin fail? Used only for debug reports — does not mutate anything.
export function getRejoinDiagnostics(sessionToken: string) {
  const roomId = tokenToRoom.get(sessionToken);
  const room = roomId ? rooms.get(roomId) : undefined;
  const oldSocketId = tokenToPlayerId.get(sessionToken);
  const player = room?.gameState.players.find(p => p.id === oldSocketId);
  return {
    hasTokenMapping: !!roomId,
    roomExists: !!room,
    roomCode: room?.code ?? null,
    phase: room?.gameState.phase ?? null,
    oldSocketId: oldSocketId ?? null,
    playerFound: !!player,
    playerName: player?.name ?? null,
    playerCount: room?.gameState.players.length ?? 0,
    connectedCount: room?.gameState.players.filter(p => p.isConnected).length ?? 0,
  };
}

export function registerSession(socketId: string, sessionToken: string): void {
  sessionToSocket.set(sessionToken, socketId);
  socketToSession.set(socketId, sessionToken);
}

export function getSessionToken(socketId: string): string | undefined {
  return socketToSession.get(socketId);
}

export function startGame(roomId: string, requesterId: string): Room {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Room not found');
  if (room.hostId !== requesterId) throw new Error('Only host can start');
  if (room.gameState.players.length < room.minPlayers) {
    throw new Error(`Need at least ${room.minPlayers} players`);
  }

  room.gameState = createGameState(
    roomId,
    room.gameState.players,
    room.gameState.language,
    room.gameState.isPrivate
  );

  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function getRoomByCode(code: string): Room | undefined {
  return Array.from(rooms.values()).find(r => r.code === code);
}

export function getRoomByPlayer(playerId: string): Room | undefined {
  const roomId = playerRooms.get(playerId);
  return roomId ? rooms.get(roomId) : undefined;
}

export function removePlayer(playerId: string): { room: Room | undefined; tooFewPlayers: boolean } {
  const roomId = playerRooms.get(playerId);
  if (!roomId) return { room: undefined, tooFewPlayers: false };

  const room = rooms.get(roomId);
  if (!room) return { room: undefined, tooFewPlayers: false };

  const player = room.gameState.players.find(p => p.id === playerId);
  if (player) {
    player.isConnected = false;
  }

  playerRooms.delete(playerId);

  // Grace period expired for this player — drop their stable token ownership so a
  // late reconnect won't resurrect a player the game has already moved past.
  const token = socketToSession.get(playerId);
  if (token && tokenToPlayerId.get(token) === playerId) {
    tokenToRoom.delete(token);
    tokenToPlayerId.delete(token);
  }

  // If all players disconnected, remove room
  const connected = room.gameState.players.filter(p => p.isConnected);
  if (connected.length === 0) {
    rooms.delete(roomId);
    return { room: undefined, tooFewPlayers: false };
  }

  // If host left, transfer to next connected player
  if (playerId === room.hostId && connected.length > 0) {
    room.hostId = connected[0].id;
  }

  // If game is running and fewer than 3 players remain, flag it
  const isInGame = room.gameState.phase !== 'waiting' && room.gameState.phase !== 'finished';
  const tooFewPlayers = isInGame && connected.length < 3;

  return { room, tooFewPlayers };
}
