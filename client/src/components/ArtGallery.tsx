import { useState } from 'react';
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

function DeckDetail({ deck, lang, onBack }: { deck: Deck; lang: Language; onBack: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
            fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ← {lang === 'es' ? 'Volver' : 'Back'}
        </button>
      </div>

      {/* Deck title */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#F7931A', marginBottom: '4px' }}>
          {deck.name}
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
          {lang === 'es' ? 'Artista' : 'Artist'}: <span style={{ color: '#fff', fontWeight: 600 }}>{deck.artist}</span>
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
          {deck.cardCount} {lang === 'es' ? 'cartas' : 'cards'}
        </p>
      </div>

      {/* All cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '8px',
      }}>
        {deck.cards.map((num) => (
          <img
            key={num}
            src={getCardImage(`card_${String(num).padStart(3, '0')}`)}
            alt=""
            style={{
              width: '100%',
              aspectRatio: '5/7',
              borderRadius: '10px',
              objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'transform 0.2s, border-color 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.06)';
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
          maxWidth: '640px',
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
                🎨 {lang === 'es' ? 'Mazos de Cartas' : 'Decks of Cards'}
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
