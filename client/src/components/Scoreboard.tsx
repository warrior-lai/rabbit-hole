import type { Player } from '@shared/types';

interface ScoreboardProps {
  players: Player[];
  currentStorytellerId: string;
}

export function Scoreboard({ players, currentStorytellerId }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const lang = navigator.language.startsWith('es') ? 'es' : 'en';

  return (
    <div style={{
      background: 'rgba(10,10,15,0.5)',
      borderRadius: '12px',
      padding: '10px',
      border: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(16px)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 8px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '4px',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '2px' }}>
          {lang === 'es' ? 'JUGADORES' : 'PLAYERS'}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>
          {players.filter(p => p.isConnected).length}/{players.length}
        </span>
      </div>
      {sorted.map((p, i) => (
        <div
          key={p.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '7px 8px',
            borderRadius: '6px',
            background: i === 0 && p.score > 0 ? 'rgba(247, 147, 26, 0.05)' : 'transparent',
          }}
        >
          <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Online/offline indicator */}
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: p.isConnected ? '#2ecc71' : '#e74c3c',
              boxShadow: p.isConnected ? '0 0 6px rgba(46,204,113,0.5)' : '0 0 6px rgba(231,76,60,0.3)',
              flexShrink: 0,
            }} />
            <span style={{ color: '#555', fontSize: '10px', width: '16px' }}>
              {i === 0 && p.score > 0 ? '👑' : `${i + 1}.`}
            </span>
            <span style={{
              color: p.isConnected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
              textDecoration: p.isConnected ? 'none' : 'line-through',
            }}>
              {p.name}
            </span>
            {p.id === currentStorytellerId && (
              <span style={{ fontSize: '10px' }}>🎭</span>
            )}
          </span>
          <span style={{
            color: '#F7931A',
            fontWeight: 700,
            fontSize: '13px',
          }}>
            {p.score}
          </span>
        </div>
      ))}
    </div>
  );
}
