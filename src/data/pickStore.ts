/**
 * Shared pick-store logic: reads, normalizes, and rewrites localStorage.
 * Used by both useMatchPicks (own picks) and useImportedPicks (friend picks).
 */
import type { PicksStore } from "./useMatchPicks";

export type PickSelection = "home" | "draw" | "away" | null;

/** Normalize legacy "tie" → "draw". Returns null for unrecognized values. */
export function normalizePick(s: string): PickSelection {
    if (s === "tie") return "draw";
    if (s === "home" || s === "draw" || s === "away") return s;
    return null;
}

/**
 * Normalize a single PicksStore in-place.
 * Returns true if any entries were changed.
 */
export function normalizePicksStore(picks: PicksStore): boolean {
    let changed = false;
    for (const key of Object.keys(picks)) {
        const entry = picks[key];
        if (typeof entry?.selection === "string") {
            const normalized = normalizePick(entry.selection);
            if (normalized !== entry.selection) {
                entry.selection = normalized;
                changed = true;
            }
        }
    }
    return changed;
}

/**
 * Load, normalize, and optionally rewrite a picks-style localStorage key.
 * Handles both the old `"1":"home"` format and the current `"1":{selection:"home",timestamp:0}` format.
 *
 * @param storageKey  The localStorage key to read from.
 * @param rewrite     If provided, called with the normalized store when changes are made,
 *                    so the caller can persist the cleaned data back.
 */
export function loadAndNormalizePicks(
    storageKey: string,
    rewrite?: (store: PicksStore) => void,
): PicksStore {
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return {};

        const parsed = JSON.parse(raw);
        const result: PicksStore = {};
        let needsRewrite = false;

        for (const [key, val] of Object.entries(parsed)) {
            if (typeof val === "object" && val !== null && "selection" in val) {
                const entry = val as PicksStore[string];
                if (typeof entry.selection === "string") {
                    const normalized = normalizePick(entry.selection);
                    if (normalized !== entry.selection) needsRewrite = true;
                    entry.selection = normalized;
                }
                result[key] = entry;
            } else if (typeof val === "string") {
                // Migrate old format: "1":"home" → "1":{selection:"home",timestamp:0}
                const normalized = normalizePick(val);
                if (normalized !== val) needsRewrite = true;
                result[key] = { selection: normalized, timestamp: 0 };
            }
        }

        if (needsRewrite) {
            console.log(`[pickStore] Normalized legacy 'tie' picks in ${storageKey} — rewriting`);
            rewrite?.(result);
        }

        return result;
    } catch {
        return {};
    }
}

/** Save a picks store to localStorage. */
export function savePicks(storageKey: string, picks: PicksStore): void {
    localStorage.setItem(storageKey, JSON.stringify(picks));
} 
