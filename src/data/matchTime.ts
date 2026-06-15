import type { MatchFixture } from "../types";

/** Match duration in hours — used to determine "live" status */
const MATCH_DURATION_HOURS = 2;

export type MatchStatus = "past" | "live" | "future";

export interface MatchTimeInfo {
    /** Formatted local date/time string (e.g. "Thu, Jun 11, 12:00 PM") */
    localTime: string;
    /** The match status relative to now */
    status: MatchStatus;
    /** Unix timestamp (ms) of kickoff in UTC */
    kickoffMs: number;
}

/** Month name → 0-based index */
const MONTH_MAP: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/**
 * Parse a fixture's date + time (in US Eastern Time) into a UTC timestamp.
 * In June 2026 the Eastern US observes EDT (UTC-4).
 */
export function parseET(fixture: MatchFixture): Date {
    const parts = fixture.date.split(" ");
    const month = MONTH_MAP[parts[1]] ?? 5;
    const day = parseInt(parts[2], 10);

    const timeMatch = fixture.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hours = 0;
    let minutes = 0;
    if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3].toUpperCase();
        if (ampm === "PM" && hours !== 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
    }

    // ET in June = EDT = UTC-4, so add 4 hours to get UTC
    return new Date(Date.UTC(2026, month, day, hours + 4, minutes));
}

/** Format a date in the user's local timezone: "Thu, Jun 11, 3:00 PM" */
function formatLocal(date: Date): string {
    return date.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

/**
 * Determine match status and local display time for a fixture.
 * - past: match ended (kickoff + 2h is in the past)
 * - live: match is in progress
 * - future: match hasn't started yet
 */
export function getMatchTimeInfo(fixture: MatchFixture): MatchTimeInfo {
    const kickoff = parseET(fixture);
    const kickoffMs = kickoff.getTime();
    const endMs = kickoffMs + MATCH_DURATION_HOURS * 60 * 60 * 1000;
    const now = Date.now();

    let status: MatchStatus;
    if (now < kickoffMs) {
        status = "future";
    } else if (now < endMs) {
        status = "live";
    } else {
        status = "past";
    }

    return {
        localTime: formatLocal(kickoff),
        status,
        kickoffMs,
    };
}
