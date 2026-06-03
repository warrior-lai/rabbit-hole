import { useEffect, useState } from 'react';
import type { Player } from '@shared/types';

interface GameOverProps {
  t: (key: string) => string;
  players: Player[];
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export function GameOver({ t, players, onPlayAgain, onBackToLobby }: GameOverProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowConfetti(true), 300);
  }, []);

  return (
    <div className="page">
      <div style={{
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        textAlign: 'center',
      }}>
        {/* Trophy with glow */}
        <div style={{
          fontSize: '80px',
          filter: 'drop-shadow(0 0 40px rgba(247,147,26,0.5))',
          animation: 'gentleBounce 2s ease-in-out infinite',
        }}>
          🏆
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #fff, #F7931A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {t('gameOver')}
        </h1>

        {/* Winner highlight */}
        <div style={{
          background: 'rgba(247,147,26,0.1)',
          border: '1px solid rgba(247,147,26,0.2)',
          borderRadius: '20px',
          padding: '20px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 40px rgba(247,147,26,0.1)',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>
            {t('winner')}
          </p>
          <p style={{ fontSize: '24px', fontWeight: 700 }}>
            {winner.name}
          </p>
          <p style={{ color: '#F7931A', fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>
            {winner.score} {t('points')}
          </p>
        </div>

        {/* Leaderboard */}
        <div>
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '10px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            {t('finalScores')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sorted.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: i === 0 ? 'rgba(247,147,26,0.08)' : 'rgba(255,255,255,0.03)',
                borderRadius: '14px',
                backdropFilter: 'blur(10px)',
                border: i === 0 ? '1px solid rgba(247,147,26,0.15)' : '1px solid rgba(255,255,255,0.04)',
                animation: `fadeInUp 0.4s ease ${i * 0.1}s both`,
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{p.name}</span>
                </span>
                <span style={{
                  color: i === 0 ? '#F7931A' : 'rgba(255,255,255,0.6)',
                  fontWeight: 700,
                  fontSize: '18px',
                }}>
                  {p.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <button
            className="btn btn-accent"
            onClick={onPlayAgain}
            style={{ width: '100%', fontSize: '16px', padding: '18px' }}
          >
            🔄 {t('playAgain')}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onBackToLobby}
            style={{ width: '100%' }}
          >
            ← {t('backToLobby')}
          </button>
        </div>
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
