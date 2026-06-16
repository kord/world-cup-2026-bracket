/**
 * Knockout round fixtures for the 2026 World Cup.
 * Data sourced from worldcupwiki.com/schedule/.
 *
 * Placeholder teams are described by their qualification path
 * (e.g. "Winner A", "Runner-up B", "Best 3rd (A/B/C/D/F)").
 * These get resolved once the group stage completes.
 */

export interface KnockoutFixture {
    /** Sequential match ID (73–104, continuing from group stage's 1–72) */
    id: number;
    /** Round name */
    round: string;
    /** Date string */
    date: string;
    /** Kickoff time in ET */
    time: string;
    /** Home/team-A placeholder */
    home: string;
    /** Away/team-B placeholder */
    away: string;
    /** Stadium name and city */
    venue: string;
}

/** Round of 32: June 28 – July 3 (matches 73–88) */
const R32: KnockoutFixture[] = [
    { id: 73, round: "Round of 32", date: "Sun, Jun 28", time: "3:00 PM", home: "Runner-up A", away: "Runner-up B", venue: "SoFi Stadium, Inglewood" },
    { id: 74, round: "Round of 32", date: "Mon, Jun 29", time: "4:30 PM", home: "Winner E", away: "Best 3rd (A/B/C/D/F)", venue: "Gillette Stadium, Foxborough" },
    { id: 75, round: "Round of 32", date: "Mon, Jun 29", time: "9:00 PM", home: "Winner F", away: "Runner-up C", venue: "Estadio BBVA, Monterrey" },
    { id: 76, round: "Round of 32", date: "Mon, Jun 29", time: "1:00 PM", home: "Winner C", away: "Runner-up F", venue: "NRG Stadium, Houston" },
    { id: 77, round: "Round of 32", date: "Tue, Jun 30", time: "5:00 PM", home: "Winner I", away: "Best 3rd (C/D/F/G/H)", venue: "MetLife Stadium, East Rutherford" },
    { id: 78, round: "Round of 32", date: "Tue, Jun 30", time: "1:00 PM", home: "Runner-up E", away: "Runner-up I", venue: "AT&T Stadium, Arlington" },
    { id: 79, round: "Round of 32", date: "Tue, Jun 30", time: "9:00 PM", home: "Winner A", away: "Best 3rd (C/E/F/H/I)", venue: "Estadio Azteca, Mexico City" },
    { id: 80, round: "Round of 32", date: "Wed, Jul 1", time: "12:00 PM", home: "Winner L", away: "Best 3rd (E/H/I/J/K)", venue: "Mercedes-Benz Stadium, Atlanta" },
    { id: 81, round: "Round of 32", date: "Wed, Jul 1", time: "8:00 PM", home: "Winner D", away: "Best 3rd (B/E/F/I/J)", venue: "Levi's Stadium, Santa Clara" },
    { id: 82, round: "Round of 32", date: "Wed, Jul 1", time: "4:00 PM", home: "Winner G", away: "Best 3rd (A/E/H/I/J)", venue: "Lumen Field, Seattle" },
    { id: 83, round: "Round of 32", date: "Thu, Jul 2", time: "7:00 PM", home: "Runner-up K", away: "Runner-up L", venue: "BMO Field, Toronto" },
    { id: 84, round: "Round of 32", date: "Thu, Jul 2", time: "3:00 PM", home: "Winner H", away: "Runner-up J", venue: "SoFi Stadium, Inglewood" },
    { id: 85, round: "Round of 32", date: "Thu, Jul 2", time: "11:00 PM", home: "Winner B", away: "Best 3rd (E/F/G/I/J)", venue: "BC Place, Vancouver" },
    { id: 86, round: "Round of 32", date: "Fri, Jul 3", time: "6:00 PM", home: "Winner J", away: "Runner-up H", venue: "Hard Rock Stadium, Miami Gardens" },
    { id: 87, round: "Round of 32", date: "Fri, Jul 3", time: "9:30 PM", home: "Winner K", away: "Best 3rd (D/E/I/J/L)", venue: "Arrowhead Stadium, Kansas City" },
    { id: 88, round: "Round of 32", date: "Fri, Jul 3", time: "2:00 PM", home: "Runner-up D", away: "Runner-up G", venue: "AT&T Stadium, Arlington" },
];

/** Round of 16: July 4–7 (matches 89–96) */
const R16: KnockoutFixture[] = [
    { id: 89, round: "Round of 16", date: "Sat, Jul 4", time: "5:00 PM", home: "Winner M74", away: "Winner M77", venue: "Lincoln Financial Field, Philadelphia" },
    { id: 90, round: "Round of 16", date: "Sat, Jul 4", time: "1:00 PM", home: "Winner M73", away: "Winner M75", venue: "NRG Stadium, Houston" },
    { id: 91, round: "Round of 16", date: "Sun, Jul 5", time: "4:00 PM", home: "Winner M76", away: "Winner M78", venue: "MetLife Stadium, East Rutherford" },
    { id: 92, round: "Round of 16", date: "Sun, Jul 5", time: "8:00 PM", home: "Winner M79", away: "Winner M80", venue: "Estadio Azteca, Mexico City" },
    { id: 93, round: "Round of 16", date: "Mon, Jul 6", time: "3:00 PM", home: "Winner M83", away: "Winner M84", venue: "AT&T Stadium, Arlington" },
    { id: 94, round: "Round of 16", date: "Mon, Jul 6", time: "8:00 PM", home: "Winner M81", away: "Winner M82", venue: "Lumen Field, Seattle" },
    { id: 95, round: "Round of 16", date: "Tue, Jul 7", time: "12:00 PM", home: "Winner M86", away: "Winner M88", venue: "Mercedes-Benz Stadium, Atlanta" },
    { id: 96, round: "Round of 16", date: "Tue, Jul 7", time: "4:00 PM", home: "Winner M85", away: "Winner M87", venue: "BC Place, Vancouver" },
];

/** Quarterfinals: July 9–11 (matches 97–100) */
const QF: KnockoutFixture[] = [
    { id: 97, round: "Quarterfinal", date: "Thu, Jul 9", time: "4:00 PM", home: "Winner M89", away: "Winner M90", venue: "Gillette Stadium, Foxborough" },
    { id: 98, round: "Quarterfinal", date: "Fri, Jul 10", time: "3:00 PM", home: "Winner M93", away: "Winner M94", venue: "SoFi Stadium, Inglewood" },
    { id: 99, round: "Quarterfinal", date: "Sat, Jul 11", time: "5:00 PM", home: "Winner M91", away: "Winner M92", venue: "Hard Rock Stadium, Miami Gardens" },
    { id: 100, round: "Quarterfinal", date: "Sat, Jul 11", time: "9:00 PM", home: "Winner M95", away: "Winner M96", venue: "Arrowhead Stadium, Kansas City" },
];

/** Semifinals: July 14–15 (matches 101–102) */
const SF: KnockoutFixture[] = [
    { id: 101, round: "Semifinal", date: "Tue, Jul 14", time: "3:00 PM", home: "Winner M97", away: "Winner M98", venue: "AT&T Stadium, Arlington" },
    { id: 102, round: "Semifinal", date: "Wed, Jul 15", time: "3:00 PM", home: "Winner M99", away: "Winner M100", venue: "Mercedes-Benz Stadium, Atlanta" },
];

/** Third-place match: July 18 (match 103) */
const TPO: KnockoutFixture[] = [
    { id: 103, round: "Third Place", date: "Sat, Jul 18", time: "5:00 PM", home: "Loser M101", away: "Loser M102", venue: "Hard Rock Stadium, Miami Gardens" },
];

/** Final: July 19 (match 104) */
const FINAL: KnockoutFixture[] = [
    { id: 104, round: "Final", date: "Sun, Jul 19", time: "3:00 PM", home: "Winner M101", away: "Winner M102", venue: "MetLife Stadium, East Rutherford" },
];

/** All 32 knockout fixtures (IDs 73–104) */
export const KNOCKOUT_FIXTURES: KnockoutFixture[] = [
    ...R32, ...R16, ...QF, ...SF, ...TPO, ...FINAL,
];

/** Look up a knockout fixture by match ID */
export function getKnockoutFixture(id: number): KnockoutFixture | null {
    return KNOCKOUT_FIXTURES.find(f => f.id === id) ?? null;
}

/** All knockout fixture IDs */
export function getKnockoutFixtureIds(): number[] {
    return KNOCKOUT_FIXTURES.map(f => f.id);
}
