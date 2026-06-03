import type { RoundResult, Player } from '@shared/types';

interface RoundResultsProps {
  t: (key: string) => string;
  result: RoundResult;
  players: Player[];
  playerId: string;
}

export function RoundResults({ t, result, players }: RoundResultsProps) {
  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || '???';

  // Determine outcome
  const totalVoters = result.votes.length;
  const correctVotes = result.votes.filter(v => v.cardId === result.storytellerCardId).length;
  const allGuessed = correctVotes === totalVoters;
  const noneGuessed = correctVotes === 0;

  return (
    <div className="fade-in" style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>
        📊 {t('roundResults')}
      </h2>

      {/* Clue reminder */}
      <div style={{
        background: '#111',
        borderRadius: '12px',
        padding: '12px 20px',
        marginBottom: '16px',
        border: '1px solid #1a1a1a',
      }}>
        <p style={{ color: '#888', fontSize: '11px' }}>
          {getPlayerName(result.storytellerId)}:
        </p>
        <p style={{ color: '#F7931A', fontWeight: 700, fontSize: '18px' }}>
          "{result.clue}"
        </p>
      </div>

      {/* Outcome */}
      <div style={{
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        background: allGuessed || noneGuessed ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)',
        border: `1px solid ${allGuessed || noneGuessed ? 'rgba(231, 76, 60, 0.3)' : 'rgba(46, 204, 113, 0.3)'}`,
      }}>
        <p style={{ fontWeight: 700, fontSize: '14px' }}>
          {allGuessed ? `😅 ${t('tooEasy')}` :
           noneGuessed ? `🤯 ${t('tooHard')}` :
           `✨ ${t('goodClue')}`}
        </p>
        <p style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
          {correctVotes}/{totalVoters} correct
        </p>
      </div>

      {/* Score breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {result.scores.map((s, i) => (
          <div key={`${s.playerId}-${i}`} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: '#0a0a0a',
            borderRadius: '6px',
          }}>
            <span style={{ fontSize: '13px' }}>
              {getPlayerName(s.playerId)}
              <span style={{ color: '#555', fontSize: '11px', marginLeft: '6px' }}>
                {s.reason === 'good_clue' ? '🎭' :
                 s.reason === 'correct_guess' ? '✅' :
                 s.reason === 'deceived' ? '🎩' :
                 s.reason === 'storyteller_failed' ? '🎁' :
                 s.reason === 'too_easy' || s.reason === 'too_hard' ? '❌' : ''}
              </span>
            </span>
            <span style={{
              color: s.points > 0 ? '#F7931A' : '#e74c3c',
              fontWeight: 700,
              fontSize: '13px',
            }}>
              +{s.points} {t('points')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
