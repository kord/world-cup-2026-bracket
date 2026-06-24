import { useState, useCallback } from "react";
import type { PicksStore, PickSelection } from "./useMatchPicks";

export type { PicksStore };
import { decodePicks } from "./pickEncoding";
import { normalizePicksStore } from "./pickStore";

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
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        let needsRewrite = false;
        for (const set of Object.values(parsed) as ImportedPickSet[]) {
            if (set.picks && normalizePicksStore(set.picks)) {
                needsRewrite = true;
            }
        }
        if (needsRewrite) {
            console.log("[useImportedPicks] Normalized legacy 'tie' picks — rewriting localStorage");
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
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
            const set: ImportedPickSet = { id, name: decoded.name, picks: decoded.gs, importedAt: Date.now() };
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
            return imported[id]?.picks[String(matchId)]?.selection ?? null;
        },
        [imported],
    );

    return { imported, addImported, removeImported, getImportedPick };
}
