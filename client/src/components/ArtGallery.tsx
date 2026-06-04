import { useState, useEffect } from 'react';
import type { Language } from '@shared/types';
import { getCardImage } from './CardHand';

interface ArtGalleryProps {
  lang: Language;
  onClose: () => void;
}

const TOTAL_CARDS = 27;

interface Deck {
  id: string;
  name: string;
  artist: string;
  cardCount: number;
  cards: number[];
  status: 'active' | 'coming';
}

const decks: Deck[] = [
  {
    id: 'genesis',
    name: 'Bloque Génesis',
    artist: 'Lai',
    cardCount: TOTAL_CARDS,
    cards: Array.from({ length: TOTAL_CARDS }, (_, i) => i + 1),
    status: 'active',
  },
  {
    id: 'abstract',
    name: 'Visiones Abstractas',
    artist: '???',
    cardCount: 0,
    cards: [],
    status: 'coming',
  },
  {
    id: 'cyberpunk',
    name: 'Sueños Cyberpunk',
    artist: '???',
    cardCount: 0,
    cards: [],
    status: 'coming',
  },
];

function DeckPreview({ deck, onClick }: { deck: Deck; onClick: () => void }) {
  // Show 5 cards fanned out as preview
  const previewCards = deck.cards.slice(0, 7);

  return (
    <div
      onClick={deck.status === 'active' ? onClick : undefined}
      style={{
        position: 'relative',
        width: '100%',
        height: '220px',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: deck.status === 'active' ? 'pointer' : 'default',
        opacity: deck.status === 'coming' ? 0.4 : 1,
        transition: 'transform 0.3s, box-shadow 0.3s',
      }}
      onMouseEnter={(e) => {
        if (deck.status === 'active') {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(247,147,26,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Card fan background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        gap: '0',
        overflow: 'hidden',
      }}>
        {previewCards.map((num, i) => (
          <div key={num} style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            animation: `deckSlide ${3 + i * 0.5}s ease-in-out infinite alternate`,
          }}>
            <img
              src={getCardImage(`card_${String(num).padStart(3, '0')}`)}
              alt=""
              style={{
                width: '100%',
                height: '220px',
                objectFit: 'cover',
                filter: 'brightness(0.6)',
              }}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Overlay gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
      }} />

      {/* Title centered */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        <h3 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#fff',
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          marginBottom: '4px',
        }}>
          {deck.name}
        </h3>
        <p style={{
          fontSize: '13px',
          color: '#F7931A',
          fontWeight: 600,
          textShadow: '0 1px 8px rgba(0,0,0,0.5)',
        }}>
          {deck.status === 'active'
            ? `${deck.cardCount} cards · by ${deck.artist}`
            : 'Próximamente'}
        </p>
      </div>
    </div>
  );
}

function CardLightbox({ cards, startIndex, onClose }: { cards: number[]; startIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex);
  const card = cards[index];

  const prev = () => setIndex(i => i > 0 ? i - 1 : cards.length - 1);
  const next = () => setIndex(i => i < cards.length - 1 ? i + 1 : 0);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setIndex(i => i > 0 ? i - 1 : cards.length - 1);
      if (e.key === 'ArrowRight') setIndex(i => i < cards.length - 1 ? i + 1 : 0);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cards.length, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px', right: '16px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none', color: '#fff',
          width: '40px', height: '40px', borderRadius: '50%',
          fontSize: '20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 3001,
        }}
      >✕</button>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff',
          width: '48px', height: '48px', borderRadius: '50%',
          fontSize: '22px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          zIndex: 3001,
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(247,147,26,0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      >‹</button>

      {/* Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fade-in"
        style={{ textAlign: 'center' }}
      >
        <img
          src={getCardImage(`card_${String(card).padStart(3, '0')}`)}
          alt=""
          style={{
            maxHeight: '75vh',
            maxWidth: '90vw',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
          draggable={false}
        />
        <p style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: '12px',
          marginTop: '12px',
        }}>
          {index + 1} / {cards.length}
        </p>
      </div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff',
          width: '48px', height: '48px', borderRadius: '50%',
          fontSize: '22px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          zIndex: 3001,
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(247,147,26,0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      >›</button>
    </div>
  );
}

function DeckDetail({ deck, lang, onBack }: { deck: Deck; lang: Language; onBack: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {lightboxIndex !== null && (
        <CardLightbox
          cards={deck.cards}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
            padding: '8px 16px', borderRadius: '20px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(247,147,26,0.3)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          ← {lang === 'es' ? 'Volver' : 'Back'}
        </button>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
          {deck.cardCount} {lang === 'es' ? 'cartas' : 'cards'}
        </span>
      </div>

      {/* Deck title + artist prominent */}
      <div style={{ textAlign: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          {deck.name}
        </h2>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(247,147,26,0.1)',
          border: '1px solid rgba(247,147,26,0.2)',
          padding: '8px 20px',
          borderRadius: '30px',
        }}>
          <span style={{ fontSize: '14px' }}>✨</span>
          <span style={{ fontSize: '15px', color: '#F7931A', fontWeight: 700, letterSpacing: '0.5px' }}>
            {lang === 'es' ? 'Artista' : 'Artist'}: {deck.artist}
          </span>
        </div>
      </div>

      {/* All cards grid — big cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '12px',
      }}>
        {deck.cards.map((num) => (
          <img
            key={num}
            src={getCardImage(`card_${String(num).padStart(3, '0')}`)}
            alt=""
            style={{
              width: '100%',
              aspectRatio: '5/7',
              borderRadius: '12px',
              objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.06)',
              transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = 'rgba(247,147,26,0.4)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(247,147,26,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setLightboxIndex(deck.cards.indexOf(num))}
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
}

export function ArtGallery({ lang, onClose }: ArtGalleryProps) {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(12px)',
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
          maxWidth: selectedDeck ? '900px' : '640px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          backdropFilter: 'blur(50px) saturate(1.5)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}
      >
        {!selectedDeck ? (
          <>
            {/* Gallery view */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700 }}>
                🎨 {lang === 'es' ? 'Galería de Arte' : 'Art Gallery'}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {decks.map((deck) => (
                <DeckPreview
                  key={deck.id}
                  deck={deck}
                  onClick={() => setSelectedDeck(deck)}
                />
              ))}
            </div>
          </>
        ) : (
          <DeckDetail
            deck={selectedDeck}
            lang={lang}
            onBack={() => setSelectedDeck(null)}
          />
        )}
      </div>

      <style>{`
        @keyframes deckSlide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-5px); }
        }
      `}</style>
    </div>
  );
}
