# Hitster (card-free)

A digital, pass-and-play version of the music timeline game **Hitster** — no physical QR cards
required. Hear a hidden 30-second clip and place it on your timeline by release year; closest
chronological order wins.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit + smoke tests
npm run build    # type-check + production build
```

Open the dev URL on a phone or laptop and pass the single device around as you play.

## How it works

- **One device, pass-and-play.** A "pass the device to X" curtain keeps the next player from seeing
  the previous turn. The active player (the "DJ") only ever sees a face-down mystery card.
- **Music.** 30-second previews come from the public **iTunes Search API** (free, no auth). Preview
  URLs are cached in `localStorage`. The gameplay-critical **release year is hand-verified** in
  [`src/data/songs.ts`](src/data/songs.ts) — iTunes' own date field is unreliable and is not used.
- **HITSTER tokens** (toggleable): start with 2, cap at 5. Earn one by naming the title **and**
  artist; spend 1 to *Skip*, 1 to *Steal* a misplacement, or 3 for a *Free card*.
- **Winning:** first to the target timeline length (5 / 8 / 10 cards).

## Structure

| Path | Role |
| --- | --- |
| [`src/state/gameReducer.ts`](src/state/gameReducer.ts) | Pure game logic + `isPlacementCorrect` scoring |
| [`src/state/gameTypes.ts`](src/state/gameTypes.ts) | Domain types & rule constants |
| [`src/services/audioSource.ts`](src/services/audioSource.ts) | iTunes preview lookup + cache |
| [`src/hooks/useAudioPreview.ts`](src/hooks/useAudioPreview.ts) | 30s `<audio>` controller |
| [`src/screens/`](src/screens/) | Setup, Hidden, Placement, Challenge, Reveal, Game-over |
| [`src/components/`](src/components/) | Timeline, cards, header, buttons |

## Tests

- `gameReducer.test.ts` — exhaustive coverage of `isPlacementCorrect` (boundaries, ties, ends).
- `App.smoke.test.tsx` — drives a full turn end-to-end (setup → hidden → place → challenge →
  reveal → next turn) and the token-skip flow.

## Not yet built (future work)

Spotify Premium full tracks, multi-device play over a server, gyro "flip to play", larger/themed
decks, dedicated teams UI.
