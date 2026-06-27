import type { GameState, Player, Settings, Song } from './gameTypes';
import { FREE_CARD_COST, MAX_TOKENS, NAME_BONUS, SKIP_COST, STEAL_COST } from './gameTypes';
import { findSong, getDeckSongs } from '../data/decks';

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Fisher–Yates shuffle returning a new array. */
export function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Insert a song into a timeline at the given slot, keeping it sorted ascending by year. */
export function insertSorted(timeline: Song[], song: Song): Song[] {
  const next = [...timeline, song];
  next.sort((a, b) => a.year - b.year);
  return next;
}

/**
 * Is placing a card of `year` at `slotIndex` chronologically correct?
 * Timeline is sorted ascending. Slot i sits between card[i-1] and card[i]
 * (slot 0 = before all, slot n = after all). Ties at a boundary count as correct.
 */
export function isPlacementCorrect(timeline: Song[], slotIndex: number, year: number): boolean {
  const leftOk = slotIndex === 0 || timeline[slotIndex - 1].year <= year;
  const rightOk = slotIndex === timeline.length || year <= timeline[slotIndex].year;
  return leftOk && rightOk;
}

/** Add tokens to a player without exceeding the cap. */
function addTokens(p: Player, n: number): Player {
  return { ...p, tokens: Math.min(MAX_TOKENS, p.tokens + n) };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type Action =
  | { type: 'START_GAME'; names: string[]; settings: Settings }
  | { type: 'PLAY_CARD' } // hidden -> placing
  | { type: 'SET_SLOT'; slotIndex: number }
  | { type: 'TOGGLE_NAME' }
  | { type: 'STEAL'; playerId: string; slotIndex: number }
  | { type: 'CONFIRM_PLACEMENT' } // placing -> reveal
  | { type: 'AWARD_NAME_BONUS' } // self-reported correct title+artist
  | { type: 'NEXT_TURN' } // reveal -> hidden (or gameover)
  | { type: 'SKIP_SONG' }
  | { type: 'REPLACE_CARD' } // auto-skip a card whose preview can't be loaded (free)
  | { type: 'FREE_CARD' }
  | { type: 'RESET' };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const initialState: GameState = {
  players: [],
  deck: [],
  drawIndex: 0,
  currentPlayerIdx: 0,
  phase: 'setup',
  currentCard: null,
  pendingSlot: null,
  attemptingName: false,
  steal: null,
  settings: { useTokens: true, startingTokens: 2, targetCards: 10, deck: 'regular' },
  winnerId: null,
  lastPlacementCorrect: null,
  lastCardWinnerId: null,
};

/** Draw the next playable card from the deck, returning it plus the advanced index. */
function drawCard(deck: string[], from: number): { card: Song | null; nextIndex: number } {
  if (from >= deck.length) return { card: null, nextIndex: from };
  return { card: findSong(deck[from]), nextIndex: from + 1 };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const deck = shuffle(getDeckSongs(action.settings.deck).map((s) => s.id));
      let idx = 0;
      // Deal one starting card per player.
      const players: Player[] = action.names.map((name, i) => {
        const start = findSong(deck[idx++]);
        return {
          id: `p${i}`,
          name: name.trim() || `Player ${i + 1}`,
          timeline: [start],
          tokens: action.settings.useTokens ? action.settings.startingTokens : 0,
        };
      });
      // Player with the oldest starting song goes first.
      let startIdx = 0;
      players.forEach((p, i) => {
        if (p.timeline[0].year < players[startIdx].timeline[0].year) startIdx = i;
      });
      const { card, nextIndex } = drawCard(deck, idx);
      return {
        ...initialState,
        players,
        deck,
        drawIndex: nextIndex,
        currentPlayerIdx: startIdx,
        phase: 'hidden',
        currentCard: card,
        settings: action.settings,
      };
    }

    case 'PLAY_CARD':
      return { ...state, phase: 'placing', pendingSlot: null, attemptingName: false, steal: null };

    case 'SET_SLOT':
      return { ...state, pendingSlot: action.slotIndex };

    case 'TOGGLE_NAME':
      return { ...state, attemptingName: !state.attemptingName };

    case 'STEAL': {
      if (!state.settings.useTokens) return state;
      const idx = state.players.findIndex((p) => p.id === action.playerId);
      if (idx < 0 || state.players[idx].tokens < STEAL_COST) return state;
      const players = state.players.map((p, i) =>
        i === idx ? { ...p, tokens: p.tokens - STEAL_COST } : p,
      );
      return { ...state, players, steal: { playerId: action.playerId, slotIndex: action.slotIndex } };
    }

    case 'CONFIRM_PLACEMENT': {
      if (state.currentCard === null || state.pendingSlot === null) return state;
      const card = state.currentCard;
      const active = state.players[state.currentPlayerIdx];
      const activeCorrect = isPlacementCorrect(active.timeline, state.pendingSlot, card.year);

      let players = state.players;
      // Resolve steal first: a correct challenger takes the card.
      // A challenge is a *disagreement* with the active player's placement, so it is judged
      // against the ACTIVE player's timeline (not the challenger's own, unrelated cards) and
      // the challenger must pick a different slot than the active player did.
      if (state.steal && state.steal.slotIndex !== state.pendingSlot) {
        const chIdx = state.players.findIndex((p) => p.id === state.steal!.playerId);
        const challenger = state.players[chIdx];
        const stealCorrect = isPlacementCorrect(active.timeline, state.steal.slotIndex, card.year);
        if (stealCorrect) {
          players = players.map((p, i) =>
            i === chIdx ? { ...p, timeline: insertSorted(p.timeline, card) } : p,
          );
          return {
            ...state,
            players,
            phase: 'reveal',
            lastPlacementCorrect: activeCorrect,
            lastCardWinnerId: challenger.id,
          };
        }
      }
      // No (successful) steal: active player keeps the card iff correct.
      if (activeCorrect) {
        players = players.map((p, i) =>
          i === state.currentPlayerIdx ? { ...p, timeline: insertSorted(p.timeline, card) } : p,
        );
      }
      return {
        ...state,
        players,
        phase: 'reveal',
        lastPlacementCorrect: activeCorrect,
        lastCardWinnerId: activeCorrect ? active.id : null,
      };
    }

    case 'AWARD_NAME_BONUS': {
      if (!state.settings.useTokens) return state;
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIdx ? addTokens(p, NAME_BONUS) : p,
      );
      return { ...state, players, attemptingName: false };
    }

    case 'NEXT_TURN': {
      // Win check: did anyone reach the target?
      const winner = state.players.find((p) => p.timeline.length >= state.settings.targetCards);
      if (winner) return { ...state, phase: 'gameover', winnerId: winner.id };

      const nextPlayer = (state.currentPlayerIdx + 1) % state.players.length;
      const { card, nextIndex } = drawCard(state.deck, state.drawIndex);
      if (card === null) {
        // Deck exhausted: whoever has the most cards wins.
        const top = [...state.players].sort((a, b) => b.timeline.length - a.timeline.length)[0];
        return { ...state, phase: 'gameover', winnerId: top.id };
      }
      return {
        ...state,
        currentPlayerIdx: nextPlayer,
        phase: 'hidden',
        currentCard: card,
        drawIndex: nextIndex,
        pendingSlot: null,
        attemptingName: false,
        steal: null,
        lastPlacementCorrect: null,
        lastCardWinnerId: null,
      };
    }

    case 'SKIP_SONG': {
      const active = state.players[state.currentPlayerIdx];
      if (!state.settings.useTokens || active.tokens < SKIP_COST) return state;
      const { card, nextIndex } = drawCard(state.deck, state.drawIndex);
      if (card === null) return state;
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIdx ? { ...p, tokens: p.tokens - SKIP_COST } : p,
      );
      return { ...state, players, currentCard: card, drawIndex: nextIndex };
    }

    case 'REPLACE_CARD': {
      // The current card's preview couldn't be resolved (no baked URL and the live lookup
      // missed), so swap in the next card before the player places it. Free and unconditional,
      // unlike SKIP_SONG — the player did nothing wrong. Only valid while the song is still hidden.
      if (state.phase !== 'hidden') return state;
      const { card, nextIndex } = drawCard(state.deck, state.drawIndex);
      if (card === null) {
        // Deck exhausted while searching for a playable song: end as in NEXT_TURN.
        const top = [...state.players].sort((a, b) => b.timeline.length - a.timeline.length)[0];
        return { ...state, phase: 'gameover', winnerId: top.id };
      }
      return { ...state, currentCard: card, drawIndex: nextIndex };
    }

    case 'FREE_CARD': {
      const active = state.players[state.currentPlayerIdx];
      if (!state.settings.useTokens || active.tokens < FREE_CARD_COST || state.currentCard === null)
        return state;
      // Pay 3 tokens, keep the current card with no guessing, then go straight to reveal.
      const card = state.currentCard;
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIdx
          ? { ...p, tokens: p.tokens - FREE_CARD_COST, timeline: insertSorted(p.timeline, card) }
          : p,
      );
      return {
        ...state,
        players,
        phase: 'reveal',
        lastPlacementCorrect: true,
        lastCardWinnerId: active.id,
        pendingSlot: null,
      };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}
