import { useMemo } from "react";
import { FixtureCard } from "./FixtureCard";
import { getLiveFixtures, getUpcomingFixtures } from "../data/fixtures";
import { KNOCKOUT_FIXTURES } from "../data/knockoutFixtures";
import { resolveFixture } from "../data/knockoutResolver";
import { flagUrl } from "../data/countryCodes";
import { formatLocal, getStatusFromKickoff } from "../data/matchTime";

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

    // Upcoming knockout fixtures (not yet played, future kickoff)
    const upcomingKo = useMemo(() => {
        return KNOCKOUT_FIXTURES
            .filter(f => getStatusFromKickoff(f.kickoff) === "future")
            .slice(0, 4)
            .map(f => {
                const r = resolveFixture(f.home, f.away, f.id);
                return { fixture: f, home: r.home, away: r.away };
            });
    }, []);

    const hasGroupStage = liveFixtures.length > 0 || upcomingFiltered.length > 0;

    if (!hasGroupStage && upcomingKo.length === 0) return null;

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

            {upcomingKo.length > 0 && (
                <>
                    <p className="next-match-label">Knockout · Upcoming</p>
                    <div className="next-matches-grid">
                        {upcomingKo.map(({ fixture: f, home, away }) => {
                            const homeFlag = flagUrl(home);
                            const awayFlag = flagUrl(away);
                            return (
                                <div key={f.id} className="matchup-card match-future">
                                    <div className="matchup-row">
                                        <span className="matchup-team">
                                            {homeFlag && <img className="flag" src={homeFlag} alt="" width="28" height="19" />}
                                            <span className="matchup-team-name">{home}</span>
                                        </span>
                                        <span className="matchup-vs">vs</span>
                                        <span className="matchup-team">
                                            {awayFlag && <img className="flag" src={awayFlag} alt="" width="28" height="19" />}
                                            <span className="matchup-team-name">{away}</span>
                                        </span>
                                    </div>
                                    <div className="matchup-fixture">
                                        <span className="fixture-date">{formatLocal(f.kickoff)}</span>
                                        <span className="fixture-date">{f.round} · #{f.id}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
