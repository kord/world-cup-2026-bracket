import { knockoutPhaseScrapeResults } from "./knockout-phase-scrape-results";
import { manualKnockoutResults } from "./manual-knockout-results";
import type { KnockoutStore } from "./useKnockoutPicks";

/** Get the effective result for a KO match (manual overrides scrape) */
function getKoResult(id: number) {
    return manualKnockoutResults[id] ?? knockoutPhaseScrapeResults[id];
}

/**
 * Calculate knockout-phase success rate: correct winner picks / completed matches.
 * Only counts matches where both a pick was made AND a result exists.
 */
export function getKnockoutSuccessRate(picks: KnockoutStore): { correct: number; total: number } {
    let correct = 0;
    let total = 0;
    for (const [idStr, entry] of Object.entries(picks)) {
        const id = Number(idStr);
        const result = getKoResult(id);
        if (result?.result && entry.selection) {
            total++;
            if (entry.selection === result.result) correct++;
        }
    }
    return { correct, total };
}