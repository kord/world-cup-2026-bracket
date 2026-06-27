import { knockoutPhaseScrapeResults } from "./knockout-phase-scrape-results";
import type { KnockoutStore } from "./useKnockoutPicks";

/**
 * Calculate knockout-phase success rate: correct winner picks / completed matches.
 * Only counts matches where both a pick was made AND a result exists.
 */
export function getKnockoutSuccessRate(picks: KnockoutStore): { correct: number; total: number } {
    let correct = 0;
    let total = 0;
    for (const [idStr, entry] of Object.entries(picks)) {
        const id = Number(idStr);
        const result = knockoutPhaseScrapeResults[id];
        if (result?.result && entry.selection) {
            total++;
            if (entry.selection === result.result) correct++;
        }
    }
    return { correct, total };
}
