import type { Group, TeamPercentages, MatchFixture } from "../types";
import { flagUrl } from "../data/countryCodes";
import { findFixture } from "../data/fixtures";
import { getMatchTimeInfo, type MatchStatus } from "../data/matchTime";
import { predictByName, type EloPrediction } from "../data/eloRatings";
import type { PickSelection } from "../data/useMatchPicks";

interface GroupDetailProps {
    group: Group;
    getPick: (matchId: number) => PickSelection;
    onPick: (matchId: number, selection: PickSelection) => void;
}

/** A single pairing of two teams with its fixture info and time data */
interface Matchup {
    home: TeamPercentages;
    away: TeamPercentages;
    fixture: MatchFixture | null;
    localTime: string | null;
    status: MatchStatus | null;
    eloPrediction: EloPrediction | null;
}

/** Sort key: kickoff timestamp (null fixtures go last) */
function sortKey(f: MatchFixture | null): number {
    if (!f) return Infinity;
    return f.kickoff;
}

/** Normalize team names to match our canonical forms */
const NAME_NORM: Record<string, string> = {
    "Korea Republic": "South Korea",
    "Türkiye": "Turkey",
    "DR Congo": "Congo DR",
    "Curaçao": "Curacao",
};
const norm = (n: string) => NAME_NORM[n] ?? n;

/** Generate all 6 pairwise matchups, sorted chronologically by fixture date */
function getMatchups(groupName: string, teams: TeamPercentages[]): Matchup[] {
    const pairs: Matchup[] = [];
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            const fixture = findFixture(groupName, teams[i].team, teams[j].team);
            const timeInfo = fixture ? getMatchTimeInfo(fixture) : null;

            // Respect the fixture's home/away ordering
            let home = teams[i];
            let away = teams[j];
            if (fixture) {
                const fixtureHomeNorm = norm(fixture.home);
                if (teams[i].team === fixtureHomeNorm) {
                    home = teams[i];
                    away = teams[j];
                } else if (teams[j].team === fixtureHomeNorm) {
                    home = teams[j];
                    away = teams[i];
                }
            }

            pairs.push({
                home,
                away,
                fixture,
                localTime: timeInfo?.localTime ?? null,
                status: timeInfo?.status ?? null,
                eloPrediction: predictByName(home.team, away.team),
            });
        }
    }
    pairs.sort((a, b) => sortKey(a.fixture) - sortKey(b.fixture));
    return pairs;
}

function TeamFlag({ team }: { team: TeamPercentages }) {
    const flag = flagUrl(team.team);
    return (
        <span className="matchup-team">
            {flag && (
                <img
                    className="flag"
                    src={flag}
                    alt=""
                    width="28"
                    height="19"
                />
            )}
            <span className="matchup-team-name">{team.team}</span>
        </span>
    );
}

function StatusBadge({ status }: { status: MatchStatus }) {
    const labels: Record<MatchStatus, string> = {
        past: "Played",
        live: "LIVE",
        future: "Upcoming",
    };
    return (
        <span className={`status-badge status-${status}`}>
            {labels[status]}
        </span>
    );
}

export function GroupDetail({ group, getPick, onPick }: GroupDetailProps) {
    const matchups = getMatchups(group.name, group.teams);

    return (
        <div className="detail-pane">
            <h2 className="detail-heading">Group {group.name} — Matchups</h2>
            <p className="detail-subtitle">
                Pick a winner (or tie) for each match &middot; times shown in your local time
            </p>

            <div className="matchups-grid">
                {matchups.map((m, i) => (
                    <div
                        key={i}
                        className={`matchup-card${m.status ? ` match-${m.status}` : ""}`}
                    >
                        <div className="matchup-row">
                            <TeamFlag team={m.home} />
                            <span className="matchup-vs">vs</span>
                            <TeamFlag team={m.away} />
                        </div>
                        {m.fixture && m.localTime && (
                            <div className="matchup-fixture">
                                <span className="fixture-date">
                                    {m.localTime}
                                    {m.status && (
                                        <StatusBadge status={m.status} />
                                    )}
                                </span>
                                <span className="fixture-venue">
                                    {m.fixture.venue}
                                </span>
                            </div>
                        )}
                        {m.eloPrediction && (
                            <div className="matchup-prediction" title="Calculated using FIFA official ELO ratings">
                                <div className="pred-col">
                                    <span className="pred-pct pred-home">
                                        {m.eloPrediction.homeWin}%
                                    </span>
                                </div>
                                <div className="pred-col">
                                    <span className="pred-pct pred-draw">
                                        {m.eloPrediction.draw}%
                                    </span>
                                </div>
                                <div className="pred-col">
                                    <span className="pred-pct pred-away">
                                        {m.eloPrediction.awayWin}%
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className={`matchup-pick${m.status !== "future" ? " locked" : ""}`}>
                            {m.fixture && (
                                <>
                                    {m.status !== "future" && <span className="pick-locked-label">Picks locked</span>}
                                    <button
                                        className={`pick-btn pick-home${getPick(m.fixture.id) === "home" ? " selected" : ""}`}
                                        onClick={() => onPick(m.fixture!.id, "home")}
                                        disabled={m.status !== "future"}
                                    >
                                        Home
                                    </button>
                                    <button
                                        className={`pick-btn pick-tie${getPick(m.fixture.id) === "tie" ? " selected" : ""}`}
                                        onClick={() => onPick(m.fixture!.id, "tie")}
                                        disabled={m.status !== "future"}
                                    >
                                        Tie
                                    </button>
                                    <button
                                        className={`pick-btn pick-away${getPick(m.fixture.id) === "away" ? " selected" : ""}`}
                                        onClick={() => onPick(m.fixture!.id, "away")}
                                        disabled={m.status !== "future"}
                                    >
                                        Away
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
