import { useState, useCallback } from "react";
import type { PicksStore, PickSelection } from "./useMatchPicks";

export type { PicksStore };
import { decodePicks } from "./pickEncoding";

export interface ImportedPickSet {
    id: string;
    name: string;
    picks: PicksStore;
    importedAt: number;
}

const STORAGE_KEY = "wc2026-imported-picks";

function loadImported(): Record<string, ImportedPickSet> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveImported(sets: Record<string, ImportedPickSet>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

export function useImportedPicks() {
    const [imported, setImported] = useState<Record<string, ImportedPickSet>>(loadImported);

    const addImported = useCallback((encoded: string): { name: string } | null => {
        try {
            const decoded = decodePicks(encoded.trim());
            if (!decoded) return null;
            const id = Date.now().toString(36);
            const set: ImportedPickSet = { id, name: decoded.name, picks: decoded.picks, importedAt: Date.now() };
            setImported(prev => {
                const next = { ...prev, [id]: set };
                saveImported(next);
                return next;
            });
            return { name: decoded.name };
        } catch {
            return null;
        }
    }, []);

    const removeImported = useCallback((id: string) => {
        setImported(prev => {
            const next = { ...prev };
            delete next[id];
            saveImported(next);
            return next;
        });
    }, []);

    const getImportedPick = useCallback(
        (id: string, matchId: number): PickSelection => {
            const sel = imported[id]?.picks[String(matchId)]?.selection ?? null;
            // Normalize legacy "tie" → "draw"
            if ((sel as string) === "tie") return "draw";
            return sel;
        },
        [imported],
    );

    return { imported, addImported, removeImported, getImportedPick };
}
