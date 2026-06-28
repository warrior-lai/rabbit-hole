import { useState, useEffect } from 'react';
import type { Language, PlayerProfile, LeaderboardEntry } from '@shared/types';
import { Rules } from '../components/Rules';
import { NameOrNostr } from '../components/NameOrNostr';
import { Profile } from '../components/Profile';
import { Leaderboard } from '../components/Leaderboard';
import { ArtGallery } from '../components/ArtGallery';
import type { TranslationFn } from '../i18n/translations';

interface LandingProps {
  t: TranslationFn;
  lang: Language;
  toggleLang: () => void;
  onQuickPlay: (name: string, npub?: string) => void;
  onJoinRoom: (name: string, code: string, npub?: string) => void;
  onChallenge: () => void;
  profile: PlayerProfile | null;
  leaderboard: LeaderboardEntry[];
  onRequestProfile: () => void;
  onRequestLeaderboard: (period: 'all' | 'weekly') => void;
}

type Mode = 'home' | 'create-identity' | 'join-identity' | 'join-code';

export function Landing({ t, lang, toggleLang, onQuickPlay, onJoinRoom, onChallenge, profile, leaderboard, onRequestProfile, onRequestLeaderboard }: LandingProps) {
  const [mode, setMode] = useState<Mode>('home');
  const [showRules, setShowRules] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showArt, setShowArt] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [roomCode, setRoomCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('code') || '';
  });
  const [playerName, setPlayerName] = useState('');
  const [playerNpub, setPlayerNpub] = useState<string | undefined>();

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    // Auto-switch to join mode if code in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('code')) {
      setMode('join-identity');
    }
  }, []);

  const handleNameForCreate = (name: string) => {
    onQuickPlay(name);
  };

  const handleNostrForCreate = (name: string, npub: string) => {
    onQuickPlay(name, npub);
  };

  const handleNameForJoin = (name: string) => {
    setPlayerName(name);
    setPlayerNpub(undefined);
    setMode('join-code');
  };

  const handleNostrForJoin = (name: string, npub: string) => {
    setPlayerName(name);
    setPlayerNpub(npub);
    setMode('join-code');
  };

  return (
    <div className="page" style={{ gap: 0 }}>
      <button className="lang-toggle" onClick={toggleLang}>
        {lang === 'en' ? '🇪🇸 Español' : '🇬🇧 English'}
      </button>

      <div style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            fontSize: '72px',
            marginBottom: '16px',
            filter: 'drop-shadow(0 0 30px rgba(247,147,26,0.4))',
            animation: 'gentleBounce 3s ease-in-out infinite',
          }}>
            🐇
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 700,
            letterSpacing: '4px',
            background: 'linear-gradient(135deg, #ffffff 0%, #F7931A 50%, #ff6b00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
            marginBottom: '10px',
          }}>
            rabbit hole
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '1.5px',
            marginBottom: '4px',
          }}>
            {t('subtitle')}
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.25)',
            fontSize: '12px',
            fontStyle: 'italic',
            letterSpacing: '1px',
          }}>
            {t('subtitle2')}
          </p>
        </div>

        {/* HOME: Choose mode */}
        {mode === 'home' && (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            animation: 'fadeInUp 0.5s ease',
          }}>
            {/* Challenge - solo mode */}
            <button
              className="btn btn-accent"
              onClick={onChallenge}
              style={{
                width: '100%',
                fontSize: '16px',
                padding: '18px 32px',
                boxShadow: '0 0 30px rgba(247,147,26,0.2)',
              }}
            >
              🎯 {lang === 'en' ? 'Challenge' : 'Desafío'}
            </button>

            <div className="divider" style={{ margin: '4px 0' }}>
              {lang === 'en' ? 'multiplayer' : 'multijugador'}
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setMode('create-identity')}
              style={{ width: '100%' }}
            >
              ⚡ {t('createRoom')}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setMode('join-identity')}
              style={{ width: '100%' }}
            >
              🚪 {t('joinRoom')}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
              <button
                onClick={() => setShowRules(true)}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.3)', fontSize: '12px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: '0.5px', padding: '4px 8px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >
                📋 {lang === 'en' ? 'How to play' : 'Cómo jugar'}
              </button>
              <button
                onClick={() => { onRequestProfile(); setShowProfile(true); }}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.3)', fontSize: '12px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: '0.5px', padding: '4px 8px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >
                🐇 {lang === 'en' ? 'Profile' : 'Perfil'}
              </button>
              <button
                onClick={() => { onRequestLeaderboard('all'); setShowLeaderboard(true); }}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.3)', fontSize: '12px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: '0.5px', padding: '4px 8px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >
                🏆 {lang === 'en' ? 'Ranking' : 'Ranking'}
              </button>
              <button
                onClick={() => setShowArt(true)}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.3)', fontSize: '12px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: '0.5px', padding: '4px 8px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >
                🎨 {lang === 'en' ? 'Art' : 'Arte'}
              </button>
            </div>
          </div>
        )}

        {/* CREATE: Pick identity */}
        {mode === 'create-identity' && (
          <div style={{ width: '100%' }}>
            <NameOrNostr
              lang={lang}
              onSubmitName={handleNameForCreate}
              onNostrLogin={handleNostrForCreate}
            />
            <button
              className="btn btn-secondary"
              onClick={() => setMode('home')}
              style={{ width: '100%', marginTop: '10px' }}
            >
              ← {lang === 'en' ? 'Back' : 'Volver'}
            </button>
          </div>
        )}

        {/* JOIN: Pick identity */}
        {mode === 'join-identity' && (
          <div style={{ width: '100%' }}>
            <NameOrNostr
              lang={lang}
              onSubmitName={handleNameForJoin}
              onNostrLogin={handleNostrForJoin}
            />
            <button
              className="btn btn-secondary"
              onClick={() => setMode('home')}
              style={{ width: '100%', marginTop: '10px' }}
            >
              ← {lang === 'en' ? 'Back' : 'Volver'}
            </button>
          </div>
        )}

        {/* JOIN: Enter code */}
        {mode === 'join-code' && (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            animation: 'fadeInUp 0.4s ease',
          }}>
            <p style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              {t('roomCode')}
            </p>

            <input
              className="input"
              type="text"
              placeholder="XXXXX"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={5}
              autoFocus
              style={{
                textAlign: 'center',
                fontSize: '32px',
                letterSpacing: '12px',
                fontWeight: 700,
                padding: '20px',
                caretColor: '#F7931A',
              }}
            />

            <button
              className="btn btn-accent"
              disabled={roomCode.length < 5}
              onClick={() => onJoinRoom(playerName, roomCode.trim(), playerNpub)}
              style={{ width: '100%', fontSize: '16px', padding: '18px 32px' }}
            >
              🚪 {t('joinRoom')}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => { setMode('join-identity'); setRoomCode(''); }}
              style={{ width: '100%' }}
            >
              ← {lang === 'en' ? 'Back' : 'Volver'}
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          opacity: 0.15,
        }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase' }}>
            {t('madeFor')}
          </p>
        </div>
      </div>

      {showRules && <Rules lang={lang} onClose={() => setShowRules(false)} />}
      {showProfile && profile && <Profile lang={lang} profile={profile} onClose={() => setShowProfile(false)} />}
      {showLeaderboard && <Leaderboard lang={lang} entries={leaderboard} onClose={() => setShowLeaderboard(false)} onChangePeriod={onRequestLeaderboard} />}
      {showArt && <ArtGallery lang={lang} onClose={() => setShowArt(false)} />}

      <style>{`
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
