// ============================================
// RABBIT HOLE — Shared Types
// ============================================

export type Language = 'en' | 'es';

export type GamePhase =
  | 'waiting'      // Lobby, waiting for players
  | 'storytelling' // Storyteller choosing card + clue
  | 'choosing'     // Players choosing their cards
  | 'voting'       // Players voting
  | 'scoring'      // Showing results
  | 'finished';    // Game over

export interface Player {
  id: string;
  name: string;
  npub?: string;       // Nostr public key (optional)
  avatar?: string;
  score: number;
  hand: string[];      // Card IDs in hand
  isStoryteller: boolean;
  isReady: boolean;
  isConnected: boolean;
}

export interface Card {
  id: string;
  imageUrl: string;
  artist?: string;
}

export interface Vote {
  voterId: string;
  cardId: string;
}

export interface RoundResult {
  storytellerId: string;
  storytellerCardId: string;
  clue: string;
  playedCards: { playerId: string; cardId: string }[];
  votes: Vote[];
  scores: { playerId: string; points: number; reason: string }[];
}

export interface GameState {
  id: string;
  phase: GamePhase;
  players: Player[];
  currentStorytellerId: string;
  clue: string;
  playedCards: { playerId: string; cardId: string }[];
  votes: Vote[];
  round: number;
  maxRounds: number;
  roundResults: RoundResult[];
  deck: string[];       // Remaining card IDs
  language: Language;
  isPrivate: boolean;
  createdAt: number;
}

export interface Room {
  id: string;
  code: string;         // Short join code
  hostId: string;
  gameState: GameState;
  maxPlayers: number;
  minPlayers: number;
}

// ============================================
// Socket Events
// ============================================

export interface ServerToClientEvents {
  'room:updated': (room: Room) => void;
  'game:started': (gameState: GameState) => void;
  'game:phase-changed': (phase: GamePhase) => void;
  'game:clue': (clue: string) => void;
  'game:cards-revealed': (cards: { playerId: string; cardId: string }[]) => void;
  'game:round-result': (result: RoundResult) => void;
  'game:finished': (finalScores: { playerId: string; score: number }[]) => void;
  'game:cancelled': (reason: string) => void;
  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
  'player:hand': (cards: string[]) => void;
  'host:changed': (newHostId: string) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'room:create': (data: { playerName: string; npub?: string; language: Language; isPrivate: boolean }) => void;
  'room:join': (data: { code: string; playerName: string; npub?: string }) => void;
  'game:start': () => void;
  'game:submit-clue': (data: { cardId: string; clue: string }) => void;
  'game:play-card': (data: { cardId: string }) => void;
  'game:vote': (data: { cardId: string }) => void;
}
