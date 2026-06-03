import { useState } from 'react';
import type { LeaderboardEntry, Language } from '@shared/types';

interface LeaderboardProps {
  lang: Language;
  entries: LeaderboardEntry[];
  onClose: () => void;
  onChangePeriod: (period: 'all' | 'weekly') => void;
}

export function Leaderboard({ lang, entries, onClose, onChangePeriod }: LeaderboardProps) {
  const [period, setPeriod] = useState<'all' | 'weekly'>('all');

  const handlePeriod = (p: 'all' | 'weekly') => {
    setPeriod(p);
    onChangePeriod(p);
  };

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
          maxWidth: '440px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          backdropFilter: 'blur(50px) saturate(1.5)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>
            🏆 {lang === 'es' ? 'Ranking' : 'Leaderboard'}
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

        {/* Period toggle */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '16px',
        }}>
          <button
            onClick={() => handlePeriod('all')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              background: period === 'all' ? 'rgba(247,147,26,0.15)' : 'transparent',
              color: period === 'all' ? '#F7931A' : 'rgba(255,255,255,0.4)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '1px',
              transition: 'all 0.2s',
            }}
          >
            {lang === 'es' ? 'GENERAL' : 'ALL TIME'}
          </button>
          <button
            onClick={() => handlePeriod('weekly')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              background: period === 'weekly' ? 'rgba(247,147,26,0.15)' : 'transparent',
              color: period === 'weekly' ? '#F7931A' : 'rgba(255,255,255,0.4)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '1px',
              transition: 'all 0.2s',
            }}
          >
            {lang === 'es' ? 'SEMANAL' : 'WEEKLY'}
          </button>
        </div>

        {/* Entries */}
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>🐇</p>
            <p style={{ fontSize: '13px' }}>
              {lang === 'es' ? 'Aún no hay jugadores' : 'No players yet'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {entries.map((entry, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                background: i < 3 ? `rgba(247,147,26,${0.08 - i * 0.02})` : 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: i === 0 ? '1px solid rgba(247,147,26,0.15)' : '1px solid rgba(255,255,255,0.04)',
                animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px', width: '28px', textAlign: 'center' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '13px' }}>
                      {entry.name}
                      {entry.npub && <span style={{ color: 'rgba(139,92,246,0.5)', marginLeft: '4px', fontSize: '10px' }}>🔑</span>}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                      {entry.gamesPlayed} {lang === 'es' ? 'partidas' : 'games'} · {entry.gamesWon} {lang === 'es' ? 'victorias' : 'wins'}
                    </p>
                  </div>
                </div>
                <span style={{
                  color: i === 0 ? '#F7931A' : 'rgba(255,255,255,0.6)',
                  fontWeight: 700,
                  fontSize: '18px',
                }}>
                  {entry.totalPoints}
                </span>
              </div>
            ))}
          </div>
        )}

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
