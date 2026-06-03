import type { Language } from '@shared/types';

interface GameCancelledProps {
  lang: Language;
  reason: string;
  onNewGame: () => void;
}

const messages = {
  en: {
    not_enough_players: 'Not enough players to continue',
    description: 'A player left and there aren\'t enough players to keep playing. No points are awarded for this game.',
    newGame: 'Start New Game',
  },
  es: {
    not_enough_players: 'No hay suficientes jugadores para continuar',
    description: 'Un jugador se fue y no quedan suficientes jugadores para seguir. No se suman puntos en esta partida.',
    newGame: 'Iniciar Nuevo Juego',
  },
};

export function GameCancelled({ lang, onNewGame }: GameCancelledProps) {
  const m = messages[lang];

  return (
    <div className="page">
      <div style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        textAlign: 'center',
        animation: 'fadeInUp 0.5s ease',
      }}>
        <div style={{
          fontSize: '64px',
          filter: 'drop-shadow(0 0 20px rgba(231,76,60,0.3))',
        }}>
          😔
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>
          {m.not_enough_players}
        </h2>

        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '14px',
          lineHeight: 1.7,
          maxWidth: '320px',
        }}>
          {m.description}
        </p>

        <button
          className="btn btn-accent"
          onClick={onNewGame}
          style={{
            width: '100%',
            fontSize: '16px',
            padding: '18px 32px',
            marginTop: '16px',
          }}
        >
          🔄 {m.newGame}
        </button>
      </div>
    </div>
  );
}
