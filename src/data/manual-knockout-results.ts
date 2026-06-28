/**
 * Manually specified knockout match results.
 * These take priority over scraped results — set them here if the scraper
 * hasn't picked up a finished match yet.
 *
 * Format: matchId → { result, homeScore, awayScore, homeShootout?, awayShootout? }
 */

export interface ManualKnockoutResult {
    result: "home" | "away";
    homeScore: number;
    awayScore: number;
    homeShootout?: number;
    awayShootout?: number;
}

export const manualKnockoutResults: Record<number, ManualKnockoutResult> = {
    // Canada 1–0 South Africa — Sun, Jun 28
    73: { result: "away", homeScore: 0, awayScore: 1 },
};
