import { useState, useEffect } from 'react';
import type { Room } from '@shared/types';
import type { TranslationFn } from '../i18n/translations';

interface LobbyProps {
  t: TranslationFn;
  room: Room;
  playerId: string;
  onStart: () => void;
}

export function Lobby({ t, room, playerId, onStart }: LobbyProps) {
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const isHost = room.hostId === playerId;
  const canStart = room.gameState.players.length >= room.minPlayers;

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const shareLink = `${window.location.origin}?code=${room.code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page">
      <div style={{
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{
            fontSize: '44px',
            marginBottom: '8px',
            animation: 'gentleBounce 3s ease-in-out infinite',
          }}>🐇</div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>
            {t('waitingForPlayers')}
          </h2>
        </div>

        {/* Room Code Card */}
        <div
          onClick={copyLink}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(30px)',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 40px rgba(247,147,26,0.08)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 50px rgba(247,147,26,0.15)';
            e.currentTarget.style.borderColor = 'rgba(247,147,26,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 40px rgba(247,147,26,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '10px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            {t('shareCode')}
          </p>
          <div style={{
            fontSize: '44px',
            fontWeight: 700,
            letterSpacing: '12px',
            color: '#F7931A',
            textShadow: '0 0 30px rgba(247,147,26,0.3)',
          }}>
            {room.code}
          </div>
          <p style={{
            color: 'rgba(255,255,255,0.2)',
            fontSize: '11px',
            marginTop: '10px',
            transition: 'color 0.2s',
          }}>
            {copied ? '✅ ' + t('copied') : '📋 ' + (navigator.language.startsWith('es') ? 'Copiar link de invitación' : 'Copy invite link')}
          </p>
        </div>

        {/* Players */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>
              {t('players')}
            </span>
            <span style={{
              fontSize: '12px',
              color: '#F7931A',
              fontWeight: 700,
            }}>
              {room.gameState.players.length}/{room.maxPlayers}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {room.gameState.players.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                animation: `fadeInUp 0.3s ease ${i * 0.1}s both`,
              }}>
                <span style={{ fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {p.name}
                  {p.id === room.hostId && (
                    <span style={{
                      background: 'rgba(247,147,26,0.15)',
                      color: '#F7931A',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '10px',
                      fontWeight: 600,
                    }}>
                      👑 {t('host')}
                    </span>
                  )}
                  {p.id === playerId && (
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>
                      ({t('you')})
                    </span>
                  )}
                </span>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: p.isConnected ? '#2ecc71' : '#e74c3c',
                  boxShadow: p.isConnected ? '0 0 8px rgba(46,204,113,0.5)' : 'none',
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        {isHost ? (
          <button
            className="btn btn-accent"
            disabled={!canStart}
            onClick={onStart}
            style={{
              width: '100%',
              fontSize: '16px',
              padding: '18px 32px',
              boxShadow: canStart ? '0 0 30px rgba(247,147,26,0.2)' : 'none',
            }}
          >
            🎮 {canStart ? t('startGame') : t('needMorePlayers')}
          </button>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '16px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '13px',
          }}>
            <span className="pulse">⏳</span> {t('waitingForPlayers')}
          </div>
        )}
      </div>

      <style>{`
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
