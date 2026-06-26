import { useEffect, useReducer, useState } from 'react';
import { motion } from 'framer-motion';
import { gameReducer, initialState } from './state/gameReducer';
import { STEAL_COST } from './state/gameTypes';
import { useAudioPreview } from './hooks/useAudioPreview';
import { AmbientBackground } from './components/AmbientBackground';
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

  // Auto-skip a card whose preview can't be loaded: previews now resolve on demand, so an
  // occasional song has no playable URL. Rather than strand the player, draw the next card.
  // The cascade repeats until a playable song is found (or the deck runs out).
  useEffect(() => {
    if (state.phase === 'hidden' && audio.status === 'unavailable') {
      dispatch({ type: 'REPLACE_CARD' });
    }
  }, [state.phase, audio.status]);

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
  // Distinct key per visible screen so the cross-fade fires on every transition (incl. the
  // challenge sub-screen, which shares the 'placing' phase).
  const screenKey = state.phase === 'placing' && challenging ? 'challenge' : state.phase;

  return (
    <>
      <AmbientBackground />
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col">
        {showHeader && (
          <PlayerHeader
            player={activePlayer}
            target={state.settings.targetCards}
            useTokens={state.settings.useTokens}
          />
        )}
        <div className="flex-1">
          {/* Keyed so each new screen fades + slides in on every transition. Enter-only (no
              AnimatePresence exit) keeps the previous screen from lingering in the DOM. */}
          <motion.div
            key={screenKey}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="min-h-full"
          >
            {content()}
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default App;
