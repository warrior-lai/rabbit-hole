import type { Language } from '@shared/types';

interface PhaseInstructionProps {
  lang: Language;
  phase: 'storytelling-you' | 'storytelling-wait' | 'choosing' | 'choosing-done' | 'voting' | 'voting-done' | 'scoring';
  storytellerName?: string;
}

const instructions = {
  en: {
    'storytelling-you': {
      icon: '🎭',
      title: 'You are the Storyteller',
      text: 'Pick a card and write a clue. Be creative — not too obvious, not too cryptic!',
    },
    'storytelling-wait': {
      icon: '✨',
      title: 'The Storyteller is thinking...',
      text: '{name} is choosing a card and writing a clue.',
    },
    'choosing': {
      icon: '🃏',
      title: 'Choose your card',
      text: 'Pick the card from your hand that best matches the clue.',
    },
    'choosing-done': {
      icon: '⏳',
      title: 'Card submitted!',
      text: 'Waiting for other players to choose...',
    },
    'voting': {
      icon: '🗳️',
      title: 'Time to vote!',
      text: 'Which card do you think is the Storyteller\'s? You can\'t vote for your own.',
    },
    'voting-done': {
      icon: '⏳',
      title: 'Vote submitted!',
      text: 'Waiting for other players to vote...',
    },
    'scoring': {
      icon: '📊',
      title: 'Round results',
      text: 'See how everyone did this round.',
    },
  },
  es: {
    'storytelling-you': {
      icon: '🎭',
      title: 'Sos el Narrador',
      text: 'Elegí una carta y escribí una pista. Sé creativo — ni muy obvia, ni muy críptica!',
    },
    'storytelling-wait': {
      icon: '✨',
      title: 'El Narrador está pensando...',
      text: '{name} está eligiendo una carta y escribiendo una pista.',
    },
    'choosing': {
      icon: '🃏',
      title: 'Elegí tu carta',
      text: 'Elegí de tu mano la carta que mejor encaje con la pista.',
    },
    'choosing-done': {
      icon: '⏳',
      title: '¡Carta enviada!',
      text: 'Esperando a los demás jugadores...',
    },
    'voting': {
      icon: '🗳️',
      title: '¡Hora de votar!',
      text: '¿Cuál creés que es la carta del Narrador? No podés votar la tuya.',
    },
    'voting-done': {
      icon: '⏳',
      title: '¡Voto enviado!',
      text: 'Esperando a los demás jugadores...',
    },
    'scoring': {
      icon: '📊',
      title: 'Resultados de la ronda',
      text: 'Mirá cómo le fue a cada uno.',
    },
  },
};

export function PhaseInstruction({ lang, phase, storytellerName }: PhaseInstructionProps) {
  const data = instructions[lang][phase];
  const text = data.text.replace('{name}', storytellerName || '...');

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px 18px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px',
      backdropFilter: 'blur(16px)',
      marginBottom: '16px',
      animation: 'fadeIn 0.4s ease',
    }}>
      <span style={{ fontSize: '28px', flexShrink: 0 }}>{data.icon}</span>
      <div>
        <p style={{
          fontWeight: 700,
          fontSize: '14px',
          marginBottom: '2px',
          color: '#F7931A',
        }}>
          {data.title}
        </p>
        <p style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.5,
        }}>
          {text}
        </p>
      </div>
    </div>
  );
}
