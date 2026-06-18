import { useState, useCallback } from "react";

export type PickSelection = "home" | "draw" | "away" | null;

interface PickEntry {
    selection: PickSelection;
    timestamp: number;
}

export type PicksStore = Record<string, PickEntry>;

const STORAGE_KEY = "wc2026-picks";

function loadPicks(): PicksStore {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        // Migrate old format: "1":"home" → "1":{selection:"home",timestamp:0}
        const result: PicksStore = {};
        for (const [key, val] of Object.entries(parsed)) {
            if (typeof val === "object" && val !== null && "selection" in val) {
                result[key] = val as PickEntry;
            } else if (typeof val === "string") {
                result[key] = { selection: val as PickSelection, timestamp: 0 };
            }
        }
        return result;
    } catch {
        return {};
    }
}

function savePicks(picks: PicksStore) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
}

export function useMatchPicks() {
    const [picks, setPicks] = useState<PicksStore>(loadPicks);

    const getPick = useCallback(
        (matchId: number): PickSelection => {
            return picks[String(matchId)]?.selection ?? null;
        },
        [picks],
    );

    const togglePick = useCallback(
        (matchId: number, selection: PickSelection) => {
            setPicks((prev) => {
                const key = String(matchId);
                const current = prev[key]?.selection ?? null;
                const next = { ...prev };
                if (current === selection) {
                    delete next[key];
                } else {
                    next[key] = { selection, timestamp: Date.now() };
                }
                savePicks(next);
                return next;
            });
        },
        [],
    );

    const fillAllHome = useCallback(() => {
        setPicks(() => {
            const next: PicksStore = {};
            for (let i = 1; i <= 72; i++) {
                next[String(i)] = { selection: "home", timestamp: Date.now() };
            }
            savePicks(next);
            return next;
        });
    }, []);

    const fillAllAway = useCallback(() => {
        setPicks(() => {
            const next: PicksStore = {};
            for (let i = 1; i <= 72; i++) {
                next[String(i)] = { selection: "away", timestamp: Date.now() };
            }
            savePicks(next);
            return next;
        });
    }, []);

    const fillHome = useCallback((ids: number[]) => {
        setPicks((prev) => {
            const next = { ...prev };
            const now = Date.now();
            for (const id of ids) {
                next[String(id)] = { selection: "home", timestamp: now };
            }
            savePicks(next);
            return next;
        });
    }, []);

    return { picks, getPick, togglePick, fillAllHome, fillHome, fillAllAway };
}
