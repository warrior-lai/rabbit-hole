import type { Player } from '@shared/types';

interface ScoreboardProps {
  players: Player[];
  currentStorytellerId: string;
}

export function Scoreboard({ players, currentStorytellerId }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div style={{
      background: '#0a0a0a',
      borderRadius: '8px',
      padding: '10px',
      border: '1px solid #1a1a1a',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 8px 6px',
        borderBottom: '1px solid #1a1a1a',
        marginBottom: '4px',
      }}>
        <span style={{ color: '#555', fontSize: '10px', fontWeight: 700, letterSpacing: '1px' }}>
          SCOREBOARD
        </span>
      </div>
      {sorted.map((p, i) => (
        <div
          key={p.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 8px',
            borderRadius: '4px',
            background: i === 0 && p.score > 0 ? 'rgba(247, 147, 26, 0.05)' : 'transparent',
          }}
        >
          <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#555', fontSize: '10px', width: '16px' }}>
              {i === 0 && p.score > 0 ? '👑' : `${i + 1}.`}
            </span>
            <span style={{ color: p.isConnected ? '#ccc' : '#444' }}>
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
