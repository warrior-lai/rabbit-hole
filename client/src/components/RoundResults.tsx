import type { RoundResult, Player } from '@shared/types';
import { getCardImage } from './CardHand';

interface RoundResultsProps {
  t: (key: string) => string;
  result: RoundResult;
  players: Player[];
  playerId: string;
}

export function RoundResults({ t, result, players, playerId }: RoundResultsProps) {
  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || '???';
  const lang = navigator.language.startsWith('es') ? 'es' : 'en';

  const totalVoters = result.votes.length;
  const correctVotes = result.votes.filter(v => v.cardId === result.storytellerCardId).length;
  const allGuessed = correctVotes === totalVoters;
  const noneGuessed = correctVotes === 0;

  // Get votes per card
  const getVotesForCard = (cardId: string) =>
    result.votes.filter(v => v.cardId === cardId).map(v => getPlayerName(v.voterId));

  return (
    <div className="fade-in">
      {/* Clue + outcome */}
      <div style={{
        textAlign: 'center',
        marginBottom: '16px',
      }}>
        <p style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '10px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}>
          🎭 {getPlayerName(result.storytellerId)}
        </p>
        <p style={{ fontSize: '22px', fontWeight: 700, color: '#F7931A', marginBottom: '8px' }}>
          "{result.clue}"
        </p>
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          background: allGuessed || noneGuessed ? 'rgba(231,76,60,0.12)' : 'rgba(46,204,113,0.12)',
          color: allGuessed || noneGuessed ? '#e74c3c' : '#2ecc71',
          border: `1px solid ${allGuessed || noneGuessed ? 'rgba(231,76,60,0.25)' : 'rgba(46,204,113,0.25)'}`,
        }}>
          {allGuessed ? `😅 ${t('tooEasy')}` :
           noneGuessed ? `🤯 ${t('tooHard')}` :
           `✨ ${t('goodClue')}`}
          <span style={{ marginLeft: '8px', opacity: 0.6 }}>
            {correctVotes}/{totalVoters}
          </span>
        </div>
      </div>

      {/* ===== CARDS REVEAL ===== */}
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '16px',
      }}>
        {result.playedCards.map((pc) => {
          const isStoryteller = pc.cardId === result.storytellerCardId;
          const votesForThis = getVotesForCard(pc.cardId);
          const owner = getPlayerName(pc.playerId);
          const isMe = pc.playerId === playerId;

          return (
            <div key={pc.cardId} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              width: '110px',
            }}>
              {/* Card */}
              <div style={{
                width: '100px',
                height: '140px',
                borderRadius: '10px',
                overflow: 'hidden',
                border: isStoryteller
                  ? '3px solid #F7931A'
                  : '2px solid rgba(255,255,255,0.1)',
                boxShadow: isStoryteller
                  ? '0 0 20px rgba(247,147,26,0.3)'
                  : 'none',
                position: 'relative',
              }}>
                <img
                  src={getCardImage(pc.cardId)}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Storyteller badge */}
                {isStoryteller && (
                  <div style={{
                    position: 'absolute',
                    top: '-1px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#F7931A',
                    color: '#000',
                    fontSize: '8px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '0 0 6px 6px',
                    letterSpacing: '1px',
                  }}>
                    {lang === 'es' ? '✓ NARRADOR' : '✓ STORYTELLER'}
                  </div>
                )}
              </div>

              {/* Owner name */}
              <p style={{
                fontSize: '11px',
                fontWeight: isStoryteller ? 700 : 400,
                color: isStoryteller ? '#F7931A' : isMe ? '#fff' : 'rgba(255,255,255,0.5)',
              }}>
                {owner} {isMe ? `(${lang === 'es' ? 'vos' : 'you'})` : ''}
              </p>

              {/* Votes received */}
              {votesForThis.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}>
                  {votesForThis.map((voter, vi) => (
                    <span key={vi} style={{
                      fontSize: '9px',
                      color: isStoryteller ? 'rgba(46,204,113,0.8)' : 'rgba(231,76,60,0.7)',
                      background: isStoryteller ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.08)',
                      padding: '1px 6px',
                      borderRadius: '8px',
                    }}>
                      {isStoryteller ? '✓' : '✗'} {voter}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== POINTS BREAKDOWN ===== */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
        padding: '12px',
      }}>
        <p style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '8px',
          textAlign: 'center',
        }}>
          {lang === 'es' ? 'Puntos' : 'Points'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {result.scores.map((s, i) => (
            <div key={`${s.playerId}-${i}`} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 10px',
              borderRadius: '8px',
              background: s.playerId === playerId ? 'rgba(247,147,26,0.06)' : 'transparent',
            }}>
              <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>
                  {s.reason === 'good_clue' ? '🎭' :
                   s.reason === 'correct_guess' ? '✅' :
                   s.reason === 'deceived' ? '🎩' :
                   s.reason === 'storyteller_failed' ? '🎁' : '❌'}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {getPlayerName(s.playerId)}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>
                  {s.reason === 'good_clue' ? (lang === 'es' ? 'buena pista' : 'good clue') :
                   s.reason === 'correct_guess' ? (lang === 'es' ? 'adivinó' : 'guessed right') :
                   s.reason === 'deceived' ? (lang === 'es' ? 'engañó' : 'fooled players') :
                   s.reason === 'storyteller_failed' ? (lang === 'es' ? 'bonus' : 'bonus') :
                   lang === 'es' ? 'sin puntos' : 'no points'}
                </span>
              </span>
              <span style={{
                color: s.points > 0 ? '#F7931A' : 'rgba(255,255,255,0.2)',
                fontWeight: 700,
                fontSize: '14px',
              }}>
                +{s.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
