import type { Group } from "../types";
import { flagUrl } from "../data/countryCodes";

interface GroupSidebarProps {
    groups: Group[];
    selected: string | null;
    onSelect: (name: string) => void;
}

export function GroupSidebar({ groups, selected, onSelect }: GroupSidebarProps) {
    return (
        <nav className="sidebar">
            <h2 className="sidebar-title">Groups</h2>
            {groups.map((g) => (
                <button
                    key={g.name}
                    className={`sidebar-group${g.name === selected ? " active" : ""}`}
                    onClick={() => onSelect(g.name)}
                >
                    <span className="sidebar-group-letter">{g.name}</span>
                    <span className="sidebar-teams">
                        {g.teams.map((t) => {
                            const flag = flagUrl(t.team);
                            return (
                                <span key={t.team} className="sidebar-team">
                                    {flag && (
                                        <img
                                            className="flag flag-sm"
                                            src={flag}
                                            alt=""
                                            width="18"
                                            height="12"
                                        />
                                    )}
                                    {t.team}
                                </span>
                            );
                        })}
                    </span>
                </button>
            ))}
        </nav>
    );
}
