export const translations = {
  en: {
    // Landing
    title: 'Rabbit Hole',
    subtitle: 'A game of imagination and revelations',
    subtitle2: 'What lies deep in your unconscious?',
    quickPlay: 'Quick Play',
    connectNostr: 'Connect with Nostr',
    enterName: 'Enter your name',
    createRoom: 'Create Room',
    joinRoom: 'Join Room',
    roomCode: 'Room Code',
    or: 'or',
    language: 'Language',

    // Lobby
    waitingForPlayers: 'Waiting for players...',
    players: 'Players',
    startGame: 'Start Game',
    needMorePlayers: 'Need at least 3 players',
    shareCode: 'Share this code with friends:',
    copied: 'Copied!',
    host: 'Host',
    you: 'You',

    // Game
    yourTurn: 'Your turn! Pick a card and give a clue',
    enterClue: 'Enter your clue...',
    submitClue: 'Submit Clue',
    storytellerClue: 'The Storyteller says:',
    pickCard: 'Pick a card that matches the clue',
    waitingForCards: 'Waiting for other players...',
    voteNow: 'Vote! Which card is the Storyteller\'s?',
    cantVoteOwn: 'You can\'t vote for your own card',
    waitingForVotes: 'Waiting for votes...',

    // Scoring
    roundResults: 'Round Results',
    correctCard: 'Storyteller\'s card',
    points: 'pts',
    tooEasy: 'Too easy! Everyone guessed it',
    tooHard: 'Too hard! No one guessed it',
    goodClue: 'Good clue!',
    youGuessedRight: 'You guessed right!',
    fooledPlayers: 'fooled players',
    nextRound: 'Next round in',

    // End
    gameOver: 'Game Over',
    winner: 'Winner',
    finalScores: 'Final Scores',
    playAgain: 'Play Again',
    backToLobby: 'Back to Lobby',

    // Footer
    poweredBy: 'Powered by Lightning & Nostr',
    madeFor: 'Made for La Crypta Hackathon',
  },

  es: {
    // Landing
    title: 'Rabbit Hole',
    subtitle: 'Un juego de imaginación y revelaciones',
    subtitle2: '¿Qué hay en lo profundo de tu inconsciente?',
    quickPlay: 'Juego Rápido',
    connectNostr: 'Conectar con Nostr',
    enterName: 'Ingresá tu nombre',
    createRoom: 'Crear Sala',
    joinRoom: 'Unirse a Sala',
    roomCode: 'Código de Sala',
    or: 'o',
    language: 'Idioma',

    // Lobby
    waitingForPlayers: 'Esperando jugadores...',
    players: 'Jugadores',
    startGame: 'Iniciar Juego',
    needMorePlayers: 'Se necesitan al menos 3 jugadores',
    shareCode: 'Compartí este código con tus amigos:',
    copied: '¡Copiado!',
    host: 'Anfitrión',
    you: 'Vos',

    // Game
    yourTurn: '¡Tu turno! Elegí una carta y da una pista',
    enterClue: 'Escribí tu pista...',
    submitClue: 'Enviar Pista',
    storytellerClue: 'El Narrador dice:',
    pickCard: 'Elegí la carta que mejor encaje con la pista',
    waitingForCards: 'Esperando a los demás...',
    voteNow: '¡Votá! ¿Cuál es la carta del Narrador?',
    cantVoteOwn: 'No podés votar tu propia carta',
    waitingForVotes: 'Esperando votos...',

    // Scoring
    roundResults: 'Resultados de la Ronda',
    correctCard: 'Carta del Narrador',
    points: 'pts',
    tooEasy: '¡Muy fácil! Todos adivinaron',
    tooHard: '¡Muy difícil! Nadie adivinó',
    goodClue: '¡Buena pista!',
    youGuessedRight: '¡Adivinaste!',
    fooledPlayers: 'engañó jugadores',
    nextRound: 'Próxima ronda en',

    // End
    gameOver: 'Fin del Juego',
    winner: 'Ganador',
    finalScores: 'Puntajes Finales',
    playAgain: 'Jugar de Nuevo',
    backToLobby: 'Volver al Lobby',

    // Footer
    poweredBy: 'Impulsado por Lightning & Nostr',
    madeFor: 'Hecho para La Crypta Hackathon',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
