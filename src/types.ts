/** Raw team data as parsed from CSV (odds are strings like "450", "-155", "10-1") */
export interface Team {
    team: string;
    group: string;
    win: string;
    finals: string;
    semis: string;
    quarterFinals: string;
    winGroup: string;
    qualifyFromGroup: string;
}

/** A team with odds converted to implied probability percentages (null = unavailable) */
export interface TeamPercentages {
    team: string;
    winPct: number | null;
    finalsPct: number | null;
    semisPct: number | null;
    quarterFinalsPct: number | null;
    winGroupPct: number | null;
    qualifyFromGroupPct: number | null;
}

/** A group (A–L) containing its four teams with percentage data */
export interface Group {
    name: string;
    teams: TeamPercentages[];
}

/** A scheduled match fixture with date, time, and venue */
export interface MatchFixture {
    id: number;
    date: string;
    time: string;
    /** UTC timestamp (ms) of kickoff */
    kickoff: number;
    home: string;
    away: string;
    venue: string;
    group: string;
}
