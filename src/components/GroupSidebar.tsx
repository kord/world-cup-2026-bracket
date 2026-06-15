import type { Group } from "../types";
import { flagUrl } from "../data/countryCodes";

interface GroupSidebarProps {
    groups: Group[];
    selected: string | null;
    onSelect: (name: string) => void;
    pickCounts: Record<string, { picked: number; total: number }>;
}

export function GroupSidebar({ groups, selected, onSelect, pickCounts }: GroupSidebarProps) {
    return (
        <nav className="sidebar">
            {groups.map((g) => {
                const counts = pickCounts[g.name];
                const completion =
                    !counts ? "none"
                        : counts.picked === 0 ? "none"
                            : counts.picked === counts.total ? "all"
                                : "some";

                return (
                    <button
                        key={g.name}
                        className={`sidebar-group pick-${completion}${g.name === selected ? " active" : ""}`}
                        onClick={() => onSelect(g.name)}
                        title={`Group ${g.name}: ${g.teams.map((t) => t.team).join(", ")} (${counts?.picked ?? 0}/${counts?.total ?? 6} picked)`}
                    >
                        <span className="sidebar-group-letter">Group {g.name}</span>
                        <span className="sidebar-flags">
                            {g.teams.map((t) => {
                                const flag = flagUrl(t.team);
                                return flag ? (
                                    <img
                                        key={t.team}
                                        className="flag flag-sq"
                                        src={flag}
                                        alt={t.team}
                                        width="22"
                                        height="15"
                                    />
                                ) : null;
                            })}
                        </span>
                        {counts && counts.picked > 0 && (
                            <span className="sidebar-pick-count">
                                {counts.picked}/{counts.total}
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
