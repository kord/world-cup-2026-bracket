import type { ReactNode } from "react";

interface ToolbarProps {
    allFuturePicked: boolean;
    confirmClear: boolean;
    onClear: () => void;
    onClearBlur: () => void;
    onShare: () => void;
    onManageFriends: () => void;
    clearLabel?: string;
    view?: "group" | "knockout" | "leaderboard";
    onViewChange?: (view: "group" | "knockout" | "leaderboard") => void;
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
    view,
    onViewChange,
    children,
}: ToolbarProps) {
    return (
        <div className="toolbar">
            {view && onViewChange && (
                <div className="view-toggle">
                    <button
                        className={`view-btn${view === "group" ? " active" : ""}`}
                        onClick={() => onViewChange("group")}
                    >
                        Group Stage
                    </button>
                    <button
                        className={`view-btn${view === "knockout" ? " active" : ""}`}
                        onClick={() => onViewChange("knockout")}
                    >
                        Knockout
                    </button>
                    <button
                        className={`view-btn${view === "leaderboard" ? " active" : ""}`}
                        onClick={() => onViewChange("leaderboard")}
                    >
                        Leaderboard
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
