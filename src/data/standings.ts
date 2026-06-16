import { groupPhaseScrapeResults } from "./group-phase-scrape-results";
import { getAllFixtures } from "./fixtures";

export interface TeamStanding {
    team: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDiff: number;
    points: number;
}

/** Calculate standings for all groups from scraped results + fixture data */
export function getStandings(): Record<string, TeamStanding[]> {
    const allFixtures = getAllFixtures();
    const groups: Record<string, Record<string, TeamStanding>> = {};

    // Initialize standings for all teams in fixtures
    for (const f of allFixtures) {
        if (!groups[f.group]) groups[f.group] = {};
        for (const team of [f.home, f.away]) {
            if (!groups[f.group][team]) {
                groups[f.group][team] = {
                    team,
                    played: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goalsFor: 0,
                    goalsAgainst: 0,
                    goalDiff: 0,
                    points: 0,
                };
            }
        }
    }

    // Apply results
    for (const f of allFixtures) {
        const result = groupPhaseScrapeResults[f.id];
        if (!result) continue;

        const home = groups[f.group]?.[f.home];
        const away = groups[f.group]?.[f.away];
        if (!home || !away) continue;

        home.played++;
        away.played++;
        home.goalsFor += result.homeScore;
        home.goalsAgainst += result.awayScore;
        away.goalsFor += result.awayScore;
        away.goalsAgainst += result.homeScore;

        if (result.result === "home") {
            home.wins++;
            home.points += 3;
            away.losses++;
        } else if (result.result === "away") {
            away.wins++;
            away.points += 3;
            home.losses++;
        } else {
            home.draws++;
            away.draws++;
            home.points++;
            away.points++;
        }
    }

    // Calculate goal diff and sort
    const standings: Record<string, TeamStanding[]> = {};
    for (const [group, teams] of Object.entries(groups)) {
        const list = Object.values(teams);
        for (const t of list) {
            t.goalDiff = t.goalsFor - t.goalsAgainst;
        }
        list.sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
        standings[group] = list;
    }

    return standings;
}
