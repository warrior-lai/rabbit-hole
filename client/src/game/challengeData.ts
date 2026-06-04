// Challenge clue-to-card mapping
// Each clue has a list of valid (Bitcoin/correct) card numbers
// The "fiat world" or unrelated cards are used as distractors

// Bitcoin-themed cards (dark, crypto, freedom, sovereignty)
// Based on the deck content:
// 1: rabbit hole boy with lantern
// 2: art gallery friends (bright/fiat)
// 3: blockchain citadel
// 4: girl with orange glasses (bright/fiat)
// 5: mind labyrinth Bitcoin
// 6: library ladder (bright/fiat)
// 7: forbidden garden cosmic
// 8: Mediterranean suitcase (bright/fiat)
// 9: El Salvador Bitcoin girl
// 10: caged world
// 11-27: various dark/crypto themed
// 28-31: bright/fiat themed

// Cards that are clearly Bitcoin/crypto themed
const BITCOIN_CARDS = [1, 3, 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];

// Cards that are more general/bright/fiat world
const FIAT_CARDS = [2, 4, 6, 8, 28, 29, 30, 31];

export interface ChallengeClue {
  en: string;
  es: string;
  validCards: number[];  // Cards that are correct answers for this clue
}

export const challengeClues: ChallengeClue[] = [
  { en: 'Down the rabbit hole', es: 'La madriguera', validCards: [1, 5] },
  { en: 'The Citadel', es: 'La ciudadela', validCards: [3] },
  { en: 'Digital gold', es: 'Oro digital', validCards: [5, 9, 13] },
  { en: 'Sovereignty', es: 'Soberanía', validCards: [9, 10] },
  { en: 'HODL', es: 'HODL', validCards: [3, 5, 14] },
  { en: 'Freedom', es: 'Libertad', validCards: [9, 10, 1] },
  { en: 'The matrix', es: 'La matrix', validCards: [5, 10, 11] },
  { en: 'Lightning', es: 'Relámpago', validCards: [9, 13, 15] },
  { en: 'Proof of work', es: 'Prueba de trabajo', validCards: [3, 12, 14] },
  { en: 'Trust no one', es: 'No confíes en nadie', validCards: [10, 11, 16] },
  { en: 'Satoshi', es: 'Satoshi', validCards: [1, 3, 5] },
  { en: 'The red pill', es: 'La pastilla roja', validCards: [1, 5, 11] },
  { en: 'Sound money', es: 'Dinero sano', validCards: [3, 9, 14] },
  { en: 'Exit the system', es: 'Salí del sistema', validCards: [1, 10, 11] },
  { en: 'Decentralization', es: 'Descentralización', validCards: [3, 15, 17] },
  { en: 'Genesis block', es: 'Bloque génesis', validCards: [3, 5, 1] },
  { en: 'Scarcity', es: 'Escasez', validCards: [7, 10, 14] },
  { en: 'Stack sats', es: 'Apilá sats', validCards: [5, 9, 13] },
  { en: 'Fix the money', es: 'Arreglá el dinero', validCards: [3, 9, 10] },
  { en: 'Revolution', es: 'Revolución', validCards: [9, 10, 11] },
  { en: 'Cypherpunk', es: 'Cypherpunk', validCards: [1, 5, 16] },
  { en: 'Censorship resistant', es: 'Resistente a censura', validCards: [10, 15, 17] },
  { en: 'Time preference', es: 'Preferencia temporal', validCards: [7, 12, 14] },
  { en: 'Private keys', es: 'Llaves privadas', validCards: [10, 16, 18] },
  { en: 'Peer to peer', es: 'Persona a persona', validCards: [3, 15, 17] },
  { en: 'Consensus', es: 'Consenso', validCards: [3, 12, 19] },
  { en: 'Number go up', es: 'El número sube', validCards: [5, 9, 13] },
  { en: 'Moon', es: 'Luna', validCards: [7, 20, 21] },
  { en: 'Inflation', es: 'Inflación', validCards: [10, 22, 23] },
  { en: 'Open source', es: 'Código abierto', validCards: [3, 15, 24] },
  { en: 'Unconfiscatable', es: 'Inconfiscable', validCards: [10, 16, 25] },
  { en: 'Stay humble', es: 'Sé humilde', validCards: [1, 12, 26] },
  { en: 'Volatility', es: 'Volatilidad', validCards: [7, 11, 27] },
  { en: 'Bear market', es: 'Mercado bajista', validCards: [10, 11, 22] },
  { en: 'Bull run', es: 'Corrida alcista', validCards: [5, 9, 13] },
];

// Get a random challenge: 1 correct Bitcoin card + 4 distractors (mix of fiat + other bitcoin)
export function generateChallenge(lang: 'en' | 'es', usedClueIndices: Set<number>) {
  // Pick unused clue
  const available = challengeClues
    .map((c, i) => ({ clue: c, index: i }))
    .filter(({ index }) => !usedClueIndices.has(index));

  const pool = available.length > 0 ? available : challengeClues.map((c, i) => ({ clue: c, index: i }));
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const clue = pick.clue;

  // Pick correct card from valid cards
  const correctCard = clue.validCards[Math.floor(Math.random() * clue.validCards.length)];

  // Pick 4 distractors: prefer fiat cards as wrong answers
  const distractors: number[] = [];
  const fiatShuffled = [...FIAT_CARDS].sort(() => Math.random() - 0.5);
  const bitcoinShuffled = BITCOIN_CARDS.filter(c => c !== correctCard && !clue.validCards.includes(c))
    .sort(() => Math.random() - 0.5);

  // Add 2-3 fiat cards as distractors
  const fiatCount = Math.min(fiatShuffled.length, 2 + Math.floor(Math.random() * 2));
  for (let i = 0; i < fiatCount && distractors.length < 4; i++) {
    distractors.push(fiatShuffled[i]);
  }

  // Fill rest with non-matching bitcoin cards
  for (const card of bitcoinShuffled) {
    if (distractors.length >= 4) break;
    if (!distractors.includes(card)) distractors.push(card);
  }

  // Combine and shuffle
  const allCards = [correctCard, ...distractors].sort(() => Math.random() - 0.5);

  return {
    clueText: lang === 'es' ? clue.es : clue.en,
    clueIndex: pick.index,
    correctCard,
    cards: allCards,
  };
}
