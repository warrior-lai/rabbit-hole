import type { Language } from '@shared/types';

interface RulesProps {
  lang: Language;
  onClose: () => void;
}

const rules = {
  en: {
    title: 'How to Play',
    subtitle: 'A game of imagination and revelations',
    sections: [
      {
        icon: '🎮',
        title: 'Overview',
        text: '3 to 10 players. Each player gets 6 cards with abstract images. Take turns being the Storyteller. The player with the most points at the end wins!',
      },
      {
        icon: '🎭',
        title: '1. The Storyteller',
        text: 'The Storyteller looks at their cards, picks one, and says a clue out loud — a word, a phrase, a sound, a song, anything! The clue should be creative but not too obvious.',
      },
      {
        icon: '🃏',
        title: '2. Choose a Card',
        text: 'All other players pick the card from their hand that best matches the Storyteller\'s clue. Cards are collected and shuffled together with the Storyteller\'s card.',
      },
      {
        icon: '🗳️',
        title: '3. Vote',
        text: 'All cards are revealed face up. Each player (except the Storyteller) votes for which card they think belongs to the Storyteller. You can\'t vote for your own card!',
      },
      {
        icon: '⚡',
        title: '4. Scoring',
        items: [
          'If EVERYONE or NO ONE finds the Storyteller\'s card → Storyteller gets 0 pts, everyone else gets 2 pts',
          'If SOME players guess correctly → Storyteller gets 3 pts + correct guessers get 3 pts',
          'Bonus: each vote your card receives (when you\'re not Storyteller) = +1 pt',
        ],
      },
      {
        icon: '💡',
        title: '5. The Trick',
        text: 'Your clue must be neither too easy nor too hard! If everyone guesses it — you were too obvious. If no one guesses it — you were too cryptic. Find the sweet spot!',
      },
      {
        icon: '🏆',
        title: 'Winning',
        text: 'The game ends when the deck runs out. The player with the most points wins!',
      },
    ],
  },
  es: {
    title: 'Cómo Jugar',
    subtitle: 'Un juego de imaginación y revelaciones',
    sections: [
      {
        icon: '🎮',
        title: 'Resumen',
        text: 'De 3 a 10 jugadores. Cada jugador recibe 6 cartas con imágenes abstractas. Se turnan para ser el Narrador. ¡El jugador con más puntos al final gana!',
      },
      {
        icon: '🎭',
        title: '1. El Narrador',
        text: 'El Narrador mira sus cartas, elige una y dice una pista en voz alta — una palabra, una frase, un sonido, una canción, ¡lo que quiera! La pista debe ser creativa pero no muy obvia.',
      },
      {
        icon: '🃏',
        title: '2. Elegir una Carta',
        text: 'Todos los demás jugadores eligen de su mano la carta que mejor encaje con la pista del Narrador. Las cartas se juntan y mezclan con la carta del Narrador.',
      },
      {
        icon: '🗳️',
        title: '3. Votar',
        text: 'Todas las cartas se revelan boca arriba. Cada jugador (excepto el Narrador) vota cuál cree que es la carta del Narrador. ¡No podés votar tu propia carta!',
      },
      {
        icon: '⚡',
        title: '4. Puntuación',
        items: [
          'Si TODOS o NADIE adivina la carta del Narrador → Narrador suma 0 pts, los demás suman 2 pts',
          'Si ALGUNOS adivinan → Narrador suma 3 pts + los que adivinaron suman 3 pts',
          'Bonus: cada voto que recibe tu carta (cuando no sos Narrador) = +1 pt',
        ],
      },
      {
        icon: '💡',
        title: '5. El Truco',
        text: '¡Tu pista no debe ser ni muy fácil ni muy difícil! Si todos la adivinan — fuiste muy obvio. Si nadie la adivina — fuiste muy críptico. ¡Encontrá el punto justo!',
      },
      {
        icon: '🏆',
        title: 'Ganar',
        text: 'El juego termina cuando se acaba el mazo. ¡El jugador con más puntos gana!',
      },
    ],
  },
};

export function Rules({ lang, onClose }: RulesProps) {
  const r = rules[lang];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}
      onClick={onClose}
    >
      <div
        className="fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, rgba(90,40,120,0.45) 0%, rgba(180,80,40,0.35) 50%, rgba(60,30,90,0.4) 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px',
          padding: '32px 28px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          backdropFilter: 'blur(60px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(60px) saturate(1.8)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>📋 {r.title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '13px',
          marginBottom: '24px',
          fontStyle: 'italic',
        }}>
          {r.subtitle}
        </p>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {r.sections.map((section, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              padding: '16px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '20px' }}>{section.icon}</span>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F7931A' }}>
                  {section.title}
                </h3>
              </div>
              {'text' in section && section.text && (
                <p style={{
                  fontSize: '12.5px',
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.7,
                }}>
                  {section.text}
                </p>
              )}
              {'items' in section && section.items && (
                <ul style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.7,
                  paddingLeft: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  {section.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Close button */}
        <button
          className="btn btn-accent"
          onClick={onClose}
          style={{ width: '100%', marginTop: '20px' }}
        >
          {lang === 'en' ? 'Got it!' : '¡Entendido!'}
        </button>
      </div>
    </div>
  );
}
