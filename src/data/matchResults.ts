import { groupPhaseScrapeResults, type ScrapeResult } from "./group-phase-scrape-results";

/** Get the scraped result for a fixture ID, or null if not yet played/scraped */
export function getScrapeResult(matchId: number): ScrapeResult | null {
    return groupPhaseScrapeResults[matchId] ?? null;
}

/** Check if a user's pick was correct for a completed match */
export function isPickCorrect(matchId: number, pick: string | null): boolean | null {
    const result = getScrapeResult(matchId);
    if (!result || !pick) return null;
    return pick === result.result;
}
