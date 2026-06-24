import { useMemo, useState } from "react";
import { getStandings } from "../data/standings";
import { getAllElos } from "../data/eloRatings";
import { getGroups } from "../data/teams";

interface TeamRow {
    team: string;
    group: string;
    elo: number | null;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    gf: number;
    ga: number;
    gd: number;
    points: number;
}

type SortKey = keyof TeamRow;
type SortDir = "asc" | "desc";

interface AllTeamsModalProps {
    onClose: () => void;
}

export function AllTeamsModal({ onClose }: AllTeamsModalProps) {
    const [sortKey, setSortKey] = useState<SortKey>("points");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const teams = useMemo(() => {
        const standings = getStandings();
        const elos = getAllElos();
        const groups = getGroups();
        const groupMap = new Map<string, string>();
        for (const g of groups) {
            for (const t of g.teams) {
                groupMap.set(t.team, g.name);
            }
        }

        const rows: TeamRow[] = [];
        for (const [, list] of Object.entries(standings)) {
            for (const s of list) {
                rows.push({
                    team: s.team,
                    group: groupMap.get(s.team) ?? "?",
                    elo: elos[s.team] ?? null,
                    played: s.played,
                    wins: s.wins,
                    draws: s.draws,
                    losses: s.losses,
                    gf: s.goalsFor,
                    ga: s.goalsAgainst,
                    gd: s.goalDiff,
                    points: s.points,
                });
            }
        }
        // Add any teams not yet in standings
        for (const [team, group] of groupMap) {
            if (!rows.find(r => r.team === team)) {
                rows.push({
                    team,
                    group,
                    elo: elos[team] ?? null,
                    played: 0, wins: 0, draws: 0, losses: 0,
                    gf: 0, ga: 0, gd: 0, points: 0,
                });
            }
        }
        return rows;
    }, []);

    const sorted = useMemo(() => {
        const dir = sortDir === "asc" ? 1 : -1;
        return [...teams].sort((a, b) => {
            const av = a[sortKey];
            const bv = b[sortKey];
            if (av === null && bv === null) return 0;
            if (av === null) return 1;
            if (bv === null) return -1;
            if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
            return ((av as number) - (bv as number)) * dir;
        });
    }, [teams, sortKey, sortDir]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    };

    const arrow = (key: SortKey) => sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";

    return (
        <div className="import-overlay" onClick={onClose}>
            <div className="all-teams-modal" onClick={e => e.stopPropagation()}>
                <h3>All Teams</h3>
                <div className="all-teams-table-wrap">
                    <table className="all-teams-table">
                        <thead>
                            <tr>
                                <th onClick={() => toggleSort("team")}>Team{arrow("team")}</th>
                                <th onClick={() => toggleSort("group")}>Grp{arrow("group")}</th>
                                <th onClick={() => toggleSort("elo")} title="ELO rating">Elo{arrow("elo")}</th>
                                <th onClick={() => toggleSort("points")} title="Points">Pts{arrow("points")}</th>
                                <th onClick={() => toggleSort("played")} title="Played">P{arrow("played")}</th>
                                <th onClick={() => toggleSort("wins")} title="Wins">W{arrow("wins")}</th>
                                <th onClick={() => toggleSort("draws")} title="Draws">D{arrow("draws")}</th>
                                <th onClick={() => toggleSort("losses")} title="Losses">L{arrow("losses")}</th>
                                <th onClick={() => toggleSort("gf")} title="Goals For">GF{arrow("gf")}</th>
                                <th onClick={() => toggleSort("ga")} title="Goals Against">GA{arrow("ga")}</th>
                                <th onClick={() => toggleSort("gd")} title="Goal Difference">GD{arrow("gd")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map(t => (
                                <tr key={t.team}>
                                    <td className="all-teams-name">{t.team}</td>
                                    <td>{t.group}</td>
                                    <td>{t.elo?.toFixed(0) ?? "—"}</td>
                                    <td className="all-teams-pts">{t.points}</td>
                                    <td>{t.played}</td>
                                    <td>{t.wins}</td>
                                    <td>{t.draws}</td>
                                    <td>{t.losses}</td>
                                    <td>{t.gf}</td>
                                    <td>{t.ga}</td>
                                    <td>{t.gd > 0 ? `+${t.gd}` : t.gd}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button className="import-btn import-btn-cancel" onClick={onClose} style={{ marginTop: 12 }}>
                    Close
                </button>
            </div>
        </div>
    );
}
