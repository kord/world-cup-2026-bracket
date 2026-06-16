import { KNOCKOUT_FIXTURES, type KnockoutFixture } from "../data/knockoutFixtures";

/** Short display code for a placeholder team */
function shortTeam(name: string): string {
    return name
        .replace("Winner ", "1")
        .replace("Runner-up ", "2")
        .replace("Best 3rd (", "3rd ")
        .replace("Loser ", "L")
        .replace(")", "");
}

/** Group fixtures by round, preserving order */
function groupByRound(fixtures: KnockoutFixture[]): Map<string, KnockoutFixture[]> {
    const map = new Map<string, KnockoutFixture[]>();
    for (const f of fixtures) {
        const list = map.get(f.round) ?? [];
        list.push(f);
        map.set(f.round, list);
    }
    return map;
}

const ROUND_ORDER = ["Round of 32", "Round of 16", "Quarterfinal", "Semifinal", "Third Place", "Final"];

export function KnockoutBracket() {
    const grouped = groupByRound(KNOCKOUT_FIXTURES);

    return (
        <div className="bracket">
            <div className="bracket-scroll">
                {ROUND_ORDER.map(round => {
                    const fixtures = grouped.get(round);
                    if (!fixtures || fixtures.length === 0) return null;
                    return (
                        <div key={round} className="bracket-round">
                            <h3 className="bracket-round-title">{round}</h3>
                            <div className="bracket-matches">
                                {fixtures.map(f => (
                                    <div key={f.id} className="bracket-match">
                                        <div className="bracket-teams">
                                            <span className="bracket-team">{shortTeam(f.home)}</span>
                                            <span className="bracket-vs">vs</span>
                                            <span className="bracket-team">{shortTeam(f.away)}</span>
                                        </div>
                                        <div className="bracket-info">
                                            <span className="bracket-date">{f.date} · {f.time} ET</span>
                                            <span className="bracket-venue">{f.venue}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
