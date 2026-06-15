# World Cup 2026 — Group Stage Bracket

Vite + React + TypeScript app for picking winners across all 72 group-stage matches of the 2026 FIFA World Cup.

## Features

- **48 teams · 12 groups (A–L)** — every group-stage fixture with date, time, and venue
- **Pick winners** — choose home win, tie, or away win for each future match
- **ELO predictions** — win/draw/loss probabilities calculated from official FIFA ELO ratings
- **Live results** — past matches show the actual score, hide ELO predictions, and highlight whether your pick was correct or incorrect
- **Landing page** — shows any live matches plus the next upcoming match(es)
- **Sidebar** — 12-group navigation with green/amber borders showing your pick completion
- **Local time** — all kickoff times displayed in your local timezone
- **Persistence** — picks saved to `localStorage` and survive page reloads
- **Share** — encodes all your picks as a compact base64 string and copies it to your clipboard
- **Clear picks** — two-click confirmation to wipe all picks
- **Responsive** — sidebar collapses below the main content on narrow screens
- **Dark/light** — adapts to your system preference via CSS custom properties

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs at [http://localhost:5173/](http://localhost:5173/).

## Build & Deploy

```bash
npm run build
```

The `prebuild` hook runs `npm run scrape`, which fetches the latest match results from [worldcupstats.football](https://worldcupstats.football/groups/a/) and writes them to `src/data/group-phase-scrape-results.ts`. The build then type-checks with `tsc` and bundles with Vite.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Scrape results, type-check, and build for production |
| `npm run scrape` | Fetch latest match results only |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Data sources

| Data | Source |
|------|--------|
| Fixture schedule | worldcuppass.com |
| Team flags | flagcdn.com |
| ELO ratings | worldfootballrankings.com |
| Match results | worldcupstats.football (scraped per-group at build time) |
| Group/odds data | Local CSV (`data/World Cup 2026 Groups and Odds - Sheet1.csv`) |

## Project structure

```
src/
  components/
    GroupSidebar.tsx    — 12-group nav with pick-completion indicators
    GroupDetail.tsx     — 6-matchup grid for a selected group
    FixtureCard.tsx     — single match card (score, prediction, pick buttons)
  data/
    teams.ts            — CSV parsing, team/group data
    fixtures.ts         — all 72 fixtures with UTC kickoff timestamps
    matchTime.ts        — ET→UTC conversion, status (past/live/future)
    eloRatings.ts       — static ELO ratings & match prediction
    countryCodes.ts     — team→ISO code→flag URL mapping
    useMatchPicks.ts    — React hook for localStorage-backed picks
    pickEncoding.ts     — compact base64 pick encoding for sharing
    matchResults.ts     — accessor for scraped match results
    group-phase-scrape-results.ts — auto-generated results (git-ignored)
scripts/
    scrape-results.ts   — fetches results from worldcupstats.football
```

