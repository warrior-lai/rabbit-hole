// In-memory stats store (will persist as long as server runs)
// For production: move to a database

export interface PlayerStats {
  id: string;           // localStorage ID or npub
  name: string;
  npub?: string;
  gamesPlayed: number;
  gamesWon: number;
  totalPoints: number;
  correctGuesses: number;
  totalGuesses: number;
  timesDeceived: number;  // fooled other players
  bestScore: number;
  lastPlayed: number;
}

const statsStore = new Map<string, PlayerStats>();

export function getStats(playerId: string): PlayerStats | undefined {
  return statsStore.get(playerId);
}

export function updateStats(
  playerId: string,
  name: string,
  points: number,
  won: boolean,
  correctGuesses: number,
  totalGuesses: number,
  timesDeceived: number,
  npub?: string
): PlayerStats {
  const existing = statsStore.get(playerId) || {
    id: playerId,
    name,
    npub,
    gamesPlayed: 0,
    gamesWon: 0,
    totalPoints: 0,
    correctGuesses: 0,
    totalGuesses: 0,
    timesDeceived: 0,
    bestScore: 0,
    lastPlayed: 0,
  };

  existing.name = name;
  if (npub) existing.npub = npub;
  existing.gamesPlayed++;
  if (won) existing.gamesWon++;
  existing.totalPoints += points;
  existing.correctGuesses += correctGuesses;
  existing.totalGuesses += totalGuesses;
  existing.timesDeceived += timesDeceived;
  if (points > existing.bestScore) existing.bestScore = points;
  existing.lastPlayed = Date.now();

  statsStore.set(playerId, existing);
  return existing;
}

export function getLeaderboard(limit: number = 20): PlayerStats[] {
  return Array.from(statsStore.values())
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
}

export function getWeeklyLeaderboard(limit: number = 20): PlayerStats[] {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return Array.from(statsStore.values())
    .filter(s => s.lastPlayed > oneWeekAgo)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
}
