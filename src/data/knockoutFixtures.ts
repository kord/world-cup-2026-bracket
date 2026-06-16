/**
 * Knockout round fixtures for the 2026 World Cup.
 * Data sourced from worldcupwiki.com/schedule/.
 */

import { etToUtcMs } from "./matchTime";

export interface KnockoutFixture {
    id: number;
    round: string;
    /** UTC kickoff timestamp (ms) */
    kickoff: number;
    /** ET date string (for display fallback) */
    date: string;
    /** ET time string (for display fallback) */
    time: string;
    home: string;
    away: string;
    venue: string;
}

function f(id: number, round: string, date: string, time: string, home: string, away: string, venue: string): KnockoutFixture {
    return { id, round, kickoff: etToUtcMs(date, time), date, time, home, away, venue };
}

/** Round of 32: June 28 – July 3 (matches 73–88) */
const R32: KnockoutFixture[] = [
    f(73, "Round of 32", "Sun, Jun 28", "3:00 PM", "Runner-up A", "Runner-up B", "SoFi Stadium, Inglewood"),
    f(74, "Round of 32", "Mon, Jun 29", "4:30 PM", "Winner E", "Best 3rd (A/B/C/D/F)", "Gillette Stadium, Foxborough"),
    f(75, "Round of 32", "Mon, Jun 29", "9:00 PM", "Winner F", "Runner-up C", "Estadio BBVA, Monterrey"),
    f(76, "Round of 32", "Mon, Jun 29", "1:00 PM", "Winner C", "Runner-up F", "NRG Stadium, Houston"),
    f(77, "Round of 32", "Tue, Jun 30", "5:00 PM", "Winner I", "Best 3rd (C/D/F/G/H)", "MetLife Stadium, East Rutherford"),
    f(78, "Round of 32", "Tue, Jun 30", "1:00 PM", "Runner-up E", "Runner-up I", "AT&T Stadium, Arlington"),
    f(79, "Round of 32", "Tue, Jun 30", "9:00 PM", "Winner A", "Best 3rd (C/E/F/H/I)", "Estadio Azteca, Mexico City"),
    f(80, "Round of 32", "Wed, Jul 1", "12:00 PM", "Winner L", "Best 3rd (E/H/I/J/K)", "Mercedes-Benz Stadium, Atlanta"),
    f(81, "Round of 32", "Wed, Jul 1", "8:00 PM", "Winner D", "Best 3rd (B/E/F/I/J)", "Levi's Stadium, Santa Clara"),
    f(82, "Round of 32", "Wed, Jul 1", "4:00 PM", "Winner G", "Best 3rd (A/E/H/I/J)", "Lumen Field, Seattle"),
    f(83, "Round of 32", "Thu, Jul 2", "7:00 PM", "Runner-up K", "Runner-up L", "BMO Field, Toronto"),
    f(84, "Round of 32", "Thu, Jul 2", "3:00 PM", "Winner H", "Runner-up J", "SoFi Stadium, Inglewood"),
    f(85, "Round of 32", "Thu, Jul 2", "11:00 PM", "Winner B", "Best 3rd (E/F/G/I/J)", "BC Place, Vancouver"),
    f(86, "Round of 32", "Fri, Jul 3", "6:00 PM", "Winner J", "Runner-up H", "Hard Rock Stadium, Miami Gardens"),
    f(87, "Round of 32", "Fri, Jul 3", "9:30 PM", "Winner K", "Best 3rd (D/E/I/J/L)", "Arrowhead Stadium, Kansas City"),
    f(88, "Round of 32", "Fri, Jul 3", "2:00 PM", "Runner-up D", "Runner-up G", "AT&T Stadium, Arlington"),
];

/** Round of 16: July 4–7 (matches 89–96) */
const R16: KnockoutFixture[] = [
    f(89, "Round of 16", "Sat, Jul 4", "5:00 PM", "Winner M74", "Winner M77", "Lincoln Financial Field, Philadelphia"),
    f(90, "Round of 16", "Sat, Jul 4", "1:00 PM", "Winner M73", "Winner M75", "NRG Stadium, Houston"),
    f(91, "Round of 16", "Sun, Jul 5", "4:00 PM", "Winner M76", "Winner M78", "MetLife Stadium, East Rutherford"),
    f(92, "Round of 16", "Sun, Jul 5", "8:00 PM", "Winner M79", "Winner M80", "Estadio Azteca, Mexico City"),
    f(93, "Round of 16", "Mon, Jul 6", "3:00 PM", "Winner M83", "Winner M84", "AT&T Stadium, Arlington"),
    f(94, "Round of 16", "Mon, Jul 6", "8:00 PM", "Winner M81", "Winner M82", "Lumen Field, Seattle"),
    f(95, "Round of 16", "Tue, Jul 7", "12:00 PM", "Winner M86", "Winner M88", "Mercedes-Benz Stadium, Atlanta"),
    f(96, "Round of 16", "Tue, Jul 7", "4:00 PM", "Winner M85", "Winner M87", "BC Place, Vancouver"),
];

/** Quarterfinals: July 9–11 (matches 97–100) */
const QF: KnockoutFixture[] = [
    f(97, "Quarterfinal", "Thu, Jul 9", "4:00 PM", "Winner M89", "Winner M90", "Gillette Stadium, Foxborough"),
    f(98, "Quarterfinal", "Fri, Jul 10", "3:00 PM", "Winner M93", "Winner M94", "SoFi Stadium, Inglewood"),
    f(99, "Quarterfinal", "Sat, Jul 11", "5:00 PM", "Winner M91", "Winner M92", "Hard Rock Stadium, Miami Gardens"),
    f(100, "Quarterfinal", "Sat, Jul 11", "9:00 PM", "Winner M95", "Winner M96", "Arrowhead Stadium, Kansas City"),
];

/** Semifinals: July 14–15 (matches 101–102) */
const SF: KnockoutFixture[] = [
    f(101, "Semifinal", "Tue, Jul 14", "3:00 PM", "Winner M97", "Winner M98", "AT&T Stadium, Arlington"),
    f(102, "Semifinal", "Wed, Jul 15", "3:00 PM", "Winner M99", "Winner M100", "Mercedes-Benz Stadium, Atlanta"),
];

/** Third-place match: July 18 (match 103) */
const TPO: KnockoutFixture[] = [
    f(103, "Third Place", "Sat, Jul 18", "5:00 PM", "Loser M101", "Loser M102", "Hard Rock Stadium, Miami Gardens"),
];

/** Final: July 19 (match 104) */
const FINAL: KnockoutFixture[] = [
    f(104, "Final", "Sun, Jul 19", "3:00 PM", "Winner M101", "Winner M102", "MetLife Stadium, East Rutherford"),
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
