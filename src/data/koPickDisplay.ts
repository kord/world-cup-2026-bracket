import { KNOCKOUT_FIXTURES } from "./knockoutFixtures";
import { resolveFixture } from "./knockoutResolver";
import type { KnockoutStore, KnockoutPick } from "./useKnockoutPicks";

const byId = new Map(KNOCKOUT_FIXTURES.map(f => [f.id, f]));

export interface KoPickEntry {
    matchId: number;
    round: string;
    winner: string;
    winnerResolved: boolean;
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

    // First try group-stage resolution
    const r = resolveFixture(f.home, f.away, matchId);
    const raw = side === "home" ? r.home : r.away;

    // If resolved to an actual team, return it
    if (!isPlaceholder(raw)) return raw;

    // If it's a feed-forward ref (Winner/Loser M##), follow the user's pick
    const feederId = parseFeedRef(raw);
    if (feederId != null) {
        const feederPick: KnockoutPick = picks[String(feederId)]?.selection ?? null;
        if (feederPick) {
            const feederF = byId.get(feederId);
            if (feederF) {
                const isLoser = /^Loser\b/i.test(raw);
                const feederSide = isLoser
                    ? (feederPick === "home" ? "away" : "home")  // loser is opposite of pick
                    : feederPick; // winner is the pick
                return resolvePickWinner(feederId, feederSide, picks, visited);
            }
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

        result.push({
            matchId: f.id,
            round: f.round,
            winner,
            winnerResolved: resolved,
        });
    }
    return result;
}
