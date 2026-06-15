import type { PicksStore } from "./useMatchPicks";

/**
 * Encode all picks into a compact shareable string.
 * Each match gets 2 bits: 00=home, 01=tie, 10=away, 11=no pick.
 * 72 matches × 2 bits = 144 bits = 18 bytes → 24 base64 chars.
 */
export function encodePicks(picks: PicksStore): string {
    const bytes: number[] = [];
    for (let i = 1; i <= 72; i++) {
        const pick = picks[String(i)]?.selection;
        const bits = pick === "home" ? 0 : pick === "tie" ? 1 : pick === "away" ? 2 : 3;
        // Pack 4 matches per byte (2 bits each)
        const byteIdx = Math.floor((i - 1) / 4);
        const shift = 6 - ((i - 1) % 4) * 2;
        if (!bytes[byteIdx]) bytes[byteIdx] = 0;
        bytes[byteIdx] |= bits << shift;
    }
    // Convert to base64
    const binary = String.fromCharCode(...bytes);
    return btoa(binary);
}

/**
 * Decode a share string back into a picks record.
 */
export function decodePicks(encoded: string): PicksStore {
    const binary = atob(encoded);
    const picks: PicksStore = {};
    for (let i = 1; i <= 72; i++) {
        const byteIdx = Math.floor((i - 1) / 4);
        const shift = 6 - ((i - 1) % 4) * 2;
        const bits = (binary.charCodeAt(byteIdx) >> shift) & 3;
        if (bits === 0) picks[String(i)] = { selection: "home", timestamp: 0 };
        else if (bits === 1) picks[String(i)] = { selection: "tie", timestamp: 0 };
        else if (bits === 2) picks[String(i)] = { selection: "away", timestamp: 0 };
        // bits === 3 → no pick, skip
    }
    return picks;
}
