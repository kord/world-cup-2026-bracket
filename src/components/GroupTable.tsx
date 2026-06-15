import type { Group } from "../types";
import { flagUrl } from "../data/countryCodes";

interface GroupTableProps {
    group: Group;
}

/** Format a percentage value (or null) for display */
function fmtPct(pct: number | null): string {
    if (pct === null) return "—";
    return `${pct}%`;
}

export function GroupTable({ group }: GroupTableProps) {
    return (
        <div className="group-card">
            <h2 className="group-heading">Group {group.name}</h2>
            <table className="group-table">
                <thead>
                    <tr>
                        <th>Team</th>
                        <th>Win</th>
                        <th>Win Group</th>
                        <th>Qualify</th>
                    </tr>
                </thead>
                <tbody>
                    {group.teams.map((t) => {
                        const flag = flagUrl(t.team);
                        return (
                            <tr key={t.team}>
                                <td className="team-name">
                                    {flag && (
                                        <img
                                            className="flag"
                                            src={flag}
                                            alt=""
                                            width="24"
                                            height="16"
                                        />
                                    )}
                                    {t.team}
                                </td>
                                <td>{fmtPct(t.winPct)}</td>
                                <td>{fmtPct(t.winGroupPct)}</td>
                                <td>{fmtPct(t.qualifyFromGroupPct)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
