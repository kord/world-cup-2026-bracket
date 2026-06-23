import { useState, useRef, useEffect } from "react";

interface ImportPicksProps {
    onImport: (encoded: string) => { name: string } | null;
    onClose: () => void;
}

export function ImportPicks({ onImport, onClose }: ImportPicksProps) {
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleSubmit = () => {
        setError(null);
        if (!value.trim()) {
            setError("Paste the share string and press Enter");
            return;
        }
        const result = onImport(value.trim());
        if (result === null) {
            setError("Invalid share string");
            return;
        }
        setValue("");
        setError(null);
        onClose();
    };

    return (
        <div className="import-overlay" onClick={onClose}>
            <div className="import-modal" onClick={e => e.stopPropagation()}>
                <h3>Import picks</h3>
                <input
                    ref={inputRef}
                    className="import-input"
                    type="text"
                    placeholder="Paste share string and press Enter"
                    value={value}
                    onChange={e => { setValue(e.target.value); setError(null); }}
                    onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
                />
                {error && <p className="import-error">{error}</p>}
                <button className="import-btn import-btn-cancel" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
