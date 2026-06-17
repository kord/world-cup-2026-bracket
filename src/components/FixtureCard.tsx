import type { MatchFixture } from "../types";
import type { PickSelection } from "../data/useMatchPicks";
import type { ImportedPickSet } from "../data/useImportedPicks";
import { flagUrl } from "../data/countryCodes";
import { getMatchTimeInfo } from "../data/matchTime";
import { predictByName } from "../data/eloRatings";
import { getScrapeResult, isPickCorrect } from "../data/matchResults";

interface FixtureCardProps {
    fixture: MatchFixture;
    getPick: (matchId: number) => PickSelection;
    onPick: (matchId: number, selection: PickSelection) => void;
    imported: Record<string, ImportedPickSet>;
    getImportedPick: (id: string, matchId: number) => PickSelection;
}

function StatusBadge({ status }: { status: string }) {
    const labels: Record<string, string> = {
        past: "Played",
        live: "LIVE",
        future: "Upcoming",
    };
    return (
        <span className={`status-badge status-${status}`}>
            {labels[status] ?? status}
        </span>
    );
}

export function FixtureCard({ fixture, getPick, onPick, imported, getImportedPick }: FixtureCardProps) {
    const timeInfo = getMatchTimeInfo(fixture);
    const prediction = predictByName(fixture.home, fixture.away);
    const homeFlag = flagUrl(fixture.home);
    const awayFlag = flagUrl(fixture.away);
    const pick = getPick(fixture.id);
    const locked = timeInfo.status !== "future";
    const scrapeResult = getScrapeResult(fixture.id);
    const hasResult = scrapeResult !== null;
    const pickCorrect = hasResult ? isPickCorrect(fixture.id, pick) : null;

    // Gather friend picks for this match
    const friendPicks = Object.values(imported)
        .map(f => {
            const pick = getImportedPick(f.id, fixture.id);
            const correct = hasResult ? isPickCorrect(fixture.id, pick) : null;
            return { name: f.name, pick, correct };
        })
        .filter(f => f.pick !== null);

    return (
        <div className={`matchup-card match-${timeInfo.status}${hasResult ? " has-result" : ""}`}>
            <div className="matchup-row">
                <span className={`matchup-team${hasResult && scrapeResult!.result === "home" ? " winner" : ""}`}>
                    {homeFlag && (
                        <img className="flag" src={homeFlag} alt="" width="28" height="19" />
                    )}
                    <span className="matchup-team-name">{fixture.home}</span>
                </span>
                {hasResult ? (
                    <span className="matchup-score">
                        {scrapeResult!.homeScore}–{scrapeResult!.awayScore}
                    </span>
                ) : (
                    <span className="matchup-vs">vs</span>
                )}
                <span className={`matchup-team${hasResult && scrapeResult!.result === "away" ? " winner" : ""}`}>
                    {awayFlag && (
                        <img className="flag" src={awayFlag} alt="" width="28" height="19" />
                    )}
                    <span className="matchup-team-name">{fixture.away}</span>
                </span>
            </div>

            <div className="matchup-fixture">
                <span className="fixture-date">
                    {timeInfo.localTime}
                    <StatusBadge status={timeInfo.status} />
                </span>
                <a
                    className="fixture-venue"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fixture.venue)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {fixture.venue}
                </a>
            </div>

            {prediction && !hasResult && (
                <div className="matchup-prediction" title="Calculated using FIFA official ELO ratings">
                    <div className="pred-col">
                        <span className="pred-pct pred-home">{prediction.homeWin}%</span>
                    </div>
                    <div className="pred-col">
                        <span className="pred-pct pred-draw">{prediction.draw}%</span>
                    </div>
                    <div className="pred-col">
                        <span className="pred-pct pred-away">{prediction.awayWin}%</span>
                    </div>
                </div>
            )}

            <div className={`matchup-pick${locked ? " locked" : ""}`}>
                {hasResult && pickCorrect !== null && (
                    <span className={`pick-result-badge ${pickCorrect ? "correct" : "incorrect"}`}>
                        {pickCorrect ? "Correct ✓" : "Incorrect ✗"}
                    </span>
                )}
                {locked && !hasResult && <span className="pick-locked-label">Picks locked</span>}
                <button
                    className={`pick-btn pick-home${pick === "home" ? " selected" : ""}${hasResult && scrapeResult!.result === "home" ? " was-correct" : ""}`}
                    onClick={() => onPick(fixture.id, "home")}
                    disabled={locked}
                >
                    {fixture.home}
                </button>
                <button
                    className={`pick-btn pick-tie${pick === "tie" ? " selected" : ""}${hasResult && scrapeResult!.result === "tie" ? " was-correct" : ""}`}
                    onClick={() => onPick(fixture.id, "tie")}
                    disabled={locked}
                >
                    Tie
                </button>
                <button
                    className={`pick-btn pick-away${pick === "away" ? " selected" : ""}${hasResult && scrapeResult!.result === "away" ? " was-correct" : ""}`}
                    onClick={() => onPick(fixture.id, "away")}
                    disabled={locked}
                >
                    {fixture.away}
                </button>
            </div>

            {friendPicks.length > 0 && (
                <div className="friend-picks">
                    {friendPicks.map((fp, i) => (
                        <span
                            key={i}
                            className={`friend-pick fp-${fp.pick}${fp.correct === true ? " fp-correct" : ""}${fp.correct === false ? " fp-incorrect" : ""}`}
                        >
                            {fp.name}: {fp.pick === "home" ? "H" : fp.pick === "away" ? "A" : "T"}
                            {fp.correct === true ? " ✓" : fp.correct === false ? " ✗" : ""}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
