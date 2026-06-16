import { groupPhaseScrapeResults, type ScrapeResult } from "./group-phase-scrape-results";
import type { PicksStore } from "./useMatchPicks";

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

/** Calculate success rate: correct picks / total picks for matches with results */
export function getSuccessRate(picks: PicksStore): { correct: number; total: number } {
    let correct = 0;
    let total = 0;
    for (const [idStr, entry] of Object.entries(picks)) {
        const id = Number(idStr);
        const result = getScrapeResult(id);
        if (result && entry.selection) {
            total++;
            if (entry.selection === result.result) correct++;
        }
    }
    return { correct, total };
}
