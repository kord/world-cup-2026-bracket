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
 * Convert an ET date + time string to a UTC timestamp (ms).
 * In June 2026 the Eastern US observes EDT (UTC-4).
 */
export function etToUtcMs(dateStr: string, timeStr: string): number {
    const parts = dateStr.split(" ");
    const month = MONTH_MAP[parts[1]] ?? 5;
    const day = parseInt(parts[2], 10);

    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
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
    return Date.UTC(2026, month, day, hours + 4, minutes);
}

/** Format a UTC timestamp in the user's local timezone: "Thu, Jun 11, 3:00 PM" */
export function formatLocal(utcMs: number): string {
    return new Date(utcMs).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

/** Determine match status from a UTC kickoff timestamp */
export function getStatusFromKickoff(kickoffMs: number): MatchStatus {
    const endMs = kickoffMs + MATCH_DURATION_HOURS * 60 * 60 * 1000;
    const now = Date.now();
    if (now < kickoffMs) return "future";
    if (now < endMs) return "live";
    return "past";
}

/**
 * Determine match status and local display time for a fixture.
 * Uses the pre-computed UTC kickoff timestamp.
 */
export function getMatchTimeInfo(fixture: MatchFixture): MatchTimeInfo {
    const kickoffMs = fixture.kickoff;
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
        localTime: formatLocal(kickoffMs),
        status,
        kickoffMs,
    };
}
