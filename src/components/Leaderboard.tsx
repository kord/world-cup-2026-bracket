import { useMemo } from "react";
import type { Group } from "../types";
import type { PicksStore } from "../data/useMatchPicks";
import type { ImportedPickSet, KnockoutStore } from "../data/useImportedPicks";
import { getScrapeResult, isPickCorrect } from "../data/matchResults";
import { getKnockoutSuccessRate } from "../data/knockoutMatchResults";

interface LeaderboardProps {
    groups: Group[];
    groupFixtureIds: Record<string, number[]>;
    myPicks: PicksStore;
    imported: Record<string, ImportedPickSet>;
    onSelectGroup: (group: string) => void;
    myKnockoutPicks?: KnockoutStore;
}

export function Leaderboard({ groups, groupFixtureIds, myPicks, imported, onSelectGroup, myKnockoutPicks }: LeaderboardProps) {
    const friends = useMemo(() => Object.values(imported), [imported]);

    // Compute per-group stats for all people (each has their own denominator)
    const groupStats = useMemo(() => {
        return groups.map((group) => {
            const ids = groupFixtureIds[group.name] ?? [];
            const completedIds = ids.filter((id) => getScrapeResult(id) != null);

            // "You" — only matches where you made a pick
            const myEligible = completedIds.filter((id) => myPicks[String(id)]?.selection != null);
            const myTotal = myEligible.length;
            const myCorrect = myEligible.filter(
                (id) => isPickCorrect(id, myPicks[String(id)]!.selection) === true,
            ).length;

            // Each friend — only matches where that friend made a pick
            const friendStats = friends.map((friend) => {
                const friendEligible = completedIds.filter((id) => friend.picks[String(id)]?.selection != null);
                const fTotal = friendEligible.length;
                const correct = friendEligible.filter(
                    (id) => isPickCorrect(id, friend.picks[String(id)]!.selection) === true,
                ).length;
                return { correct, total: fTotal };
            });

            // Best ratio for highlighting (only among those with picks)
            const ratios = [myTotal > 0 ? myCorrect / myTotal : -1];
            for (const fs of friendStats) {
                ratios.push(fs.total > 0 ? fs.correct / fs.total : -1);
            }
            const bestRatio = Math.max(...ratios);

            return { group: group.name, myTotal, myCorrect, friendStats, bestRatio };
        });
    }, [groups, groupFixtureIds, myPicks, friends]);

    const hasFriends = friends.length > 0;

    if (groups.length === 0) {
        return <div className="leaderboard"><p>No data available.</p></div>;
    }

    const scoreClass = (correct: number, total: number, bestRatio: number): string => {
        if (total === 0) return "lb-score";
        const pct = correct / total;
        const cls = pct >= 0.7 ? "lb-high" : pct >= 0.4 ? "lb-mid" : "lb-low";
        const best = pct === bestRatio && bestRatio >= 0 ? " lb-best" : "";
        return `lb-score ${cls}${best}`;
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
                            <td className={scoreClass(gs.myCorrect, gs.myTotal, gs.bestRatio)}>
                                {gs.myTotal > 0 ? `${gs.myCorrect}/${gs.myTotal}` : "—"}
                            </td>
                            {gs.friendStats.map((fs, i) => (
                                <td key={i} className={scoreClass(fs.correct, fs.total, gs.bestRatio)}>
                                    {fs.total > 0 ? `${fs.correct}/${fs.total}` : "—"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                {hasFriends && (() => {
                    const myTotalAll = groupStats.reduce((s, gs) => s + gs.myTotal, 0);
                    const myCorrectAll = groupStats.reduce((s, gs) => s + gs.myCorrect, 0);
                    const friendTotalsAll = friends.map((_, i) =>
                        groupStats.reduce((s, gs) => s + gs.friendStats[i].total, 0),
                    );
                    const friendCorrectsAll = friends.map((_, i) =>
                        groupStats.reduce((s, gs) => s + gs.friendStats[i].correct, 0),
                    );
                    const myRatio = myTotalAll > 0 ? myCorrectAll / myTotalAll : -1;
                    const bestRatioAll = Math.max(
                        myRatio,
                        ...friendTotalsAll.map((t, i) => t > 0 ? friendCorrectsAll[i] / t : -1),
                    );
                    return (
                        <tfoot>
                            <tr>
                                <td className="lb-group">Total</td>
                                <td className={scoreClass(myCorrectAll, myTotalAll, bestRatioAll)}>
                                    {myTotalAll > 0 ? `${myCorrectAll}/${myTotalAll}` : "—"}
                                </td>
                                {friendTotalsAll.map((ft, i) => (
                                    <td key={i} className={scoreClass(friendCorrectsAll[i], ft, bestRatioAll)}>
                                        {ft > 0 ? `${friendCorrectsAll[i]}/${ft}` : "—"}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    );
                })()}
            </table>

            {hasFriends && (() => {
                const myKo = getKnockoutSuccessRate(myKnockoutPicks ?? {});
                const friendKo = friends.map(f => getKnockoutSuccessRate(f.koPicks ?? {}));
                const anyKo = myKo.total > 0 || friendKo.some(f => f.total > 0);
                if (!anyKo) return null;
                return (
                    <table className="leaderboard-table" style={{ marginTop: 16 }}>
                        <thead>
                            <tr>
                                <th>Knockout</th>
                                <th>You</th>
                                {friends.map(f => <th key={f.id}>{f.name}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="lb-group">Correct</td>
                                <td className="lb-score lb-mid">{myKo.total > 0 ? `${myKo.correct}/${myKo.total}` : "—"}</td>
                                {friendKo.map((fk, i) => (
                                    <td key={i} className="lb-score lb-mid">{fk.total > 0 ? `${fk.correct}/${fk.total}` : "—"}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                );
            })()}
        </div>
    );
}
