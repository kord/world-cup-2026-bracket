import { useState } from "react";
import type { Group } from "../types";
import { flagUrl } from "../data/countryCodes";

interface GroupSidebarProps {
    groups: Group[];
    selected: string | null;
    onSelect: (name: string) => void;
    pickCounts: Record<string, { picked: number; total: number }>;
}

function completionClass(counts: { picked: number; total: number } | undefined): string {
    if (!counts || counts.picked === 0) return "none";
    return counts.picked === counts.total ? "all" : "some";
}

export function GroupSidebar({ groups, selected, onSelect, pickCounts }: GroupSidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSelect = (name: string) => {
        onSelect(name);
        setMobileOpen(false);
    };

    const selectedGroup = groups.find(g => g.name === selected);

    return (
        <>
            {/* Desktop sidebar */}
            <nav className="sidebar">
                {groups.map((g) => (
                    <button
                        key={g.name}
                        className={`sidebar-group pick-${completionClass(pickCounts[g.name])}${g.name === selected ? " active" : ""}`}
                        onClick={() => onSelect(g.name)}
                        title={`Group ${g.name}: ${g.teams.map((t) => t.team).join(", ")}`}
                    >
                        <span className="sidebar-group-letter">Group {g.name}</span>
                        <span className="sidebar-flags">
                            {g.teams.map((t) => {
                                const flag = flagUrl(t.team);
                                return flag ? (
                                    <img key={t.team} className="flag flag-sq" src={flag} alt={t.team} width="22" height="15" />
                                ) : null;
                            })}
                        </span>
                    </button>
                ))}
            </nav>

            {/* Mobile dropdown */}
            <div className="sidebar-mobile">
                <button
                    className="sidebar-mobile-trigger"
                    onClick={() => setMobileOpen(o => !o)}
                >
                    {selectedGroup ? (
                        <>
                            <span className="sidebar-mobile-label">Group {selectedGroup.name}</span>
                            <span className="sidebar-mobile-flags">
                                {selectedGroup.teams.map((t) => {
                                    const flag = flagUrl(t.team);
                                    return flag ? (
                                        <img key={t.team} className="flag flag-sq" src={flag} alt={t.team} width="18" height="12" />
                                    ) : null;
                                })}
                            </span>
                        </>
                    ) : (
                        <span className="sidebar-mobile-label">Select group ▾</span>
                    )}
                </button>
                {mobileOpen && (
                    <>
                        <div className="sidebar-mobile-backdrop" onClick={() => setMobileOpen(false)} />
                        <div className="sidebar-mobile-dropdown">
                            {groups.map((g) => (
                                <button
                                    key={g.name}
                                    className={`sidebar-mobile-item pick-${completionClass(pickCounts[g.name])}${g.name === selected ? " active" : ""}`}
                                    onClick={() => handleSelect(g.name)}
                                >
                                    <span className="sidebar-group-letter">Group {g.name}</span>
                                    <span className="sidebar-flags">
                                        {g.teams.map((t) => {
                                            const flag = flagUrl(t.team);
                                            return flag ? (
                                                <img key={t.team} className="flag flag-sq" src={flag} alt={t.team} width="22" height="15" />
                                            ) : null;
                                        })}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
