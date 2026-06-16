import { useState } from "react";
import type { ImportedPickSet, PicksStore } from "../data/useImportedPicks";
import { ImportPicks } from "./ImportPicks";
import { getSuccessRate } from "../data/matchResults";

interface ManageFriendsProps {
    imported: Record<string, ImportedPickSet>;
    myPicks: PicksStore;
    onImport: (encoded: string) => { name: string } | null;
    onRemove: (id: string) => void;
    onClose: () => void;
}

function rateDisplay(rate: { correct: number; total: number }): string {
    if (rate.total === 0) return "—";
    const pct = Math.round((rate.correct / rate.total) * 100);
    return `${rate.correct}/${rate.total} (${pct}%)`;
}

export function ManageFriends({ imported, myPicks, onImport, onRemove, onClose }: ManageFriendsProps) {
    const [showImport, setShowImport] = useState(false);
    const entries = Object.values(imported).sort((a, b) => b.importedAt - a.importedAt);
    const myRate = getSuccessRate(myPicks);

    const handleImport = (encoded: string) => {
        const result = onImport(encoded);
        if (result) setShowImport(false);
        return result;
    };

    return (
        <div className="import-overlay" onClick={onClose}>
            <div className="import-modal manage-modal" onClick={e => e.stopPropagation()}>
                <h3>Manage friends</h3>

                {showImport ? (
                    <ImportPicks
                        onImport={handleImport}
                        onClose={() => setShowImport(false)}
                    />
                ) : (
                    <>
                        <ul className="manage-list">
                            <li className="manage-item manage-you">
                                <span className="manage-name">You</span>
                                <span className="manage-rate">{rateDisplay(myRate)}</span>
                            </li>
                            {entries.length === 0 ? (
                                <p className="manage-empty">No imported picks yet.</p>
                            ) : (
                                entries.map(e => {
                                    const rate = getSuccessRate(e.picks);
                                    return (
                                        <li key={e.id} className="manage-item">
                                            <span className="manage-name">{e.name}</span>
                                            <span className="manage-rate">{rateDisplay(rate)}</span>
                                            <button
                                                className="manage-remove"
                                                onClick={() => onRemove(e.id)}
                                                title="Remove"
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    );
                                })
                            )}
                        </ul>

                        <div className="import-actions">
                            <button
                                className="import-btn import-btn-primary"
                                onClick={() => setShowImport(true)}
                            >
                                Import picks
                            </button>
                            <button className="import-btn import-btn-cancel" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
