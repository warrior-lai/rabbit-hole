import type { GameState, Player, RoundResult, Vote, Language } from '../../../shared/types';

const HAND_SIZE = 6;

// Real cards available — update this number as more art is added
const TOTAL_REAL_CARDS = 6;

// Generate deck using only real cards, with duplicates if needed for enough rounds
function generateDeck(playerCount: number): string[] {
  const minCards = playerCount * HAND_SIZE + playerCount * 4; // enough for several rounds
  const deck: string[] = [];
  
  // Add all real cards, repeat if needed
  while (deck.length < minCards) {
    for (let i = 1; i <= TOTAL_REAL_CARDS; i++) {
      deck.push(`card_${String(i).padStart(3, '0')}`);
      if (deck.length >= minCards) break;
    }
  }
  
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function createGameState(
  roomId: string,
  players: Player[],
  language: Language,
  isPrivate: boolean
): GameState {
  const deck = generateDeck(players.length);
  const maxRounds = Math.floor(deck.length / players.length);

  // Deal cards
  const gamePlayers = players.map((p, index) => ({
    ...p,
    hand: deck.splice(0, HAND_SIZE),
    score: 0,
    isStoryteller: index === 0,
    isReady: false,
  }));

  return {
    id: roomId,
    phase: 'storytelling',
    players: gamePlayers,
    currentStorytellerId: gamePlayers[0].id,
    clue: '',
    playedCards: [],
    votes: [],
    round: 1,
    maxRounds,
    roundResults: [],
    deck,
    language,
    isPrivate,
    createdAt: Date.now(),
  };
}

export function submitClue(state: GameState, playerId: string, cardId: string, clue: string): GameState {
  if (state.phase !== 'storytelling') throw new Error('Not in storytelling phase');
  if (playerId !== state.currentStorytellerId) throw new Error('Not the storyteller');

  const player = state.players.find(p => p.id === playerId);
  if (!player || !player.hand.includes(cardId)) throw new Error('Card not in hand');

  // Remove card from hand
  player.hand = player.hand.filter(c => c !== cardId);

  return {
    ...state,
    phase: 'choosing',
    clue,
    playedCards: [{ playerId, cardId }],
  };
}

export function playCard(state: GameState, playerId: string, cardId: string): GameState {
  if (state.phase !== 'choosing') throw new Error('Not in choosing phase');
  if (playerId === state.currentStorytellerId) throw new Error('Storyteller cannot play');

  const player = state.players.find(p => p.id === playerId);
  if (!player || !player.hand.includes(cardId)) throw new Error('Card not in hand');
  if (state.playedCards.some(c => c.playerId === playerId)) throw new Error('Already played');

  // Remove card from hand
  player.hand = player.hand.filter(c => c !== cardId);

  const updatedPlayed = [...state.playedCards, { playerId, cardId }];

  // Check if all non-storyteller players have played
  const activePlayers = state.players.filter(p => p.isConnected && p.id !== state.currentStorytellerId);
  const allPlayed = activePlayers.every(p => updatedPlayed.some(c => c.playerId === p.id));

  return {
    ...state,
    playedCards: updatedPlayed,
    phase: allPlayed ? 'voting' : 'choosing',
  };
}

export function submitVote(state: GameState, voterId: string, cardId: string): GameState {
  if (state.phase !== 'voting') throw new Error('Not in voting phase');
  if (voterId === state.currentStorytellerId) throw new Error('Storyteller cannot vote');

  // Can't vote for own card
  const voterCard = state.playedCards.find(c => c.playerId === voterId);
  if (voterCard && voterCard.cardId === cardId) throw new Error('Cannot vote for own card');

  if (state.votes.some(v => v.voterId === voterId)) throw new Error('Already voted');

  const updatedVotes = [...state.votes, { voterId, cardId }];

  // Check if all non-storyteller players have voted
  const activePlayers = state.players.filter(p => p.isConnected && p.id !== state.currentStorytellerId);
  const allVoted = activePlayers.every(p => updatedVotes.some(v => v.voterId === p.id));

  if (allVoted) {
    return calculateScores({ ...state, votes: updatedVotes });
  }

  return { ...state, votes: updatedVotes };
}

function calculateScores(state: GameState): GameState {
  const storytellerCard = state.playedCards.find(c => c.playerId === state.currentStorytellerId)!;
  const scores: { playerId: string; points: number; reason: string }[] = [];

  // Count votes for storyteller's card
  const votesForStoryteller = state.votes.filter(v => v.cardId === storytellerCard.cardId);
  const totalVoters = state.votes.length;

  const allGuessed = votesForStoryteller.length === totalVoters;
  const noneGuessed = votesForStoryteller.length === 0;

  if (allGuessed || noneGuessed) {
    // Storyteller gets 0, everyone else gets 2
    scores.push({ playerId: state.currentStorytellerId, points: 0, reason: allGuessed ? 'too_easy' : 'too_hard' });
    state.players.forEach(p => {
      if (p.id !== state.currentStorytellerId && p.isConnected) {
        scores.push({ playerId: p.id, points: 2, reason: 'storyteller_failed' });
      }
    });
  } else {
    // Storyteller gets 3
    scores.push({ playerId: state.currentStorytellerId, points: 3, reason: 'good_clue' });
    // Players who guessed correctly get 3
    votesForStoryteller.forEach(v => {
      scores.push({ playerId: v.voterId, points: 3, reason: 'correct_guess' });
    });
  }

  // Bonus: each vote on your card (non-storyteller) = +1
  state.playedCards.forEach(pc => {
    if (pc.playerId !== state.currentStorytellerId) {
      const votesForCard = state.votes.filter(v => v.cardId === pc.cardId).length;
      if (votesForCard > 0) {
        scores.push({ playerId: pc.playerId, points: votesForCard, reason: 'deceived' });
      }
    }
  });

  // Apply scores
  const updatedPlayers = state.players.map(p => {
    const playerScores = scores.filter(s => s.playerId === p.id);
    const totalPoints = playerScores.reduce((sum, s) => sum + s.points, 0);
    return { ...p, score: p.score + totalPoints };
  });

  const result: RoundResult = {
    storytellerId: state.currentStorytellerId,
    storytellerCardId: storytellerCard.cardId,
    clue: state.clue,
    playedCards: state.playedCards,
    votes: state.votes,
    scores,
  };

  return {
    ...state,
    phase: 'scoring',
    players: updatedPlayers,
    roundResults: [...state.roundResults, result],
  };
}

export function nextRound(state: GameState): GameState {
  const playerIds = state.players.filter(p => p.isConnected).map(p => p.id);
  const currentIdx = playerIds.indexOf(state.currentStorytellerId);
  const nextIdx = (currentIdx + 1) % playerIds.length;
  const nextStorytellerId = playerIds[nextIdx];

  // Check if game is over
  const isLastRound = state.deck.length < state.players.filter(p => p.isConnected).length;
  if (state.round >= state.maxRounds || isLastRound) {
    return { ...state, phase: 'finished' };
  }

  // Draw cards
  const updatedPlayers = state.players.map(p => {
    if (p.hand.length < HAND_SIZE && state.deck.length > 0) {
      const cardsNeeded = HAND_SIZE - p.hand.length;
      const newCards = state.deck.splice(0, cardsNeeded);
      return {
        ...p,
        hand: [...p.hand, ...newCards],
        isStoryteller: p.id === nextStorytellerId,
      };
    }
    return { ...p, isStoryteller: p.id === nextStorytellerId };
  });

  return {
    ...state,
    phase: 'storytelling',
    players: updatedPlayers,
    currentStorytellerId: nextStorytellerId,
    clue: '',
    playedCards: [],
    votes: [],
    round: state.round + 1,
  };
}
