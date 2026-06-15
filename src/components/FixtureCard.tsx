import type { MatchFixture } from "../types";
import type { PickSelection } from "../data/useMatchPicks";
import { flagUrl } from "../data/countryCodes";
import { getMatchTimeInfo } from "../data/matchTime";
import { predictByName } from "../data/eloRatings";

interface FixtureCardProps {
    fixture: MatchFixture;
    getPick: (matchId: number) => PickSelection;
    onPick: (matchId: number, selection: PickSelection) => void;
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

export function FixtureCard({ fixture, getPick, onPick }: FixtureCardProps) {
    const timeInfo = getMatchTimeInfo(fixture);
    const prediction = predictByName(fixture.home, fixture.away);
    const homeFlag = flagUrl(fixture.home);
    const awayFlag = flagUrl(fixture.away);
    const pick = getPick(fixture.id);
    const locked = timeInfo.status !== "future";

    return (
        <div className={`matchup-card match-${timeInfo.status}`}>
            <div className="matchup-row">
                <span className="matchup-team">
                    {homeFlag && (
                        <img className="flag" src={homeFlag} alt="" width="28" height="19" />
                    )}
                    <span className="matchup-team-name">{fixture.home}</span>
                </span>
                <span className="matchup-vs">vs</span>
                <span className="matchup-team">
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
                <span className="fixture-venue">{fixture.venue}</span>
            </div>

            {prediction && (
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
                {locked && <span className="pick-locked-label">Picks locked</span>}
                <button
                    className={`pick-btn pick-home${pick === "home" ? " selected" : ""}`}
                    onClick={() => onPick(fixture.id, "home")}
                    disabled={locked}
                >
                    Home
                </button>
                <button
                    className={`pick-btn pick-tie${pick === "tie" ? " selected" : ""}`}
                    onClick={() => onPick(fixture.id, "tie")}
                    disabled={locked}
                >
                    Tie
                </button>
                <button
                    className={`pick-btn pick-away${pick === "away" ? " selected" : ""}`}
                    onClick={() => onPick(fixture.id, "away")}
                    disabled={locked}
                >
                    Away
                </button>
            </div>
        </div>
    );
}
