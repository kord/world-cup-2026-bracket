import { KNOCKOUT_FIXTURES } from "./knockoutFixtures";
import { resolveFixture } from "./knockoutResolver";
import type { KnockoutStore, KnockoutPick } from "./useKnockoutPicks";
import { getKoResult } from "./knockoutMatchResults";

const byId = new Map(KNOCKOUT_FIXTURES.map(f => [f.id, f]));

export interface KoPickEntry {
    matchId: number;
    round: string;
    winner: string;
    winnerResolved: boolean;
    /** null = match not yet played / no result; "won" = pick matched result; "lost" = pick didn't match */
    pickResult: "won" | "lost" | null;
}

function parseFeedRef(name: string): number | null {
    const m = name.match(/[WL](?:inner|oser)\s+M(\d+)/i);
    return m ? parseInt(m[1]) : null;
}

function isPlaceholder(name: string): boolean {
    return /^(Winner|Runner-up|Best 3rd|Loser)\b/.test(name);
}

/**
 * Recursively follow a user's pick through the bracket to find their predicted winner.
 * E.g., if match 89 has "Winner M75" and the user picked home for match 75,
 * this follows the chain: M89(home) → M75(home) → M75's home winner.
 */
function resolvePickWinner(
    matchId: number,
    side: "home" | "away",
    picks: KnockoutStore,
    visited: Set<number> = new Set(),
): string {
    if (visited.has(matchId)) return `#${matchId}`;
    visited.add(matchId);

    const f = byId.get(matchId);
    if (!f) return `#${matchId}`;

    const slot = side === "home" ? f.home : f.away;

    // If the slot is a feed-forward ref (Winner/Loser M##), follow the user's
    // pick chain BEFORE calling resolveFixture — resolveFixture uses actual KO
    // results, which would override the user's prediction.
    const feederId = parseFeedRef(slot);
    if (feederId != null) {
        const feederPick: KnockoutPick = picks[String(feederId)]?.selection ?? null;
        if (feederPick) {
            const feederF = byId.get(feederId);
            if (feederF) {
                const isLoser = /^Loser\b/i.test(slot);
                const feederSide = isLoser
                    ? (feederPick === "home" ? "away" : "home")  // loser is opposite of pick
                    : feederPick; // winner is the pick
                return resolvePickWinner(feederId, feederSide, picks, visited);
            }
        }
    }

    // Resolve group-stage placeholders (Winner E → Germany, Runner-up A → South Africa, etc.)
    const r = resolveFixture(f.home, f.away, matchId);
    const raw = side === "home" ? r.home : r.away;

    // If resolved to an actual team, return it
    if (!isPlaceholder(raw)) return raw;

    // If resolution produced a feed-forward ref, follow it
    const refId = parseFeedRef(raw);
    if (refId != null) {
        const feederPick = picks[String(refId)]?.selection ?? null;
        if (feederPick) {
            const isLoser = /^Loser\b/i.test(raw);
            const feederSide = isLoser
                ? (feederPick === "home" ? "away" : "home")
                : feederPick;
            return resolvePickWinner(refId, feederSide, picks, visited);
        }
    }

    // Can't resolve further — return shortened placeholder
    return raw
        .replace("Winner ", "W")
        .replace("Runner-up ", "RU")
        .replace("Best 3rd (", "3rd ")
        .replace("Loser ", "L")
        .replace(")", "");
}

/** Transform knockout picks into a flat list of {matchId, round, winner}. */
export function getKoPickList(picks: KnockoutStore): KoPickEntry[] {
    const result: KoPickEntry[] = [];
    for (const f of KNOCKOUT_FIXTURES) {
        const pick: KnockoutPick = picks[String(f.id)]?.selection ?? null;
        if (!pick) continue;

        const winner = resolvePickWinner(f.id, pick, picks);
        const resolved = !isPlaceholder(winner);

        // Determine if the pick was correct
        const koResult = getKoResult(f.id);
        let pickResult: "won" | "lost" | null = null;
        if (koResult?.result && pick) {
            pickResult = pick === koResult.result ? "won" : "lost";
        }

        result.push({
            matchId: f.id,
            round: f.round,
            winner,
            winnerResolved: resolved,
            pickResult,
        });
    }
    return result;
}
