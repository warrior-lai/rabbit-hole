import { useState } from 'react';
import type { Language } from '@shared/types';
import { fetchNostrProfile } from '../hooks/useNostrProfile';

interface NameOrNostrProps {
  lang: Language;
  onSubmitName: (name: string) => void;
  onNostrLogin: (name: string, npub: string, picture?: string) => void;
}

export function NameOrNostr({ lang, onSubmitName, onNostrLogin }: NameOrNostrProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for saved Nostr session
  const savedNpub = localStorage.getItem('rh-nostr-npub');
  const savedName = localStorage.getItem('rh-nostr-name');
  const savedPicture = localStorage.getItem('rh-nostr-picture') || undefined;

  const handleNostr = async () => {
    const nostr = (window as any).nostr;
    if (!nostr) {
      setError(lang === 'en'
        ? 'No Nostr extension found. Install nos2x or Alby.'
        : 'No se encontró extensión Nostr. Instalá nos2x o Alby.'
      );
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const pubkey = await nostr.getPublicKey();

      // Fetch profile from relays
      const profile = await fetchNostrProfile(pubkey);

      // Persist session
      localStorage.setItem('rh-nostr-npub', pubkey);
      localStorage.setItem('rh-nostr-name', profile.name);
      if (profile.picture) localStorage.setItem('rh-nostr-picture', profile.picture);

      onNostrLogin(profile.name, pubkey, profile.picture);
    } catch {
      setError(lang === 'en' ? 'Connection failed' : 'Error al conectar');
      setTimeout(() => setError(''), 3000);
    }
    setLoading(false);
  };

  const handleSavedNostr = () => {
    if (savedNpub && savedName) {
      onNostrLogin(savedName, savedNpub, savedPicture);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      width: '100%',
      animation: 'fadeInUp 0.4s ease',
    }}>
      <p style={{
        textAlign: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '12px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '4px',
      }}>
        {lang === 'en' ? 'Choose your identity' : 'Elegí tu identidad'}
      </p>

      {/* Name input */}
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          type="text"
          placeholder={lang === 'en' ? 'Enter your name' : 'Ingresá tu nombre'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          autoFocus
          style={{ textAlign: 'center', paddingRight: '44px' }}
        />
        {name && (
          <span style={{
            position: 'absolute',
            right: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#2ecc71',
            fontSize: '16px',
          }}>✓</span>
        )}
      </div>

      <button
        className="btn btn-accent"
        disabled={!name.trim()}
        onClick={() => onSubmitName(name.trim())}
        style={{
          width: '100%',
          fontSize: '15px',
          padding: '16px 32px',
          boxShadow: name.trim() ? '0 0 30px rgba(247,147,26,0.2)' : 'none',
        }}
      >
        ✓ {lang === 'en' ? 'Continue' : 'Continuar'}
      </button>

      <div className="divider" style={{ margin: '2px 0' }}>
        {lang === 'en' ? 'or' : 'o'}
      </div>

      {/* Saved Nostr session */}
      {savedNpub && savedName ? (
        <button
          className="btn btn-primary"
          onClick={handleSavedNostr}
          style={{
            width: '100%',
            background: 'rgba(139, 92, 246, 0.15)',
            borderColor: 'rgba(139, 92, 246, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          {savedPicture ? (
            <img
              src={savedPicture}
              alt=""
              style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <span>🔑</span>
          )}
          {savedName}
        </button>
      ) : (
        <button
          className="btn btn-primary"
          onClick={handleNostr}
          disabled={loading}
          style={{
            width: '100%',
            background: 'rgba(139, 92, 246, 0.15)',
            borderColor: 'rgba(139, 92, 246, 0.25)',
          }}
        >
          {loading ? '⏳' : '🔑'} {lang === 'en' ? 'Connect with Nostr' : 'Conectar con Nostr'}
        </button>
      )}

      {error && (
        <p style={{
          textAlign: 'center',
          color: '#e74c3c',
          fontSize: '12px',
          animation: 'fadeIn 0.3s ease',
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
