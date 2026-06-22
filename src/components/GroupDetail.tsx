import type { Group, TeamPercentages, MatchFixture } from "../types";
import { flagUrl } from "../data/countryCodes";
import { findFixture } from "../data/fixtures";
import { getMatchTimeInfo, type MatchStatus } from "../data/matchTime";
import { predictByName, type EloPrediction } from "../data/eloRatings";
import type { PickSelection } from "../data/pickStore";
import type { ImportedPickSet } from "../data/useImportedPicks";
import { getScrapeResult, isPickCorrect } from "../data/matchResults";
import { RESULT_DELAY_MS } from "../data/constants";
import { getStandings } from "../data/standings";

interface GroupDetailProps {
    group: Group;
    getPick: (matchId: number) => PickSelection;
    onPick: (matchId: number, selection: PickSelection) => void;
    imported: Record<string, ImportedPickSet>;
    getImportedPick: (id: string, matchId: number) => PickSelection;
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

export function GroupDetail({ group, getPick, onPick, imported, getImportedPick }: GroupDetailProps) {
    const matchups = getMatchups(group.name, group.teams);
    const allStandings = getStandings();
    const standings = allStandings[group.name] ?? [];

    return (
        <div className="detail-pane">
            <h2 className="detail-heading">Group {group.name} — Results</h2>
            <p className="detail-subtitle">
                Pick a winner (or draw) for each match
            </p>

            {standings.length > 0 && (
                <table className="standings-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team</th>
                            <th title="Points">Pts</th>
                            <th title="Played">P</th>
                            <th title="Wins">W</th>
                            <th title="Draws">D</th>
                            <th title="Losses">L</th>
                            <th title="Goals For">GF</th>
                            <th title="Goals Against">GA</th>
                            <th title="Goal Difference">GD</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((s, i) => (
                            <tr key={s.team}>
                                <td className="standings-rank">{i + 1}</td>
                                <td className="standings-team">{s.team}</td>
                                <td className="standings-pts">{s.points}</td>
                                <td>{s.played}</td>
                                <td>{s.wins}</td>
                                <td>{s.draws}</td>
                                <td>{s.losses}</td>
                                <td>{s.goalsFor}</td>
                                <td>{s.goalsAgainst}</td>
                                <td>{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <h2 className="detail-heading">Matchups</h2>

            <div className="matchups-grid">
                {matchups.map((m, i) => {
                    const matchId = m.fixture?.id;
                    const scrapeResult = matchId != null ? getScrapeResult(matchId) : null;
                    const hasResult = scrapeResult !== null && m.fixture != null && Date.now() >= m.fixture.kickoff + RESULT_DELAY_MS;
                    const pick = matchId != null ? getPick(matchId) : null;
                    const pickCorrect = matchId != null ? isPickCorrect(matchId, pick) : null;

                    return (
                        <div
                            key={i}
                            className={`matchup-card${m.status ? ` match-${m.status}` : ""}${hasResult ? " has-result" : ""}`}
                        >
                            <div className="matchup-row">
                                <span className={`matchup-team${hasResult && scrapeResult!.result === "home" ? " winner" : ""}`}>
                                    {flagUrl(m.home.team) && (
                                        <img className="flag" src={flagUrl(m.home.team)!} alt="" width="28" height="19" />
                                    )}
                                    <span className="matchup-team-name">{m.home.team}</span>
                                </span>
                                {hasResult ? (
                                    <span className="matchup-score">
                                        {scrapeResult!.homeScore}–{scrapeResult!.awayScore}
                                    </span>
                                ) : (
                                    <span className="matchup-vs">vs</span>
                                )}
                                <span className={`matchup-team${hasResult && scrapeResult!.result === "away" ? " winner" : ""}`}>
                                    {flagUrl(m.away.team) && (
                                        <img className="flag" src={flagUrl(m.away.team)!} alt="" width="28" height="19" />
                                    )}
                                    <span className="matchup-team-name">{m.away.team}</span>
                                </span>
                            </div>
                            {m.fixture && m.localTime && (
                                <div className="matchup-fixture">
                                    <span className="fixture-date">
                                        {m.localTime}
                                        {m.status && (
                                            <StatusBadge status={m.status} />
                                        )}
                                    </span>
                                    <a
                                        className="fixture-venue"
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.fixture.venue)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {m.fixture.venue}
                                    </a>
                                </div>
                            )}
                            {m.eloPrediction && !hasResult && (
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
                                        {hasResult && pickCorrect !== null && (
                                            <span className={`pick-result-badge ${pickCorrect ? "correct" : "incorrect"}`}>
                                                {pickCorrect ? "Correct ✓" : "Incorrect ✗"}
                                            </span>
                                        )}
                                        {m.status !== "future" && !hasResult && <span className="pick-locked-label">Picks locked</span>}
                                        <button
                                            className={`pick-btn pick-home${getPick(m.fixture.id) === "home" ? " selected" : ""}${hasResult && scrapeResult!.result === "home" ? " was-correct" : ""}`}
                                            onClick={() => onPick(m.fixture!.id, "home")}
                                            disabled={m.status !== "future"}
                                        >
                                            {m.home.team}
                                        </button>
                                        <button
                                            className={`pick-btn pick-draw${getPick(m.fixture.id) === "draw" ? " selected" : ""}${hasResult && scrapeResult!.result === "draw" ? " was-correct" : ""}`}
                                            onClick={() => onPick(m.fixture!.id, "draw")}
                                            disabled={m.status !== "future"}
                                        >
                                            Draw
                                        </button>
                                        <button
                                            className={`pick-btn pick-away${getPick(m.fixture.id) === "away" ? " selected" : ""}${hasResult && scrapeResult!.result === "away" ? " was-correct" : ""}`}
                                            onClick={() => onPick(m.fixture!.id, "away")}
                                            disabled={m.status !== "future"}
                                        >
                                            {m.away.team}
                                        </button>
                                    </>
                                )}
                            </div>
                            {matchId != null && (() => {
                                const friendPicksByResult: Record<string, { name: string; correct: boolean | null }[]> = {};
                                for (const f of Object.values(imported)) {
                                    const pick = getImportedPick(f.id, matchId);
                                    if (pick === null) continue;
                                    const correct = hasResult ? isPickCorrect(matchId, pick) : null;
                                    (friendPicksByResult[pick] ??= []).push({ name: f.name, correct });
                                }
                                const friendPickGroups = Object.entries(friendPicksByResult);
                                if (friendPickGroups.length === 0) return null;
                                return (
                                    <div className="friend-picks">
                                        {friendPickGroups.map(([result, people]) => {
                                            const label = result === "home" ? m.home.team : result === "away" ? m.away.team : "Draw";
                                            const correct = people[0]?.correct;
                                            return (
                                                <span key={result} className={`friend-pick fp-${result}${correct === true ? " fp-correct" : correct === false ? " fp-incorrect" : " fp-unknown"}`}>
                                                    {label}:{" "}
                                                    {people.map((p, i) => (
                                                        <span key={p.name}>
                                                            {p.name}{p.correct === true ? " ✓" : p.correct === false ? " ✗" : ""}
                                                            {i < people.length - 1 ? ", " : ""}
                                                        </span>
                                                    ))}
                                                </span>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
