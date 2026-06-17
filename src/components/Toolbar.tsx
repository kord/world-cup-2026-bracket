import type { ReactNode } from "react";

interface ToolbarProps {
    allFuturePicked: boolean;
    confirmClear: boolean;
    onClear: () => void;
    onClearBlur: () => void;
    onShare: () => void;
    onManageFriends: () => void;
    clearLabel?: string;
    phase?: "group" | "knockout";
    onPhaseChange?: (phase: "group" | "knockout") => void;
    children?: ReactNode;
}

export function Toolbar({
    allFuturePicked,
    confirmClear,
    onClear,
    onClearBlur,
    onShare,
    onManageFriends,
    clearLabel,
    phase,
    onPhaseChange,
    children,
}: ToolbarProps) {
    return (
        <div className="toolbar">
            {phase && import.meta.env.DEV && onPhaseChange && (
                <div className="phase-toggle">
                    <button
                        className={`phase-btn${phase === "group" ? " active" : ""}`}
                        onClick={() => onPhaseChange("group")}
                    >
                        Group Stage
                    </button>
                    <button
                        className={`phase-btn${phase === "knockout" ? " active" : ""}`}
                        onClick={() => onPhaseChange("knockout")}
                    >
                        Knockout
                    </button>
                </div>
            )}
            <button
                className={`clear-picks-btn${confirmClear ? " confirm" : ""}`}
                onClick={onClear}
                onBlur={onClearBlur}
            >
                {confirmClear ? "Click again to confirm" : (clearLabel ?? "Clear all picks")}
            </button>
            <button
                className={`share-btn${!allFuturePicked ? " share-disabled" : ""}`}
                onClick={() => allFuturePicked && onShare()}
                title={
                    allFuturePicked
                        ? "Share your picks"
                        : "You need to finish your picks before sharing."
                }
            >
                Share picks
            </button>
            <button className="import-picks-btn" onClick={onManageFriends}>
                Manage friends
            </button>
            {children}
        </div>
    );
}
