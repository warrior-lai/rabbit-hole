import { useState, useEffect, useCallback } from 'react';
import type { Language } from '@shared/types';
import { getCardImage } from './CardHand';
import confetti from 'canvas-confetti';

interface ChallengeProps {
  lang: Language;
  onBack: () => void;
}

// Clues pool — EN and ES
const clues = {
  en: [
    'Freedom', 'Down the rabbit hole', 'Trust no one', 'Digital gold', 'The matrix',
    'Decentralization', 'Proof of work', 'Satoshi', 'Lightning', 'The citadel',
    'HODL', 'Sovereignty', 'Time preference', 'Sound money', 'Exit the system',
    'Inflation', 'Scarcity', 'Genesis block', 'Trustless', 'The red pill',
    'Full node', 'Peer to peer', 'Cypherpunk', 'Private keys', 'Not your keys',
    'Consensus', 'Hash rate', 'Moon', 'Bear market', 'Bull run',
    'Volatility', 'Revolution', 'Censorship resistant', 'Open source', 'Permissionless',
    'Unconfiscatable', 'Fix the money', 'Number go up', 'Stack sats', 'Stay humble',
  ],
  es: [
    'Libertad', 'La madriguera', 'No confíes en nadie', 'Oro digital', 'La matrix',
    'Descentralización', 'Prueba de trabajo', 'Satoshi', 'Relámpago', 'La ciudadela',
    'HODL', 'Soberanía', 'Preferencia temporal', 'Dinero sano', 'Salí del sistema',
    'Inflación', 'Escasez', 'Bloque génesis', 'Sin confianza', 'La pastilla roja',
    'Nodo completo', 'Persona a persona', 'Cypherpunk', 'Llaves privadas', 'Sin tus llaves',
    'Consenso', 'Poder de hash', 'Luna', 'Mercado bajista', 'Corrida alcista',
    'Volatilidad', 'Revolución', 'Resistente a censura', 'Código abierto', 'Sin permisos',
    'Inconfiscable', 'Arreglá el dinero', 'El número sube', 'Apilá sats', 'Sé humilde',
  ],
};

const TOTAL_CARDS = 27;

function getRandomCards(count: number): number[] {
  const all = Array.from({ length: TOTAL_CARDS }, (_, i) => i + 1);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, count);
}

function getRandomClue(lang: Language, usedClues: Set<string>): string {
  const pool = clues[lang].filter(c => !usedClues.has(c));
  if (pool.length === 0) return clues[lang][Math.floor(Math.random() * clues[lang].length)];
  return pool[Math.floor(Math.random() * pool.length)];
}

type Phase = 'picking' | 'result';

export function Challenge({ lang, onBack }: ChallengeProps) {
  const [cards, setCards] = useState<number[]>([]);
  const [correctCard, setCorrectCard] = useState<number>(0);
  const [clue, setClue] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('picking');
  const [streak, setStreak] = useState(0);
  const [usedClues] = useState(() => new Set<string>());
  const [round, setRound] = useState(0);

  const newRound = useCallback(() => {
    const newCards = getRandomCards(4);
    const correct = newCards[Math.floor(Math.random() * 4)];
    const newClue = getRandomClue(lang, usedClues);
    usedClues.add(newClue);

    setCards(newCards);
    setCorrectCard(correct);
    setClue(newClue);
    setSelected(null);
    setPhase('picking');
    setRound(r => r + 1);
  }, [lang, usedClues]);

  useEffect(() => {
    newRound();
  }, []);

  const handleSelect = (cardNum: number) => {
    if (phase !== 'picking') return;
    setSelected(cardNum);
    setPhase('result');

    // Track challenge wins + save winning card
    if (cardNum === correctCard) {
      const wins = parseInt(localStorage.getItem('rh-challenges-won') || '0');
      localStorage.setItem('rh-challenges-won', String(wins + 1));
      
      // Save won cards collection
      const wonCards: number[] = JSON.parse(localStorage.getItem('rh-won-cards') || '[]');
      if (!wonCards.includes(cardNum)) {
        wonCards.push(cardNum);
        localStorage.setItem('rh-won-cards', JSON.stringify(wonCards));
      }
    }

    if (cardNum === correctCard) {
      setStreak(s => s + 1);
      // Confetti on correct!
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#F7931A', '#ffaa00', '#2ecc71', '#fff'],
        });
      }, 300);
    } else {
      setStreak(0);
    }
  };

  const isCorrect = selected === correctCard;

  return (
    <div className="page" style={{ justifyContent: 'flex-start', paddingTop: '20px' }}>
      <div style={{
        width: '100%',
        maxWidth: '700px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        {/* Header */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ← {lang === 'es' ? 'Volver' : 'Back'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px' }}>🔥</span>
              <span style={{ color: '#F7931A', fontWeight: 700, fontSize: '16px' }}>{streak}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px' }}>⚡</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '16px' }}>
                {parseInt(localStorage.getItem('rh-challenges-won') || '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Clue */}
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '24px',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
        }}>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '2px',
          }}>
            « {clue} »
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '12px',
            marginTop: '8px',
          }}>
            {lang === 'es'
              ? 'Seleccioná la carta que corresponde a la pista'
              : 'Select the card that matches the clue'}
          </p>
        </div>

        {/* Result banner */}
        {phase === 'result' && (
          <div className="fade-in" style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: '16px',
            textAlign: 'center',
            background: isCorrect ? 'rgba(46,204,113,0.12)' : 'rgba(231,76,60,0.12)',
            border: `1px solid ${isCorrect ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}`,
          }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: isCorrect ? '#2ecc71' : '#e74c3c' }}>
              {isCorrect
                ? (lang === 'es' ? '✨ ¡Acertaste!' : '✨ You got it!')
                : (lang === 'es' ? '✗ ¡Casi! Seguí intentando' : '✗ Almost! Keep trying')}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>
              {isCorrect
                ? (lang === 'es' ? 'Esa era la carta correcta' : 'That was the correct card')
                : (lang === 'es' ? 'No era esa, pero vas bien' : 'Not that one, but you\'re getting closer')}
            </p>
          </div>
        )}

        {/* Cards */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '8px 0',
        }}>
          {cards.map((cardNum) => {
            const isThis = selected === cardNum;
            const isCorrectCard = correctCard === cardNum;
            const showResult = phase === 'result';

            let borderColor = 'transparent';
            let badge = null;

            if (showResult) {
              if (isCorrectCard) {
                borderColor = '#F7931A';
                badge = '⚡';
              }
              if (isThis && !isCorrectCard) {
                borderColor = '#e74c3c';
                badge = '✕';
              }
              if (isThis && isCorrectCard) {
                borderColor = '#2ecc71';
                badge = '⚡';
              }
            }

            return (
              <div
                key={cardNum}
                style={{
                  position: 'relative',
                  cursor: phase === 'picking' ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  transform: showResult && !isCorrectCard && !isThis ? 'scale(0.9)' : 'scale(1)',
                  opacity: showResult && !isCorrectCard && !isThis ? 0.4 : 1,
                }}
                onClick={() => handleSelect(cardNum)}
              >
                <div style={{
                  width: '220px',
                  height: '310px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: `3px solid ${borderColor}`,
                  boxShadow: showResult && isCorrectCard ? '0 0 25px rgba(247,147,26,0.4)' : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  <img
                    src={getCardImage(`card_${String(cardNum).padStart(3, '0')}`)}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    draggable={false}
                  />
                </div>
                {badge && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isCorrectCard ? '#F7931A' : '#e74c3c',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    boxShadow: `0 0 12px ${isCorrectCard ? 'rgba(247,147,26,0.5)' : 'rgba(231,76,60,0.5)'}`,
                    animation: 'fadeIn 0.4s ease',
                  }}>
                    {badge}
                  </div>
                )}
                {showResult && isThis && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: 'rgba(0,0,0,0.7)',
                    borderRadius: '8px',
                    padding: '2px 8px',
                    fontSize: '9px',
                    color: '#fff',
                    fontWeight: 600,
                  }}>
                    {lang === 'es' ? 'Tu elección' : 'Your pick'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stats */}
        {phase === 'result' && (
          <div className="fade-in" style={{ textAlign: 'center', marginTop: '8px' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
              {lang === 'es' ? 'Racha' : 'Streak'}: 🔥 {streak}
            </p>
          </div>
        )}

        {/* Next challenge button */}
        {phase === 'result' && (
          <button
            className="btn btn-accent fade-in"
            onClick={newRound}
            style={{
              width: '100%',
              maxWidth: '400px',
              fontSize: '16px',
              padding: '18px',
              marginTop: '8px',
            }}
          >
            ▶ {lang === 'es' ? 'Siguiente Desafío' : 'Next Challenge'}
          </button>
        )}
      </div>
    </div>
  );
}
