import { useState, useRef } from "react";

interface SharePicksProps {
    onShare: (name: string) => string;
    onClose: () => void;
}

const BASE_URL = import.meta.env.DEV
    ? "http://localhost:5173/"
    : "https://worldcup2026.therestinmotion.com/";

export function SharePicks({ onShare, onClose }: SharePicksProps) {
    const [name, setName] = useState("");
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        setError(null);
        if (!name.trim()) {
            setError("Enter your name");
            return;
        }
        const encoded = onShare(name.trim());
        const url = `${BASE_URL}?add=${encodeURIComponent(encoded)}`;
        setShareUrl(url);
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard unavailable — user can still copy manually
        }
    };

    const handleCopy = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setError("Failed to copy — try again");
        }
    };

    const handleBack = () => {
        setShareUrl(null);
        setCopied(false);
        setError(null);
    };

    return (
        <div className="import-overlay" onClick={onClose}>
            <div className="import-modal" onClick={e => e.stopPropagation()}>
                <h3>Share picks</h3>
                {shareUrl ? (
                    <>
                        <label className="import-label">
                            Share this link with friends
                            <input
                                ref={inputRef}
                                className="import-input"
                                type="text"
                                value={shareUrl}
                                readOnly
                                onFocus={e => e.target.select()}
                            />
                        </label>
                        {error && <p className="import-error">{error}</p>}
                        <div className="import-actions">
                            <button className="import-btn import-btn-primary" onClick={handleCopy}>
                                {copied ? "Copied ✓" : "Copy link"}
                            </button>
                            <button className="import-btn import-btn-cancel" onClick={handleBack}>
                                Back
                            </button>
                        </div>
                    </>
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
                                onKeyDown={e => e.key === "Enter" && handleGenerate()}
                            />
                        </label>
                        {error && <p className="import-error">{error}</p>}
                        <div className="import-actions">
                            <button className="import-btn import-btn-primary" onClick={handleGenerate}>
                                Generate link
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
