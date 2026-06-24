import { useEffect, useReducer, useState } from 'react';
import { gameReducer, initialState } from './state/gameReducer';
import { STEAL_COST } from './state/gameTypes';
import { useAudioPreview } from './hooks/useAudioPreview';
import { PlayerHeader } from './components/PlayerHeader';
import { SetupScreen } from './screens/SetupScreen';
import { TurnHiddenScreen } from './screens/TurnHiddenScreen';
import { PlacementScreen } from './screens/PlacementScreen';
import { ChallengeScreen } from './screens/ChallengeScreen';
import { RevealScreen } from './screens/RevealScreen';
import { GameOverScreen } from './screens/GameOverScreen';

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [challenging, setChallenging] = useState(false);
  const audio = useAudioPreview(state.currentCard);

  const activePlayer = state.players[state.currentPlayerIdx];

  // Stop playback once the song is no longer secret.
  useEffect(() => {
    if (state.phase === 'reveal' || state.phase === 'gameover') audio.pause();
  }, [state.phase, audio]);

  const eligibleChallengers = state.settings.useTokens
    ? state.players.filter((p) => p.id !== activePlayer?.id && p.tokens >= STEAL_COST)
    : [];

  const handleConfirm = () => {
    if (eligibleChallengers.length > 0) setChallenging(true);
    else dispatch({ type: 'CONFIRM_PLACEMENT' });
  };

  const content = () => {
    switch (state.phase) {
      case 'setup':
        return (
          <SetupScreen onStart={(names, settings) => dispatch({ type: 'START_GAME', names, settings })} />
        );

      case 'hidden':
        return (
          <TurnHiddenScreen
            player={activePlayer}
            settings={state.settings}
            audio={audio}
            onContinue={() => dispatch({ type: 'PLAY_CARD' })}
            onSkip={() => dispatch({ type: 'SKIP_SONG' })}
            onFreeCard={() => dispatch({ type: 'FREE_CARD' })}
          />
        );

      case 'placing':
        if (challenging) {
          return (
            <ChallengeScreen
              players={state.players}
              activePlayerId={activePlayer.id}
              onSteal={(playerId, slotIndex) => {
                dispatch({ type: 'STEAL', playerId, slotIndex });
                dispatch({ type: 'CONFIRM_PLACEMENT' });
                setChallenging(false);
              }}
              onSkip={() => {
                dispatch({ type: 'CONFIRM_PLACEMENT' });
                setChallenging(false);
              }}
            />
          );
        }
        return (
          <PlacementScreen
            player={activePlayer}
            settings={state.settings}
            selectedSlot={state.pendingSlot}
            attemptingName={state.attemptingName}
            audio={audio}
            onSelectSlot={(i) => dispatch({ type: 'SET_SLOT', slotIndex: i })}
            onToggleName={() => dispatch({ type: 'TOGGLE_NAME' })}
            onConfirm={handleConfirm}
          />
        );

      case 'reveal':
        return (
          <RevealScreen
            state={state}
            card={state.currentCard!}
            activePlayer={activePlayer}
            onAwardBonus={() => dispatch({ type: 'AWARD_NAME_BONUS' })}
            onNext={() => dispatch({ type: 'NEXT_TURN' })}
          />
        );

      case 'gameover':
        return (
          <GameOverScreen
            players={state.players}
            winnerId={state.winnerId}
            useTokens={state.settings.useTokens}
            onReset={() => dispatch({ type: 'RESET' })}
          />
        );
    }
  };

  const showHeader = state.phase !== 'setup' && state.phase !== 'gameover' && activePlayer;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col">
      {showHeader && (
        <PlayerHeader
          player={activePlayer}
          target={state.settings.targetCards}
          useTokens={state.settings.useTokens}
        />
      )}
      <div className="flex-1">{content()}</div>
    </div>
  );
}

export default App;
