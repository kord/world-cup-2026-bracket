import { useMemo } from "react";
import { FixtureCard } from "./FixtureCard";
import { getLiveFixtures, getUpcomingFixtures } from "../data/fixtures";

interface NextMatchesProps {
    getPick: (id: number) => import("../data/useMatchPicks").PickSelection;
    onPick: (id: number, sel: import("../data/useMatchPicks").PickSelection) => void;
    onSelectGroup: (name: string) => void;
    imported: Record<string, import("../data/useImportedPicks").ImportedPickSet>;
    getImportedPick: (id: string, matchId: number) => import("../data/useMatchPicks").PickSelection;
}

export function NextMatches({ getPick, onPick, onSelectGroup, imported, getImportedPick }: NextMatchesProps) {
    const liveFixtures = useMemo(() => getLiveFixtures(), []);
    const upcomingFixtures = useMemo(() => getUpcomingFixtures(), []);

    const liveIds = useMemo(() => new Set(liveFixtures.map((f) => f.id)), [liveFixtures]);
    const upcomingFiltered = useMemo(
        () => upcomingFixtures.filter((f) => !liveIds.has(f.id)),
        [upcomingFixtures, liveIds],
    );

    if (liveFixtures.length === 0 && upcomingFiltered.length === 0) return null;

    return (
        <div className="next-matches">
            {liveFixtures.length > 0 && (() => {
                const groups = [...new Set(liveFixtures.map(f => f.group))];
                const sameGroup = groups.length === 1;
                return (
                    <>
                        <p className="next-match-label">
                            Live now
                            {sameGroup && (
                                <> —{" "}
                                    <button className="next-match-group-link" onClick={() => onSelectGroup(groups[0])}>
                                        Group {groups[0]}
                                    </button></>
                            )}
                        </p>
                        <div className="next-matches-grid">
                            {liveFixtures.map((f) => (
                                <FixtureCard key={f.id} fixture={f} getPick={getPick} onPick={onPick} imported={imported} getImportedPick={getImportedPick} />
                            ))}
                        </div>
                    </>
                );
            })()}

            {upcomingFiltered.length > 0 && (() => {
                const groups = [...new Set(upcomingFiltered.map(f => f.group))];
                const sameGroup = groups.length === 1;
                return (
                    <>
                        <p className="next-match-label">
                            {upcomingFiltered.length === 1 ? "Next match" : "Next matches"}
                            {sameGroup && (
                                <> —{" "}
                                    <button className="next-match-group-link" onClick={() => onSelectGroup(groups[0])}>
                                        Group {groups[0]}
                                    </button></>
                            )}
                        </p>
                        <div className="next-matches-grid">
                            {upcomingFiltered.map((f) => (
                                <FixtureCard key={f.id} fixture={f} getPick={getPick} onPick={onPick} imported={imported} getImportedPick={getImportedPick} />
                            ))}
                        </div>
                    </>
                );
            })()}
        </div>
    );
}
