import { useState, useCallback } from "react";
import { loadAndNormalizePicks, savePicks } from "./pickStore";

export type PickSelection = "home" | "draw" | "away" | null;

interface PickEntry {
    selection: PickSelection;
    timestamp: number;
}

export type PicksStore = Record<string, PickEntry>;

const STORAGE_KEY = "wc2026-picks";

export function useMatchPicks() {
    const [picks, setPicks] = useState<PicksStore>(() =>
        loadAndNormalizePicks(STORAGE_KEY, (store) => savePicks(STORAGE_KEY, store))
    );

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
                savePicks(STORAGE_KEY, next);
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
            savePicks(STORAGE_KEY, next);
            return next;
        });
    }, []);

    const fillAllAway = useCallback(() => {
        setPicks(() => {
            const next: PicksStore = {};
            for (let i = 1; i <= 72; i++) {
                next[String(i)] = { selection: "away", timestamp: Date.now() };
            }
            savePicks(STORAGE_KEY, next);
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
            savePicks(STORAGE_KEY, next);
            return next;
        });
    }, []);

    return { picks, getPick, togglePick, fillAllHome, fillHome, fillAllAway };
}
