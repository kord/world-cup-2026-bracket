import { useState, useCallback } from "react";

export type PickSelection = "home" | "draw" | "away" | null;

interface PickEntry {
    selection: PickSelection;
    timestamp: number;
}

export type PicksStore = Record<string, PickEntry>;

const STORAGE_KEY = "wc2026-picks";

function normalizePick(s: string): PickSelection {
    if (s === "tie") return "draw";
    if (s === "home" || s === "draw" || s === "away") return s;
    return null;
}

function loadPicks(): PicksStore {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        const result: PicksStore = {};
        let needsRewrite = false;
        for (const [key, val] of Object.entries(parsed)) {
            if (typeof val === "object" && val !== null && "selection" in val) {
                const entry = val as PickEntry;
                // Normalize legacy "tie" → "draw"
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
            console.log("[useMatchPicks] Normalized legacy 'tie' picks — rewriting localStorage");
            savePicks(result);
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
