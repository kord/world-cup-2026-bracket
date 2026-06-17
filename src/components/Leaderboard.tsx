import { useMemo } from "react";
import type { Group } from "../types";
import type { PicksStore } from "../data/useMatchPicks";
import type { ImportedPickSet } from "../data/useImportedPicks";
import { getScrapeResult, isPickCorrect } from "../data/matchResults";

interface LeaderboardProps {
    groups: Group[];
    groupFixtureIds: Record<string, number[]>;
    myPicks: PicksStore;
    imported: Record<string, ImportedPickSet>;
    onSelectGroup: (group: string) => void;
}

export function Leaderboard({ groups, groupFixtureIds, myPicks, imported, onSelectGroup }: LeaderboardProps) {
    const friends = useMemo(() => Object.values(imported), [imported]);

    // Compute per-group stats for all people
    const groupStats = useMemo(() => {
        return groups.map((group) => {
            const ids = groupFixtureIds[group.name] ?? [];
            const completedIds = ids.filter((id) => getScrapeResult(id) != null);
            const total = completedIds.length;

            const myCorrect = completedIds.filter(
                (id) => isPickCorrect(id, myPicks[String(id)]?.selection ?? null) === true,
            ).length;

            const friendStats = friends.map((friend) => {
                const correct = completedIds.filter(
                    (id) => isPickCorrect(id, friend.picks[String(id)]?.selection ?? null) === true,
                ).length;
                return correct;
            });

            // Best score across all columns (you + friends)
            const best = Math.max(myCorrect, ...friendStats);

            return { group: group.name, total, myCorrect, friendStats, best };
        });
    }, [groups, groupFixtureIds, myPicks, friends]);

    const hasFriends = friends.length > 0;

    if (groups.length === 0) {
        return <div className="leaderboard"><p>No data available.</p></div>;
    }

    const scoreClass = (correct: number, total: number, isBest: boolean): string => {
        if (total === 0) return "lb-score";
        const pct = correct / total;
        const cls = pct >= 0.7 ? "lb-high" : pct >= 0.4 ? "lb-mid" : "lb-low";
        return `lb-score ${cls}${isBest ? " lb-best" : ""}`;
    };

    return (
        <div className="leaderboard">
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Group</th>
                        <th>You</th>
                        {friends.map((f) => (
                            <th key={f.id}>{f.name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {groupStats.map((gs) => (
                        <tr key={gs.group}>
                            <td className="lb-group">
                                <button className="lb-group-link" onClick={() => onSelectGroup(gs.group)}>
                                    Group {gs.group}
                                </button>
                            </td>
                            <td className={scoreClass(gs.myCorrect, gs.total, gs.myCorrect === gs.best)}>
                                {gs.total > 0 ? `${gs.myCorrect}/${gs.total}` : "—"}
                            </td>
                            {gs.friendStats.map((correct, i) => (
                                <td key={i} className={scoreClass(correct, gs.total, correct === gs.best)}>
                                    {gs.total > 0 ? `${correct}/${gs.total}` : "—"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                {hasFriends && (() => {
                    const totalCompleted = groupStats.reduce((s, gs) => s + gs.total, 0);
                    const myTotal = groupStats.reduce((s, gs) => s + gs.myCorrect, 0);
                    const friendTotals = friends.map((_, i) =>
                        groupStats.reduce((s, gs) => s + gs.friendStats[i], 0),
                    );
                    const bestTotal = Math.max(myTotal, ...friendTotals);
                    return (
                        <tfoot>
                            <tr>
                                <td className="lb-group">Total</td>
                                <td className={scoreClass(myTotal, totalCompleted, myTotal === bestTotal)}>
                                    {totalCompleted > 0 ? `${myTotal}/${totalCompleted}` : "—"}
                                </td>
                                {friendTotals.map((ft, i) => (
                                    <td key={i} className={scoreClass(ft, totalCompleted, ft === bestTotal)}>
                                        {totalCompleted > 0 ? `${ft}/${totalCompleted}` : "—"}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    );
                })()}
            </table>
        </div>
    );
}
