import type { PlayerProfile, Language } from '@shared/types';

interface ProfileProps {
  lang: Language;
  profile: PlayerProfile;
  onClose: () => void;
}

export function Profile({ lang, profile, onClose }: ProfileProps) {
  const winRate = profile.gamesPlayed > 0
    ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100)
    : 0;
  const guessRate = profile.totalGuesses > 0
    ? Math.round((profile.correctGuesses / profile.totalGuesses) * 100)
    : 0;

  const stats = [
    {
      icon: '🎮',
      label: lang === 'es' ? 'Partidas' : 'Games',
      value: profile.gamesPlayed,
    },
    {
      icon: '🏆',
      label: lang === 'es' ? 'Victorias' : 'Wins',
      value: profile.gamesWon,
      sub: `${winRate}%`,
    },
    {
      icon: '⚡',
      label: lang === 'es' ? 'Puntos totales' : 'Total Points',
      value: profile.totalPoints,
    },
    {
      icon: '🎯',
      label: lang === 'es' ? 'Mejor puntaje' : 'Best Score',
      value: profile.bestScore,
    },
    {
      icon: '✅',
      label: lang === 'es' ? 'Adivinadas' : 'Correct Guesses',
      value: `${profile.correctGuesses}/${profile.totalGuesses}`,
      sub: `${guessRate}%`,
    },
    {
      icon: '🎩',
      label: lang === 'es' ? 'Engañó jugadores' : 'Fooled Players',
      value: profile.timesDeceived,
    },
  ];

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
          padding: '32px 28px',
          maxWidth: '400px',
          width: '100%',
          backdropFilter: 'blur(50px) saturate(1.5)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>
            🐇 {profile.name || (lang === 'es' ? 'Perfil' : 'Profile')}
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

        {profile.npub && (
          <p style={{
            color: 'rgba(139,92,246,0.7)',
            fontSize: '11px',
            marginBottom: '20px',
            wordBreak: 'break-all',
          }}>
            🔑 {profile.npub.substring(0, 16)}...
          </p>
        )}

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              padding: '14px',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '22px' }}>{s.icon}</span>
              <p style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#F7931A',
                marginTop: '4px',
              }}>
                {s.value}
                {s.sub && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>{s.sub}</span>}
              </p>
              <p style={{
                fontSize: '10px',
                color: 'rgba(255,255,255,0.4)',
                marginTop: '2px',
                letterSpacing: '0.5px',
              }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={onClose}
          style={{ width: '100%', marginTop: '20px' }}
        >
          {lang === 'es' ? 'Cerrar' : 'Close'}
        </button>
      </div>
    </div>
  );
}
