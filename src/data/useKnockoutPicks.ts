import { useState, useCallback, useMemo } from "react";
import { loadAndNormalizePicks, savePicks } from "./pickStore";
import { KNOCKOUT_FIXTURES } from "./knockoutFixtures";

const STORAGE_KEY = "wc2026-knockout-picks";

export type KnockoutPick = "home" | "away" | null;
export type KnockoutStore = Record<string, { selection: KnockoutPick; timestamp: number }>;

function parseFeedRef(name: string): number | null {
    const m = name.match(/[WL](?:inner|oser)\s+M(\d+)/i);
    return m ? parseInt(m[1]) : null;
}

/** Build map: matchId → [ids of matches that feed from it] */
function buildDownstreamMap(): Map<number, number[]> {
    const map = new Map<number, number[]>();
    for (const f of KNOCKOUT_FIXTURES) {
        for (const slot of [f.home, f.away]) {
            const feederId = parseFeedRef(slot);
            if (feederId != null) {
                const list = map.get(feederId) ?? [];
                list.push(f.id);
                map.set(feederId, list);
            }
        }
    }
    return map;
}

export function useKnockoutPicks() {
    const [picks, setPicks] = useState<KnockoutStore>(() =>
        loadAndNormalizePicks(STORAGE_KEY, (s) => savePicks(STORAGE_KEY, s)) as KnockoutStore
    );

    const downstreamMap = useMemo(() => buildDownstreamMap(), []);

    const getPick = useCallback(
        (matchId: number): KnockoutPick => {
            return (picks[String(matchId)]?.selection as KnockoutPick) ?? null;
        },
        [picks],
    );

    const togglePick = useCallback(
        (matchId: number, selection: KnockoutPick) => {
            setPicks((prev) => {
                const key = String(matchId);
                const current = (prev[key]?.selection as KnockoutPick) ?? null;
                const next = { ...prev };

                // Recursively clear downstream picks
                const clearDownstream = () => {
                    const queue = [...(downstreamMap.get(matchId) ?? [])];
                    while (queue.length > 0) {
                        const id = queue.pop()!;
                        if (next[String(id)]) {
                            delete next[String(id)];
                            queue.push(...(downstreamMap.get(id) ?? []));
                        }
                    }
                };

                if (current === selection) {
                    // Deselect: clear this match + downstream
                    delete next[key];
                    clearDownstream();
                } else {
                    // Switch or new pick: clear downstream, then set new pick
                    clearDownstream();
                    next[key] = { selection, timestamp: Date.now() };
                }
                savePicks(STORAGE_KEY, next as any);
                return next;
            });
        },
        [downstreamMap],
    );

    const clearAll = useCallback(() => {
        setPicks({});
        savePicks(STORAGE_KEY, {} as any);
    }, []);

    return { picks, getPick, togglePick, clearAll };
}
