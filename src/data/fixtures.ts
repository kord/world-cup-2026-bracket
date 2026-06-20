import type { MatchFixture } from "../types";
import { getMatchTimeInfo, etToUtcMs } from "./matchTime";

/**
 * The website uses slightly different team names than our CSV.
 * This map normalizes them to our canonical names.
 */
const NAME_NORMALIZE: Record<string, string> = {
    "Korea Republic": "South Korea",
    "Türkiye": "Turkey",
    "DR Congo": "Congo DR",
    "Curaçao": "Curacao",
};

function norm(name: string): string {
    return NAME_NORMALIZE[name] ?? name;
}

/** All 72 group-stage fixtures, parsed from worldcuppass.com */
const _FIXTURES: Omit<MatchFixture, "id" | "kickoff">[] = [
    // Group A
    { date: "Thu, Jun 11", time: "3:00 PM", home: "Mexico", away: "South Africa", venue: "Estadio Azteca, Mexico City", group: "A" },
    { date: "Thu, Jun 11", time: "10:00 PM", home: "Korea Republic", away: "Czechia", venue: "Estadio Akron, Guadalajara", group: "A" },
    { date: "Thu, Jun 18", time: "12:00 PM", home: "Czechia", away: "South Africa", venue: "Mercedes-Benz Stadium, Atlanta", group: "A" },
    { date: "Thu, Jun 18", time: "9:00 PM", home: "Mexico", away: "Korea Republic", venue: "Estadio Akron, Guadalajara", group: "A" },
    { date: "Wed, Jun 24", time: "9:00 PM", home: "Czechia", away: "Mexico", venue: "Estadio Azteca, Mexico City", group: "A" },
    { date: "Wed, Jun 24", time: "9:00 PM", home: "South Africa", away: "Korea Republic", venue: "Estadio BBVA, Monterrey", group: "A" },

    // Group B
    { date: "Fri, Jun 12", time: "3:00 PM", home: "Canada", away: "Bosnia and Herzegovina", venue: "BMO Field, Toronto", group: "B" },
    { date: "Sat, Jun 13", time: "3:00 PM", home: "Qatar", away: "Switzerland", venue: "Levi's Stadium, Santa Clara", group: "B" },
    { date: "Thu, Jun 18", time: "3:00 PM", home: "Switzerland", away: "Bosnia and Herzegovina", venue: "SoFi Stadium, Inglewood", group: "B" },
    { date: "Thu, Jun 18", time: "6:00 PM", home: "Canada", away: "Qatar", venue: "BC Place, Vancouver", group: "B" },
    { date: "Wed, Jun 24", time: "3:00 PM", home: "Switzerland", away: "Canada", venue: "BC Place, Vancouver", group: "B" },
    { date: "Wed, Jun 24", time: "3:00 PM", home: "Bosnia and Herzegovina", away: "Qatar", venue: "Lumen Field, Seattle", group: "B" },

    // Group C
    { date: "Sat, Jun 13", time: "6:00 PM", home: "Brazil", away: "Morocco", venue: "MetLife Stadium, East Rutherford", group: "C" },
    { date: "Sat, Jun 13", time: "9:00 PM", home: "Haiti", away: "Scotland", venue: "Gillette Stadium, Foxboro", group: "C" },
    { date: "Fri, Jun 19", time: "6:00 PM", home: "Scotland", away: "Morocco", venue: "Gillette Stadium, Foxboro", group: "C" },
    { date: "Fri, Jun 19", time: "8:30 PM", home: "Brazil", away: "Haiti", venue: "Lincoln Financial Field, Philadelphia", group: "C" },
    { date: "Wed, Jun 24", time: "6:00 PM", home: "Scotland", away: "Brazil", venue: "Hard Rock Stadium, Miami", group: "C" },
    { date: "Wed, Jun 24", time: "6:00 PM", home: "Morocco", away: "Haiti", venue: "Mercedes-Benz Stadium, Atlanta", group: "C" },

    // Group D
    { date: "Fri, Jun 12", time: "9:00 PM", home: "United States", away: "Paraguay", venue: "SoFi Stadium, Inglewood", group: "D" },
    { date: "Sat, Jun 13", time: "12:00 AM", home: "Australia", away: "Türkiye", venue: "BC Place, Vancouver", group: "D" },
    { date: "Fri, Jun 19", time: "3:00 PM", home: "United States", away: "Australia", venue: "Lumen Field, Seattle", group: "D" },
    { date: "Fri, Jun 19", time: "11:00 PM", home: "Türkiye", away: "Paraguay", venue: "Levi's Stadium, Santa Clara", group: "D" },
    { date: "Thu, Jun 25", time: "10:00 PM", home: "Türkiye", away: "United States", venue: "SoFi Stadium, Inglewood", group: "D" },
    { date: "Thu, Jun 25", time: "10:00 PM", home: "Paraguay", away: "Australia", venue: "Levi's Stadium, Santa Clara", group: "D" },

    // Group E
    { date: "Sun, Jun 14", time: "1:00 PM", home: "Germany", away: "Curaçao", venue: "NRG Stadium, Houston", group: "E" },
    { date: "Sun, Jun 14", time: "7:00 PM", home: "Ivory Coast", away: "Ecuador", venue: "Lincoln Financial Field, Philadelphia", group: "E" },
    { date: "Sat, Jun 20", time: "4:00 PM", home: "Germany", away: "Ivory Coast", venue: "BMO Field, Toronto", group: "E" },
    { date: "Sat, Jun 20", time: "8:00 PM", home: "Ecuador", away: "Curaçao", venue: "Arrowhead Stadium, Kansas City", group: "E" },
    { date: "Thu, Jun 25", time: "4:00 PM", home: "Curaçao", away: "Ivory Coast", venue: "Lincoln Financial Field, Philadelphia", group: "E" },
    { date: "Thu, Jun 25", time: "4:00 PM", home: "Ecuador", away: "Germany", venue: "MetLife Stadium, East Rutherford", group: "E" },

    // Group F
    { date: "Sun, Jun 14", time: "4:00 PM", home: "Netherlands", away: "Japan", venue: "AT&T Stadium, Arlington", group: "F" },
    { date: "Sun, Jun 14", time: "10:00 PM", home: "Sweden", away: "Tunisia", venue: "Estadio BBVA, Monterrey", group: "F" },
    { date: "Sat, Jun 20", time: "1:00 PM", home: "Netherlands", away: "Sweden", venue: "NRG Stadium, Houston", group: "F" },
    { date: "Sat, Jun 21", time: "12:00 AM", home: "Tunisia", away: "Japan", venue: "Estadio BBVA, Monterrey", group: "F" },
    { date: "Thu, Jun 25", time: "7:00 PM", home: "Japan", away: "Sweden", venue: "AT&T Stadium, Arlington", group: "F" },
    { date: "Thu, Jun 25", time: "7:00 PM", home: "Tunisia", away: "Netherlands", venue: "Arrowhead Stadium, Kansas City", group: "F" },

    // Group G
    { date: "Mon, Jun 15", time: "3:00 PM", home: "Belgium", away: "Egypt", venue: "Lumen Field, Seattle", group: "G" },
    { date: "Mon, Jun 15", time: "9:00 PM", home: "Iran", away: "New Zealand", venue: "SoFi Stadium, Inglewood", group: "G" },
    { date: "Sun, Jun 21", time: "3:00 PM", home: "Belgium", away: "Iran", venue: "SoFi Stadium, Inglewood", group: "G" },
    { date: "Sun, Jun 21", time: "9:00 PM", home: "New Zealand", away: "Egypt", venue: "BC Place, Vancouver", group: "G" },
    { date: "Fri, Jun 26", time: "11:00 PM", home: "Egypt", away: "Iran", venue: "Lumen Field, Seattle", group: "G" },
    { date: "Fri, Jun 26", time: "11:00 PM", home: "New Zealand", away: "Belgium", venue: "BC Place, Vancouver", group: "G" },

    // Group H
    { date: "Mon, Jun 15", time: "12:00 PM", home: "Spain", away: "Cape Verde", venue: "Mercedes-Benz Stadium, Atlanta", group: "H" },
    { date: "Mon, Jun 15", time: "6:00 PM", home: "Saudi Arabia", away: "Uruguay", venue: "Hard Rock Stadium, Miami", group: "H" },
    { date: "Sun, Jun 21", time: "12:00 PM", home: "Spain", away: "Saudi Arabia", venue: "Mercedes-Benz Stadium, Atlanta", group: "H" },
    { date: "Sun, Jun 21", time: "6:00 PM", home: "Uruguay", away: "Cape Verde", venue: "Hard Rock Stadium, Miami", group: "H" },
    { date: "Fri, Jun 26", time: "8:00 PM", home: "Cape Verde", away: "Saudi Arabia", venue: "NRG Stadium, Houston", group: "H" },
    { date: "Fri, Jun 26", time: "8:00 PM", home: "Uruguay", away: "Spain", venue: "Estadio Akron, Guadalajara", group: "H" },

    // Group I
    { date: "Tue, Jun 16", time: "3:00 PM", home: "France", away: "Senegal", venue: "MetLife Stadium, East Rutherford", group: "I" },
    { date: "Tue, Jun 16", time: "6:00 PM", home: "Iraq", away: "Norway", venue: "Gillette Stadium, Foxborough", group: "I" },
    { date: "Mon, Jun 22", time: "5:00 PM", home: "France", away: "Iraq", venue: "Lincoln Financial Field, Philadelphia", group: "I" },
    { date: "Mon, Jun 22", time: "8:00 PM", home: "Norway", away: "Senegal", venue: "MetLife Stadium, East Rutherford", group: "I" },
    { date: "Fri, Jun 26", time: "3:00 PM", home: "Norway", away: "France", venue: "Gillette Stadium, Foxborough", group: "I" },
    { date: "Fri, Jun 26", time: "3:00 PM", home: "Senegal", away: "Iraq", venue: "BMO Field, Toronto", group: "I" },

    // Group J
    { date: "Tue, Jun 16", time: "9:00 PM", home: "Argentina", away: "Algeria", venue: "Arrowhead Stadium, Kansas City", group: "J" },
    { date: "Tue, Jun 17", time: "12:00 AM", home: "Austria", away: "Jordan", venue: "Levi's Stadium, Santa Clara", group: "J" },
    { date: "Mon, Jun 22", time: "1:00 PM", home: "Argentina", away: "Austria", venue: "AT&T Stadium, Arlington", group: "J" },
    { date: "Mon, Jun 22", time: "11:00 PM", home: "Jordan", away: "Algeria", venue: "Levi's Stadium, Santa Clara", group: "J" },
    { date: "Sat, Jun 27", time: "10:00 PM", home: "Jordan", away: "Argentina", venue: "AT&T Stadium, Arlington", group: "J" },
    { date: "Sat, Jun 27", time: "10:00 PM", home: "Algeria", away: "Austria", venue: "Arrowhead Stadium, Kansas City", group: "J" },

    // Group K
    { date: "Wed, Jun 17", time: "1:00 PM", home: "Portugal", away: "DR Congo", venue: "NRG Stadium, Houston", group: "K" },
    { date: "Wed, Jun 17", time: "10:00 PM", home: "Uzbekistan", away: "Colombia", venue: "Estadio Azteca, Mexico City", group: "K" },
    { date: "Tue, Jun 23", time: "1:00 PM", home: "Portugal", away: "Uzbekistan", venue: "NRG Stadium, Houston", group: "K" },
    { date: "Tue, Jun 23", time: "10:00 PM", home: "Colombia", away: "DR Congo", venue: "Estadio Akron, Guadalajara", group: "K" },
    { date: "Sat, Jun 27", time: "7:30 PM", home: "Colombia", away: "Portugal", venue: "Hard Rock Stadium, Miami", group: "K" },
    { date: "Sat, Jun 27", time: "7:30 PM", home: "DR Congo", away: "Uzbekistan", venue: "Mercedes-Benz Stadium, Atlanta", group: "K" },

    // Group L
    { date: "Wed, Jun 17", time: "4:00 PM", home: "England", away: "Croatia", venue: "AT&T Stadium, Arlington", group: "L" },
    { date: "Wed, Jun 17", time: "7:00 PM", home: "Ghana", away: "Panama", venue: "BMO Field, Toronto", group: "L" },
    { date: "Tue, Jun 23", time: "4:00 PM", home: "England", away: "Ghana", venue: "Gillette Stadium, Foxborough", group: "L" },
    { date: "Tue, Jun 23", time: "7:00 PM", home: "Panama", away: "Croatia", venue: "BMO Field, Toronto", group: "L" },
    { date: "Sat, Jun 27", time: "5:00 PM", home: "Panama", away: "England", venue: "MetLife Stadium, East Rutherford", group: "L" },
    { date: "Sat, Jun 27", time: "5:00 PM", home: "Croatia", away: "Ghana", venue: "Lincoln Financial Field, Philadelphia", group: "L" },
];

/** Fixtures with sequential match IDs and UTC kickoff timestamps assigned */
const FIXTURES: MatchFixture[] = _FIXTURES.map((f, i) => ({
    ...f,
    id: i + 1,
    kickoff: etToUtcMs(f.date, f.time),
}));

/** All 72 fixtures as an array */
export function getAllFixtures(): MatchFixture[] {
    return FIXTURES;
}

/**
 * Look up the scheduled fixture for a matchup between two teams in a group.
 * Matches regardless of which team is listed as home/away.
 */
export function findFixture(
    group: string,
    teamA: string,
    teamB: string,
): MatchFixture | null {
    const a = norm(teamA);
    const b = norm(teamB);
    return (
        FIXTURES.find(
            (f) =>
                f.group === group &&
                ((norm(f.home) === a && norm(f.away) === b) ||
                    (norm(f.home) === b && norm(f.away) === a)),
        ) ?? null
    );
}

/**
 * Return all fixtures currently in progress (status === "live").
 * Returns empty array if no matches are live.
 */
export function getLiveFixtures(): MatchFixture[] {
    return FIXTURES.filter((f) => getMatchTimeInfo(f).status === "live");
}

/**
 * Return all fixtures at the earliest non-past kickoff time.
 * Used to show live matches even if they're not yet marked "live" by the clock.
 * Returns empty array if all matches are past.
 */
export function getNextFixtures(): MatchFixture[] {
    let earliest: MatchFixture | null = null;
    let earliestKickoff = Infinity;

    for (const f of FIXTURES) {
        const info = getMatchTimeInfo(f);
        if (info.status !== "past" && f.kickoff < earliestKickoff) {
            earliest = f;
            earliestKickoff = f.kickoff;
        }
    }
    if (!earliest) return [];

    return FIXTURES.filter((f) => f.kickoff === earliest!.kickoff);
}

/**
 * Return all fixtures at the earliest strictly-future kickoff time(s),
 * ensuring at least `minCount` matches are returned (default 2).
 * Ignores live/past matches. Returns empty if no future matches remain.
 */
export function getUpcomingFixtures(minCount: number = 2): MatchFixture[] {
    // Sort future fixtures by kickoff ascending
    const future = FIXTURES
        .filter((f) => getMatchTimeInfo(f).status === "future")
        .sort((a, b) => a.kickoff - b.kickoff);

    if (future.length === 0) return [];

    // Collect complete kickoff groups until we have at least minCount
    const result: MatchFixture[] = [];
    let lastKickoff = -1;
    for (const f of future) {
        if (f.kickoff !== lastKickoff && result.length >= minCount) break;
        result.push(f);
        lastKickoff = f.kickoff;
    }

    return result;
}

/** Return all 72 fixture IDs */
export function getAllFixtureIds(): number[] {
    return FIXTURES.map((f) => f.id);
}

/** Return fixture IDs for matches that haven't kicked off yet */
export function getFutureFixtureIds(): number[] {
    return FIXTURES
        .filter((f) => getMatchTimeInfo(f).status === "future")
        .map((f) => f.id);
}

/** Return a map of group name → array of fixture IDs in that group */
export function getGroupFixtureIds(): Record<string, number[]> {
    const map: Record<string, number[]> = {};
    for (const f of FIXTURES) {
        if (!map[f.group]) map[f.group] = [];
        map[f.group].push(f.id);
    }
    return map;
}
