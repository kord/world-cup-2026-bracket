# World Cup 2026 Bracket

Vite + React + TypeScript app for the 2026 FIFA World Cup bracket challenge. Pick winners across all 72 group-stage matches, browse the knockout bracket, and compete with friends via shareable leaderboards.

All frontend with persistance only through localstorage. It is easy to share your picks and import others'.

Written with much assistance from Deepseek.

## Features

- **48 teams · 12 groups (A–L)** — all 72 group-stage fixtures with date, time, and venue
- **Group stage picks** — choose home win, draw, or away win for each match
- **Knockout bracket** — full Round of 32 → Final bracket with automatic slot resolution from completed group results
- **Leaderboard** — track your picks against friends; shareable encoded pick URLs
- **Regularly Updated results** — past matches show actual scores, hide predictions, and highlight pick correctness
- **ELO predictions** — win/draw/loss probabilities from official ELO ratings (worldfootballrankings.com)
- **Standings tables** — live group standings with points, GD, GF, GA, and tiebreaker-aware sorting
- **Next matches** — always shows at least 2 upcoming fixtures
- **Sidebar navigation** — 12-group sidebar with colored pick-completion indicators
- **Local time** — all kickoff times displayed in your browser's timezone
- **Persistence** — picks saved to `localStorage` and survive reloads
- **Share picks** — compact base64-encoded pick strings, copy to clipboard or share via URL (`?add=...`)
- **Import friends** — import and manage friends' picks for leaderboard comparison
- **URL deep-linking** — `?view=knockout`, `?view=leaderboard`, `?group=A` for shareable links
- **Dark/light mode** — adapts to system preference via CSS custom properties
- **Responsive** — mobile-friendly with collapsible sidebar

## Knockout phase

The knockout bracket covers all 32 matches from Round of 32 through the Final (match IDs **73–104**). Once the group stage completes, team slots in the R32 are resolved automatically from group standings — winners, runners-up, and the eight best 3rd-place teams populate the bracket. As knockout results come in, later rounds fill in via feed-forward references (`Winner M73`, `Loser M101`, etc.).

### Making knockout picks

Tap the **"KO Picks"** button in the toolbar to open the pick modal. Each match shows the two teams (or placeholders before they're resolved) and you choose a winner by tapping the home or away side. Only one pick per match — no draws in the knockout stage. Picks persist in `localStorage` alongside your group-stage picks and are included when you share via the **Share** feature.

### Viewing the bracket

The bracket view has two modes, toggled in the toolbar:

- **Actual** — shows the real bracket with resolved teams and match results as they come in. Completed matches display scores and highlight the advancing team.
- **Picks** — overlays your knockout picks on the bracket with green (correct) and red (incorrect) color coding for matches that have a result.

### KO Pick Schematic

When viewing a friend's picks in Manage Friends, you can open their **KO Pick Schematic** — a compact column layout showing their predicted winner for every knockout match. Each picked cell is subtly styled:
- **Green border** — pick was correct
- **Red border** — pick was wrong
- **No color** — match not yet played
- **Golden gradient** — the Final (always highlighted)

### Entering results

Knockout results don't have an automatic scraper yet. Instead, edit `src/data/manual-knockout-results.ts` and fill in each match as it finishes:

```ts
// #76 · Mon, Jun 29 · NRG Stadium
// Home: Brazil  ·  Away: Japan
76: { result: "home", homeScore: 2, awayScore: 1 },
```

Set `result` to `"home"` or `"away"` depending on who won. The file includes commented-out placeholders for all 32 matches with home/away annotations so you can quickly uncomment and fill scores.

### How resolution works

`knockoutResolver.ts` combines group standings (from `standings.ts`) with the best 3rd-place allocation (from `bestThirds.ts`) to resolve placeholder names like `Winner E` or `Best 3rd (A/B/C/D/F)` into actual team names. Feed-forward slots like `Winner M74` resolve recursively by following the bracket chain through completed results. The resolver handles all FIFA tiebreaker rules (points → goal difference → goals for → head-to-head).

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs at [http://localhost:5173/](http://localhost:5173/).

## Build & Deploy

```bash
npm run build   # scrape results → type-check → Vite build
npm run deploy  # build → Firebase deploy
```

The `prebuild` hook scrapes the latest match results from [worldcupstats.football](https://worldcupstats.football/) and writes them to `src/data/group-phase-scrape-results.ts`. When all 72 results are present and the group stage ended >24 hours ago, scraping is skipped automatically.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Scrape results, type-check, production build |
| `npm run scrape` | Fetch latest match results only |
| `npm run deploy` | Build and deploy to Firebase |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Data sources

| Data | Source |
|------|--------|
| Fixture schedule | worldcuppass.com |
| Knockout fixtures | worldcupwiki.com/schedule/ |
| Team flags | flagcdn.com |
| ELO ratings | worldfootballrankings.com |
| Match results | worldcupstats.football (scraped per-group at build time) |
| Group/odds data | Local CSV (`data/`) |

## Project structure

```
src/
  App.tsx                         — root component, view routing, URL sync
  types.ts                        — shared TypeScript types
  components/
    FixtureCard.tsx               — single match card (score, prediction, pick buttons, friend picks)
    GroupDetail.tsx               — 6-matchup grid + standings table for a selected group
    GroupSidebar.tsx              — 12-group navigation with pick-completion indicators
    GroupTable.tsx                — group summary with odds
    ImportPicks.tsx               — import friend picks UI
    KnockoutBracket.tsx           — full knockout bracket (R32 → Final) with resolved team slots
    Leaderboard.tsx               — side-by-side pick comparison with friends
    ManageFriends.tsx             — add/remove friend picks
    NextMatches.tsx               — live + upcoming match cards on landing page
    SharePicks.tsx                — share your encoded picks
    Toolbar.tsx                   — view toggle, clear picks, manage friends
  data/
    constants.ts                  — shared constants (RESULT_DELAY_MS)
    countryCodes.ts               — team name → ISO code → flag URL (flagcdn.com)
    eloRatings.ts                 — ELO ratings & match outcome prediction
    fixtures.ts                   — all 72 group-stage fixtures with UTC kickoffs
    group-phase-scrape-results.ts — auto-generated match results (git-ignored)
    knockoutFixtures.ts           — all 32 knockout fixtures (R32 → Final)
    knockoutResolver.ts           — resolves knockout slots from group standings + tiebreakers
    matchResults.ts               — result accessor + pick correctness checker
    matchTime.ts                  — ET → UTC conversion, match status (past/live/future)
    pickEncoding.ts               — compact base64 pick encoding/decoding for sharing
    standings.ts                  — live group standings from scraped results
    teams.ts                      — CSV parsing, team/group data
    useImportedPicks.ts           — React hook for localStorage-backed imported picks
    useMatchPicks.ts              — React hook for localStorage-backed user picks
  css/
    bracket.css                   — knockout bracket styling
    content.css                   — main content area
    layout.css                    — app shell, header, toolbar
    matchup.css                   — match cards, flags, pick buttons
    modals.css                    — manage friends modal
    responsive.css                — mobile breakpoints
    sidebar.css                   — group sidebar + mobile dropdown
    standings.css                 — standings table
  assets/
scripts/
    scrape-results.ts             — fetches live results from worldcupstats.football
    scrape-elo.ts                 — fetches ELO ratings from worldfootballrankings.com
```

