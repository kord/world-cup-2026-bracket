import type { Group, TeamPercentages, MatchFixture } from "../types";
import { flagUrl } from "../data/countryCodes";
import { findFixture } from "../data/fixtures";
import { getMatchTimeInfo, parseET, type MatchStatus } from "../data/matchTime";

interface GroupDetailProps {
    group: Group;
}

/** A single pairing of two teams with its fixture info and time data */
interface Matchup {
    home: TeamPercentages;
    away: TeamPercentages;
    fixture: MatchFixture | null;
    localTime: string | null;
    status: MatchStatus | null;
}

/** Sort key: kickoff timestamp (null fixtures go last) */
function sortKey(f: MatchFixture | null): number {
    if (!f) return Infinity;
    return parseET(f).getTime();
}

/** Generate all 6 pairwise matchups, sorted chronologically by fixture date */
function getMatchups(groupName: string, teams: TeamPercentages[]): Matchup[] {
    const pairs: Matchup[] = [];
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            const fixture = findFixture(groupName, teams[i].team, teams[j].team);
            const timeInfo = fixture ? getMatchTimeInfo(fixture) : null;
            pairs.push({
                home: teams[i],
                away: teams[j],
                fixture,
                localTime: timeInfo?.localTime ?? null,
                status: timeInfo?.status ?? null,
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

export function GroupDetail({ group }: GroupDetailProps) {
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
                        <div className="matchup-pick">
                            <button className="pick-btn pick-home">Home</button>
                            <button className="pick-btn pick-tie">Tie</button>
                            <button className="pick-btn pick-away">Away</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
