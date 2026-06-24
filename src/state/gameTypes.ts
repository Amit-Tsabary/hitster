// Core domain types for the game.

/** A single song / music card. `year` is the hand-verified original release year. */
export interface Song {
  id: string;
  title: string;
  artist: string;
  year: number;
}

/** A player (or team) with their timeline and token bank. */
export interface Player {
  id: string;
  name: string;
  /** Cards won so far, always kept sorted ascending by year. */
  timeline: Song[];
  tokens: number;
}

/** Phases of a single turn / the overall game. */
export type Phase =
  | 'setup'
  | 'hidden' // active player hears the mystery song; info concealed
  | 'placing' // active player chooses a slot on their timeline
  | 'reveal' // card flipped, result resolved
  | 'gameover';

export interface Settings {
  useTokens: boolean;
  startingTokens: number;
  /** Timeline length needed to win. */
  targetCards: number;
}

/** A challenger who stole the placement opportunity for the current card. */
export interface Steal {
  playerId: string;
  slotIndex: number;
}

export interface GameState {
  players: Player[];
  /** Shuffled song ids forming the draw pile. */
  deck: string[];
  /** Index of the next card to draw from `deck`. */
  drawIndex: number;
  currentPlayerIdx: number;
  phase: Phase;
  /** The mystery card currently in play (null during setup/gameover). */
  currentCard: Song | null;
  /** Slot the active player tentatively chose (set during `placing`). */
  pendingSlot: number | null;
  /** Whether the active player opted to name title+artist for a bonus token. */
  attemptingName: boolean;
  /** A steal by another player, if any. */
  steal: Steal | null;
  settings: Settings;
  winnerId: string | null;
  /** Whether the active player's placement (shown on reveal) was correct. */
  lastPlacementCorrect: boolean | null;
  /** Which player actually received the card this turn (active player, a thief, or null). */
  lastCardWinnerId: string | null;
}

export const MAX_TOKENS = 5;
export const STEAL_COST = 1;
export const SKIP_COST = 1;
export const FREE_CARD_COST = 3;
export const NAME_BONUS = 1;
