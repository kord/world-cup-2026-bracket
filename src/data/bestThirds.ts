/**
 * Best 3rd-place team resolution for the 2026 World Cup knockout phase.
 *
 * 8 of the 12 third-place teams advance to the Round of 32.
 * Which specific 3rd-place team goes to which R32 match depends on
 * the combination of qualifying groups, per FIFA regulations.
 *
 * Set BEST_THIRD_QUALIFIERS to the list of groups whose 3rd-place
 * teams have advanced (e.g. ["A","C","D","E","F","H","I","J"]).
 */

import { resolveAllGroups } from "./knockoutResolver";
import { getStandings } from "./standings";

/**
 * Set this to the groups whose 3rd-place teams advanced.
 * Empty array = not yet determined (all Best 3rd slots return null).
 */
export let BEST_THIRD_QUALIFIERS: string[] = ["B", "D", "E", "F", "I", "J", "K", "L"];

/** Override the qualifying 3rd-place groups (call after group stage completes) */
export function setBestThirdQualifiers(groups: string[]): void {
    BEST_THIRD_QUALIFIERS = [...groups].sort();
}

/**
 * Direct slot overrides: matchId → group letter of the 3rd-place team.
 * Used when the auto-resolution doesn't produce the correct FIFA allocation.
 * Set via dev toolbar "Set 3rd slot" button.
 */
export const BEST_THIRD_SLOTS: Record<number, string> = {
    74: "D",  // Germany vs Paraguay
    77: "F",  // France vs Sweden
    79: "E",  // Mexico vs Ecuador
    80: "K",  // England vs DR Congo
    81: "B",  // USA vs Bosnia
    82: "I",  // Belgium vs Senegal
    85: "J",  // Switzerland vs Algeria
    87: "L",  // Colombia vs Ghana
};

/**
 * Resolve a "Best 3rd (A/B/C/D/F)" placeholder to an actual team name.
 * Returns null if the slot can't be determined yet.
 */
export function resolveBestThird(placeholder: string, matchId?: number): string | null {
    // Parse candidate groups from placeholder like "Best 3rd (A/B/C/D/F)"
    const m = placeholder.match(/^Best 3rd \(([^)]+)\)$/);
    if (!m) return null;

    if (BEST_THIRD_QUALIFIERS.length === 0) return null;

    // Direct slot override takes priority
    if (matchId != null && BEST_THIRD_SLOTS[matchId]) {
        const group = BEST_THIRD_SLOTS[matchId];
        const groups = resolveAllGroups();
        const resolved = groups[group];
        if (resolved?.third) return resolved.third;
    }

    const groups = resolveAllGroups();
    const qualSet = new Set(BEST_THIRD_QUALIFIERS);
    const candidates = m[1].split("/").map(s => s.trim());

    // Find the first candidate group whose 3rd-place team is a qualifier
    for (const g of candidates) {
        if (qualSet.has(g)) {
            const resolved = groups[g];
            if (resolved?.third) return resolved.third;
        }
    }

    // If no direct match, check the standings directly
    const allStandings = getStandings();
    for (const g of candidates) {
        if (qualSet.has(g)) {
            const standings = allStandings[g];
            if (standings && standings.length >= 3) {
                return standings[2].team;
            }
        }
    }

    return null;
}
