import { useState } from "react";
import type { ImportedPickSet, PicksStore } from "../data/useImportedPicks";
import { ImportPicks } from "./ImportPicks";
import { getSuccessRate } from "../data/matchResults";
import { encodePicks } from "../data/pickEncoding";

type KnockoutStore = Record<string, { selection: "home" | "away" | null; timestamp: number }>;

interface ManageFriendsProps {
    imported: Record<string, ImportedPickSet>;
    myPicks: PicksStore;
    onImport: (encoded: string) => { name: string } | null;
    onRemove: (id: string) => void;
    onClose: () => void;
    myKnockoutPicks?: KnockoutStore;
}

function rateDisplay(rate: { correct: number; total: number }): string {
    if (rate.total === 0) return "—";
    const pct = Math.round((rate.correct / rate.total) * 100);
    return `${rate.correct}/${rate.total} (${pct}%)`;
}

export function ManageFriends({ imported, myPicks, onImport, onRemove, onClose, myKnockoutPicks }: ManageFriendsProps) {
    const [showImport, setShowImport] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showNameInput, setShowNameInput] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [shareName, setShareName] = useState("");
    const [copied, setCopied] = useState(false);
    const entries = Object.values(imported).sort((a, b) => b.importedAt - a.importedAt);
    const myRate = getSuccessRate(myPicks);

    const handleImport = (encoded: string) => {
        const result = onImport(encoded);
        if (result) setShowImport(false);
        return result;
    };

    const generateUrl = () => {
        const name = shareName.trim();
        if (!name) return;
        const encoded = encodePicks(name, myPicks, myKnockoutPicks ?? {});
        const base = import.meta.env.PROD
            ? "https://worldcup2026.therestinmotion.com/?add="
            : window.location.origin + "/?add=";
        const url = base + encoded;
        setShareUrl(url);
        setShowNameInput(false);
        setShowShare(true);
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }).catch(() => { });
    };

    const openShare = () => {
        setShareName("");
        setShowNameInput(true);
    };

    const copyShareUrl = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { }
    };

    const copyFriendUrl = (name: string, picks: PicksStore) => {
        const encoded = encodePicks(name, picks, {});
        const base = import.meta.env.PROD
            ? "https://worldcup2026.therestinmotion.com/?add="
            : window.location.origin + "/?add=";
        const url = base + encoded;
        navigator.clipboard.writeText(url).catch(() => { });
    };

    return (
        <div className="import-overlay" onClick={onClose}>
            <div className="import-modal manage-modal" onClick={e => e.stopPropagation()}>
                <h3>Manage friends</h3>

                {showImport ? (
                    <ImportPicks onImport={handleImport} onClose={() => setShowImport(false)} />
                ) : showNameInput ? (
                    <div className="share-modal">
                        <h4>Your name</h4>
                        <input
                            className="import-input"
                            type="text"
                            placeholder="Enter your name"
                            value={shareName}
                            onChange={e => setShareName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") generateUrl(); }}
                            autoFocus
                        />
                        <div className="import-actions">
                            <button className="import-btn import-btn-primary" onClick={generateUrl} disabled={!shareName.trim()}>Generate</button>
                            <button className="import-btn import-btn-cancel" onClick={() => setShowNameInput(false)}>Cancel</button>
                        </div>
                    </div>
                ) : showShare ? (
                    <div className="share-modal">
                        <h4>Your share link</h4>
                        <input className="import-input" readOnly value={shareUrl} onClick={e => (e.target as HTMLInputElement).select()} />
                        <div className="import-actions">
                            <button className="import-btn import-btn-primary" onClick={copyShareUrl}>{copied ? "✓ Copied!" : "Copy"}</button>
                            <button className="import-btn import-btn-cancel" onClick={() => { setShowShare(false); setCopied(false); }}>Close</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <ul className="manage-list">
                            <li className="manage-item manage-you">
                                <span className="manage-name">You</span>
                                <span className="manage-rate">{rateDisplay(myRate)}</span>
                                <span className="manage-copy" aria-hidden="true" style={{ visibility: "hidden" }}>📋</span>
                                <span className="manage-remove" aria-hidden="true" style={{ visibility: "hidden" }}>✕</span>
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
                                            <button className="manage-copy" onClick={() => copyFriendUrl(e.name, e.picks)} title="Copy">📋</button>
                                            <button className="manage-remove" onClick={() => onRemove(e.id)} title="Remove">✕</button>
                                        </li>
                                    );
                                })
                            )}
                        </ul>

                        <div className="import-actions">
                            <button className="import-btn import-btn-primary" onClick={openShare}>Share</button>
                            <button className="import-btn import-btn-primary" onClick={() => setShowImport(true)}>Import</button>
                            <button className="import-btn import-btn-cancel" onClick={onClose}>Close</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
