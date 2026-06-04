import type { Language } from '@shared/types';
import { getCardImage } from './CardHand';

interface ArtGalleryProps {
  lang: Language;
  onClose: () => void;
}

const TOTAL_CARDS = 27;

// Decks / collections — for now one deck, ready for more
const decks = [
  {
    id: 'original',
    name: { en: 'Original Deck', es: 'Mazo Original' },
    description: { en: 'The first collection of Rabbit Hole cards', es: 'La primera colección de cartas de Rabbit Hole' },
    cards: Array.from({ length: TOTAL_CARDS }, (_, i) => i + 1),
    status: 'active' as const,
  },
  {
    id: 'abstract',
    name: { en: 'Abstract Visions', es: 'Visiones Abstractas' },
    description: { en: 'Coming soon...', es: 'Próximamente...' },
    cards: [],
    status: 'coming' as const,
  },
  {
    id: 'cyberpunk',
    name: { en: 'Cyberpunk Dreams', es: 'Sueños Cyberpunk' },
    description: { en: 'Coming soon...', es: 'Próximamente...' },
    cards: [],
    status: 'coming' as const,
  },
];

export function ArtGallery({ lang, onClose }: ArtGalleryProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
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
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '28px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          backdropFilter: 'blur(50px) saturate(1.5)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>
            🎨 {lang === 'es' ? 'Arte' : 'Art'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none', color: '#fff',
              width: '34px', height: '34px', borderRadius: '50%',
              fontSize: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '12px',
          marginBottom: '20px',
        }}>
          {lang === 'es'
            ? 'Explorá las colecciones de cartas del juego'
            : 'Explore the game card collections'}
        </p>

        {/* Decks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {decks.map((deck) => (
            <div key={deck.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '16px',
              opacity: deck.status === 'coming' ? 0.5 : 1,
            }}>
              {/* Deck header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F7931A' }}>
                    {deck.name[lang]}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    {deck.description[lang]}
                  </p>
                </div>
                {deck.status === 'active' && (
                  <span style={{
                    background: 'rgba(247,147,26,0.15)',
                    color: '#F7931A',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}>
                    {deck.cards.length} {lang === 'es' ? 'cartas' : 'cards'}
                  </span>
                )}
                {deck.status === 'coming' && (
                  <span style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.3)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: 600,
                  }}>
                    {lang === 'es' ? 'Próximamente' : 'Coming soon'}
                  </span>
                )}
              </div>

              {/* Card strip — horizontal scroll */}
              {deck.cards.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                }}>
                  {deck.cards.map((num) => (
                    <img
                      key={num}
                      src={getCardImage(`card_${String(num).padStart(3, '0')}`)}
                      alt=""
                      style={{
                        width: '80px',
                        height: '113px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'transform 0.2s, border-color 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.08)';
                        e.currentTarget.style.borderColor = 'rgba(247,147,26,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      }}
                      draggable={false}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={onClose}
          style={{ width: '100%', marginTop: '16px' }}
        >
          {lang === 'es' ? 'Cerrar' : 'Close'}
        </button>
      </div>
    </div>
  );
}
