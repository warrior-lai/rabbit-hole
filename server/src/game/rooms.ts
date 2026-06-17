import type { Room, Player, Language } from '../../../shared/types';
import { createGameState } from './engine';

const rooms = new Map<string, Room>();
const playerRooms = new Map<string, string>(); // socketId -> roomId
const sessionToSocket = new Map<string, string>(); // sessionToken -> socketId
const socketToSession = new Map<string, string>(); // socketId -> sessionToken

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
  return room;
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
  return room;
}

export function rejoinRoom(sessionToken: string, newSocketId: string): { room: Room; player: Player } | null {
  const oldSocketId = sessionToSocket.get(sessionToken);
  if (!oldSocketId) return null;

  const roomId = playerRooms.get(oldSocketId);
  if (!roomId) return null;

  const room = rooms.get(roomId);
  if (!room) return null;

  const player = room.gameState.players.find(p => p.id === oldSocketId);
  if (!player) return null;

  // Swap socket ID
  player.id = newSocketId;
  player.isConnected = true;

  playerRooms.delete(oldSocketId);
  playerRooms.set(newSocketId, roomId);

  // Update host if needed
  if (room.hostId === oldSocketId) {
    room.hostId = newSocketId;
  }

  // Update storyteller if needed
  if (room.gameState.currentStorytellerId === oldSocketId) {
    room.gameState.currentStorytellerId = newSocketId;
  }

  // Update session maps
  sessionToSocket.set(sessionToken, newSocketId);
  socketToSession.delete(oldSocketId);
  socketToSession.set(newSocketId, sessionToken);

  return { room, player };
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
