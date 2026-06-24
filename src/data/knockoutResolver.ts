/**
 * Knockout slot resolver.
 *
 * Determines which teams are locked into knockout positions (winner, runner-up,
 * 3rd place) based on completed group-stage results, using the official FIFA
 * tie-breaking criteria.
 * 
 * Resolution logic from https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/groups-how-teams-qualify-tie-breakers
 */
import { getStandings, type TeamStanding } from "./standings";
import { getAllFixtures } from "./fixtures";
import type { MatchFixture } from "../types";
import { groupPhaseScrapeResults } from "./group-phase-scrape-results";

// ── Types ───────────────────────────────────────────────────────────────────

export type GroupPosition = "winner" | "runner-up" | "third" | "fourth";

export interface ResolvedGroup {
    group: string;
    winner: string | null;
    runnerUp: string | null;
    third: string | null;
    fourth: string | null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Remaining (unplayed) fixtures for a group, sorted by kickoff */
function getRemainingFixtures(group: string): MatchFixture[] {
    return getAllFixtures()
        .filter(f => f.group === group && !groupPhaseScrapeResults[f.id])
        .sort((a, b) => a.kickoff - b.kickoff);
}

/**
 * Apply tiebreakers to sort standings.
 * Rules: 1) points, 2) goal diff, 3) goals for, 4) H2H points,
 *        5) H2H goal diff, 6) H2H goals for, 7) fair play.
 * We implement 1-6 (fair play data isn't available).
 */
function sortByTiebreakers(standings: TeamStanding[], group: string): TeamStanding[] {
    // Build H2H lookup from completed results
    const fixtures = getAllFixtures().filter(f => f.group === group);
    const h2hCache = new Map<string, { pts: number; gd: number; gf: number }>();
    const getH2H = (a: string, b: string) => {
        const key = [a, b].sort().join("|");
        if (h2hCache.has(key)) return h2hCache.get(key)!;
        const result: { pts: number; gd: number; gf: number } = { pts: 0, gd: 0, gf: 0 };
        for (const f of fixtures) {
            const r = groupPhaseScrapeResults[f.id];
            if (!r) continue;
            const teams = [f.home, f.away].sort();
            if (teams[0] === (key.split("|")[0]) && teams[1] === (key.split("|")[1])) {
                if (f.home === a) {
                    result.gf += r.homeScore;
                    result.gd += r.homeScore - r.awayScore;
                    if (r.result === "home") result.pts += 3;
                    else if (r.result === "draw") result.pts += 1;
                } else {
                    result.gf += r.awayScore;
                    result.gd += r.awayScore - r.homeScore;
                    if (r.result === "away") result.pts += 3;
                    else if (r.result === "draw") result.pts += 1;
                }
            }
        }
        h2hCache.set(key, result);
        return result;
    };

    return [...standings].sort((a, b) => {
        // 1. Points
        if (a.points !== b.points) return b.points - a.points;
        // 2. Goal difference
        if (a.goalDiff !== b.goalDiff) return b.goalDiff - a.goalDiff;
        // 3. Goals for
        if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
        // 4-6. Head-to-head
        const h2h = getH2H(a.team, b.team);
        const aH2HPts = a.team < b.team ? h2h.pts : (h2h.pts === 3 ? 0 : h2h.pts === 0 ? 3 : h2h.pts);
        const bH2HPts = b.team < a.team ? h2h.pts : (h2h.pts === 3 ? 0 : h2h.pts === 0 ? 3 : h2h.pts);
        if (aH2HPts !== bH2HPts) return bH2HPts - aH2HPts;
        if (h2h.gd !== 0) {
            const aH2HGD = a.team < b.team ? h2h.gd : -h2h.gd;
            return aH2HGD > 0 ? -1 : 1;
        }
        if (h2h.gf !== 0) {
            const aH2HGF = a.team < b.team ? h2h.gf : 0;
            const bH2HGF = b.team < a.team ? h2h.gf : 0;
            return bH2HGF - aH2HGF;
        }
        return 0;
    });
}

// ── Scenario enumeration ────────────────────────────────────────────────────

type Outcome = "home" | "draw" | "away";

interface Scenario {
    outcomes: Map<number, Outcome>; // fixture id → outcome
}

/** Enumerate all possible outcomes for a set of remaining fixtures */
function enumerateScenarios(fixtures: MatchFixture[]): Scenario[] {
    if (fixtures.length === 0) return [{ outcomes: new Map() }];

    const outcomes: Outcome[] = ["home", "draw", "away"];
    const rest = fixtures.slice(1);
    const suffixes = enumerateScenarios(rest);

    const result: Scenario[] = [];
    for (const outcome of outcomes) {
        for (const suffix of suffixes) {
            const map = new Map(suffix.outcomes);
            map.set(fixtures[0].id, outcome);
            result.push({ outcomes: map });
        }
    }
    return result;
}

/** Apply a scenario's outcomes to a copy of the current standings */
function applyScenario(
    baseStandings: TeamStanding[],
    scenarios: Scenario[],
    group: string,
): TeamStanding[][] {
    const fixtures = getAllFixtures().filter(f => f.group === group);

    return scenarios.map(scenario => {
        // Clone standings
        const teams = new Map<string, TeamStanding>();
        for (const s of baseStandings) {
            teams.set(s.team, { ...s });
        }

        // Apply each fixture result
        for (const f of fixtures) {
            const result = groupPhaseScrapeResults[f.id];
            const outcome = result ? result.result : scenario.outcomes.get(f.id);
            if (!outcome) continue;

            const home = teams.get(f.home);
            const away = teams.get(f.away);
            if (!home || !away) continue;

            // Determine score for tiebreaker purposes (1-0 for simplicity)
            let homeGoals: number, awayGoals: number;
            if (result) {
                homeGoals = result.homeScore;
                awayGoals = result.awayScore;
            } else if (outcome === "home") {
                homeGoals = 1; awayGoals = 0;
            } else if (outcome === "away") {
                homeGoals = 0; awayGoals = 1;
            } else {
                homeGoals = 1; awayGoals = 1;
            }

            // If fixture already played, don't double-count
            if (!result) {
                home.played++;
                away.played++;
                home.goalsFor += homeGoals;
                home.goalsAgainst += awayGoals;
                away.goalsFor += awayGoals;
                away.goalsAgainst += homeGoals;
                home.goalDiff = home.goalsFor - home.goalsAgainst;
                away.goalDiff = away.goalsFor - away.goalsAgainst;

                if (outcome === "home") {
                    home.wins++; home.points += 3; away.losses++;
                } else if (outcome === "away") {
                    away.wins++; away.points += 3; home.losses++;
                } else {
                    home.draws++; away.draws++; home.points++; away.points++;
                }
            }
        }

        return sortByTiebreakers([...teams.values()], group);
    });
}

// ── Resolver ────────────────────────────────────────────────────────────────

/**
 * Resolve the locked positions for a single group.
 * Returns null for positions that aren't yet locked.
 */
function resolveGroup(standings: TeamStanding[], group: string): ResolvedGroup {
    const remaining = getRemainingFixtures(group);

    // All matches played: positions are fully determined
    if (remaining.length === 0) {
        const sorted = sortByTiebreakers(standings, group);
        return {
            group,
            winner: sorted[0]?.team ?? null,
            runnerUp: sorted[1]?.team ?? null,
            third: sorted[2]?.team ?? null,
            fourth: sorted[3]?.team ?? null,
        };
    }

    // Enumerate remaining scenarios
    const scenarios = enumerateScenarios(remaining);
    const allOutcomes = applyScenario(standings, scenarios, group);

    // Find the set of teams that appear at each position across all scenarios
    const positionTeams: Array<Set<string>> = [
        new Set(), new Set(), new Set(), new Set(),
    ];
    for (const outcome of allOutcomes) {
        for (let i = 0; i < outcome.length && i < 4; i++) {
            positionTeams[i].add(outcome[i].team);
        }
    }

    return {
        group,
        winner: positionTeams[0].size === 1 ? [...positionTeams[0]][0] : null,
        runnerUp: positionTeams[1].size === 1 ? [...positionTeams[1]][0] : null,
        third: positionTeams[2].size === 1 ? [...positionTeams[2]][0] : null,
        fourth: positionTeams[3].size === 1 ? [...positionTeams[3]][0] : null,
    };
}

/** Resolve all 12 groups */
export function resolveAllGroups(): Record<string, ResolvedGroup> {
    const allStandings = getStandings();
    const result: Record<string, ResolvedGroup> = {};
    for (const [group, standings] of Object.entries(allStandings)) {
        result[group] = resolveGroup(standings, group);
    }
    return result;
}

/**
 * Try to resolve a knockout placeholder string to an actual team name.
 * Handles: "Winner A", "Runner-up B", "3rd (A/B/C)" etc.
 * Returns null if the slot isn't yet determined.
 */
export function resolveSlot(placeholder: string): string | null {
    const groups = resolveAllGroups();

    // "Winner X"
    let m = placeholder.match(/^Winner ([A-L])$/);
    if (m) return groups[m[1]]?.winner ?? null;

    // "Runner-up X"
    m = placeholder.match(/^Runner-up ([A-L])$/);
    if (m) return groups[m[1]]?.runnerUp ?? null;

    // "Best 3rd (A/B/C/D/F)" etc. — never resolve until all groups are complete
    if (/^Best 3rd \(/.test(placeholder)) return null;

    // "Winner M74" etc. (feed-forward matches) — can't resolve yet
    if (/^(Winner|Loser) M\d+$/i.test(placeholder)) return null;

    return null;
}

/**
 * Resolve both home and away slots for a knockout fixture.
 */
export function resolveFixture(home: string, away: string): { home: string; away: string } {
    return {
        home: resolveSlot(home) ?? home,
        away: resolveSlot(away) ?? away,
    };
}
