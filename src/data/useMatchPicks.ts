import { useState, useCallback } from "react";

export type PickSelection = "home" | "tie" | "away" | null;

const STORAGE_KEY = "wc2026-picks";

function loadPicks(): Record<string, PickSelection> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function savePicks(picks: Record<string, PickSelection>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
}

export function useMatchPicks() {
    const [picks, setPicks] = useState<Record<string, PickSelection>>(loadPicks);

    const getPick = useCallback(
        (matchId: number): PickSelection => {
            return picks[String(matchId)] ?? null;
        },
        [picks],
    );

    const togglePick = useCallback(
        (matchId: number, selection: PickSelection) => {
            setPicks((prev) => {
                const key = String(matchId);
                const current = prev[key] ?? null;
                const next = { ...prev };
                if (current === selection) {
                    delete next[key];
                } else {
                    next[key] = selection;
                }
                savePicks(next);
                return next;
            });
        },
        [],
    );

    return { picks, getPick, togglePick };
}
