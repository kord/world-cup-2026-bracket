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
            {groups.map((g) => (
                <button
                    key={g.name}
                    className={`sidebar-group${g.name === selected ? " active" : ""}`}
                    onClick={() => onSelect(g.name)}
                    title={`Group ${g.name}: ${g.teams.map((t) => t.team).join(", ")}`}
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
                </button>
            ))}
        </nav>
    );
}
