import { useState } from "react";

interface SharePicksProps {
    onShare: (name: string) => string;
    onClose: () => void;
}

export function SharePicks({ onShare, onClose }: SharePicksProps) {
    const [name, setName] = useState("");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleShare = () => {
        setError(null);
        if (!name.trim()) {
            setError("Enter your name");
            return;
        }
        const encoded = onShare(name.trim());
        navigator.clipboard.writeText(encoded).then(() => {
            setCopied(true);
            setTimeout(() => onClose(), 1500);
        }).catch(() => {
            setError("Failed to copy — try again");
        });
    };

    return (
        <div className="import-overlay" onClick={onClose}>
            <div className="import-modal" onClick={e => e.stopPropagation()}>
                <h3>Share picks</h3>
                {copied ? (
                    <p className="import-success">Copied ✓</p>
                ) : (
                    <>
                        <label className="import-label">
                            Your name
                            <input
                                className="import-input"
                                type="text"
                                placeholder="e.g. Alice"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoFocus
                                onKeyDown={e => e.key === "Enter" && handleShare()}
                            />
                        </label>
                        {error && <p className="import-error">{error}</p>}
                        <div className="import-actions">
                            <button className="import-btn import-btn-primary" onClick={handleShare}>
                                Copy share string
                            </button>
                            <button className="import-btn import-btn-cancel" onClick={onClose}>
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
