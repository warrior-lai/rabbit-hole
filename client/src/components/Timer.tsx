import { useState, useEffect } from 'react';

interface TimerProps {
  seconds: number;
  onTimeUp: () => void;
  label?: string;
}

export function Timer({ seconds, onTimeUp, label }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => { setRemaining(seconds); }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) { onTimeUp(); return; }
    const timer = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onTimeUp]);

  const pct = (remaining / seconds) * 100;
  const isLow = remaining <= 10;
  const color = isLow ? '#e74c3c' : '#F7931A';

  return (
    <div style={{ textAlign: 'center', margin: '12px 0' }}>
      {label && (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', letterSpacing: '2px', marginBottom: '6px' }}>
          {label}
        </p>
      )}
      <div style={{
        width: '100%',
        maxWidth: '280px',
        height: '3px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '2px',
        margin: '0 auto',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: '2px',
          transition: 'width 1s linear',
          boxShadow: isLow ? `0 0 10px ${color}` : `0 0 6px ${color}40`,
        }} />
      </div>
      <span style={{
        fontSize: '16px',
        fontWeight: 700,
        color: color,
        marginTop: '6px',
        display: 'inline-block',
        textShadow: isLow ? `0 0 10px ${color}` : 'none',
        animation: isLow ? 'pulse 1s infinite' : 'none',
      }}>
        {remaining}s
      </span>
    </div>
  );
}
