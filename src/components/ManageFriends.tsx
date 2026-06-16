import { useState } from "react";
import type { ImportedPickSet } from "../data/useImportedPicks";
import { ImportPicks } from "./ImportPicks";

interface ManageFriendsProps {
    imported: Record<string, ImportedPickSet>;
    onImport: (encoded: string) => { name: string } | null;
    onRemove: (id: string) => void;
    onClose: () => void;
}

export function ManageFriends({ imported, onImport, onRemove, onClose }: ManageFriendsProps) {
    const [showImport, setShowImport] = useState(false);
    const entries = Object.values(imported).sort((a, b) => b.importedAt - a.importedAt);

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
                        {entries.length === 0 ? (
                            <p className="manage-empty">No imported picks yet.</p>
                        ) : (
                            <ul className="manage-list">
                                {entries.map(e => (
                                    <li key={e.id} className="manage-item">
                                        <span className="manage-name">{e.name}</span>
                                        <span className="manage-date">
                                            {new Date(e.importedAt).toLocaleDateString()}
                                        </span>
                                        <button
                                            className="manage-remove"
                                            onClick={() => onRemove(e.id)}
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

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
