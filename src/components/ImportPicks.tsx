import { useState } from "react";

interface ImportPicksProps {
    onImport: (encoded: string) => { name: string } | null;
    onClose: () => void;
}

export function ImportPicks({ onImport, onClose }: ImportPicksProps) {
    const [encoded, setEncoded] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = () => {
        setError(null);
        if (!encoded.trim()) {
            setError("Paste the share string");
            return;
        }
        const result = onImport(encoded.trim());
        if (result === null) {
            setError("Invalid share string — check and try again");
            return;
        }
        setSuccess(result.name);
        setTimeout(() => onClose(), 1500);
    };

    return (
        <div className="import-overlay" onClick={onClose}>
            <div className="import-modal" onClick={e => e.stopPropagation()}>
                <h3>Import picks</h3>
                {success ? (
                    <p className="import-success">Imported "{success}" ✓</p>
                ) : (
                    <>
                        <label className="import-label">
                            Share string
                            <textarea
                                className="import-textarea"
                                placeholder="Paste the share string here..."
                                value={encoded}
                                onChange={e => setEncoded(e.target.value)}
                                rows={3}
                                autoFocus
                            />
                        </label>
                        {error && <p className="import-error">{error}</p>}
                        <div className="import-actions">
                            <button className="import-btn import-btn-primary" onClick={handleSubmit}>
                                Import
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
