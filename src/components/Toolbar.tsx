import type { ReactNode } from "react";

interface ToolbarProps {
    onManageFriends: () => void;
    onKnockoutPicks?: () => void;
    view?: "group" | "knockout" | "leaderboard";
    onViewChange?: (view: "group" | "knockout" | "leaderboard") => void;
    children?: ReactNode;
}

export function Toolbar({
    onManageFriends,
    onKnockoutPicks,
    view,
    onViewChange,
    children,
}: ToolbarProps) {
    return (
        <div className="toolbar">
            {view && onViewChange && (
                <div className="view-toggle">
                    <button
                        className={`toolbar-btn view-btn${view === "group" ? " active" : ""}`}
                        onClick={() => onViewChange("group")}
                    >
                        Group Stage
                    </button>
                    <button
                        className={`toolbar-btn view-btn${view === "knockout" ? " active" : ""}`}
                        onClick={() => onViewChange("knockout")}
                    >
                        Knockout
                    </button>
                    <button
                        className={`toolbar-btn view-btn${view === "leaderboard" ? " active" : ""}`}
                        onClick={() => onViewChange("leaderboard")}
                    >
                        Leaderboard
                    </button>
                </div>
            )}
            {onKnockoutPicks && (
                <button className="toolbar-btn import-picks-btn" onClick={onKnockoutPicks}>
                    🏆 Your Knockout Picks
                </button>
            )}
            <button className="toolbar-btn import-picks-btn" onClick={onManageFriends}>
                Manage friends
            </button>
            {children}
        </div>
    );
}
