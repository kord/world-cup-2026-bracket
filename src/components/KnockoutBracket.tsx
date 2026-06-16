import { useState, useMemo } from "react";
import { KNOCKOUT_FIXTURES, type KnockoutFixture } from "../data/knockoutFixtures";

function shortTeam(name: string): string {
    return name.replace("Winner ", "1").replace("Runner-up ", "2").replace("Best 3rd (", "3rd ").replace("Loser ", "L").replace(")", "");
}

const ROUND_ORDER = ["Round of 32", "Round of 16", "Quarterfinal", "Semifinal", "Finals"];

function parseFeedRef(name: string): number | null {
    const m = name.match(/[WL](?:inner|oser)\s+M(\d+)/i);
    return m ? parseInt(m[1]) : null;
}

const MONTHS: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

function chronoKey(f: KnockoutFixture): number {
    const p = f.date.split(" ");
    const month = MONTHS[p[1]] ?? 5;
    const day = parseInt(p[2]);
    const tm = f.time.match(/(\d+):(\d+)\s*(AM|PM)/i)!;
    let h = parseInt(tm[1]), m = parseInt(tm[2]);
    if (tm[3].toUpperCase() === "PM" && h !== 12) h += 12;
    if (tm[3].toUpperCase() === "AM" && h === 12) h = 0;
    return month * 10000 + day * 100 + h + m / 100;
}

/**
 * Order matches bracket-style: start from the final, for each match sort its
 * feeder pair chronologically, then recursively process feeders in that order.
 */
function bracketOrder(): KnockoutFixture[] {
    const byId = new Map(KNOCKOUT_FIXTURES.map(f => [f.id, f]));

    // Build feeder map: match id → [feeder1, feeder2]
    const feeders = new Map<number, [KnockoutFixture, KnockoutFixture]>();
    for (const f of KNOCKOUT_FIXTURES) {
        const a = parseFeedRef(f.home);
        const b = parseFeedRef(f.away);
        if (a != null && b != null) {
            const fa = byId.get(a);
            const fb = byId.get(b);
            if (fa && fb) feeders.set(f.id, [fa, fb]);
        }
    }

    const result: KnockoutFixture[] = [];

    function walk(id: number) {
        const pair = feeders.get(id);
        if (pair) {
            // Sort pair chronologically
            const [a, b] = pair;
            const sorted = chronoKey(a) <= chronoKey(b) ? [a, b] : [b, a];
            walk(sorted[0].id);
            walk(sorted[1].id);
        }
        const f = byId.get(id);
        if (f) result.push(f);
    }

    // Start from Final (104)
    walk(104);

    // Third-place match (103) goes after its feeders (101, 102) which are already in the result
    const tpIdx = result.findIndex(f => f.id === 102);
    const tp = byId.get(103);
    if (tp && tpIdx >= 0) result.splice(tpIdx + 1, 0, tp);

    return result;
}

function groupByRound(ordered: KnockoutFixture[]): Map<string, KnockoutFixture[]> {
    const map = new Map<string, KnockoutFixture[]>();
    for (const f of ordered) {
        const round = f.round === "Third Place" || f.round === "Final" ? "Finals" : f.round;
        const list = map.get(round) ?? [];
        list.push(f);
        map.set(round, list);
    }
    // Sort Finals chronologically
    const finals = map.get("Finals");
    if (finals) finals.sort((a, b) => chronoKey(a) - chronoKey(b));
    return map;
}

export function KnockoutBracket() {
    const [hovered, setHovered] = useState<number | null>(null);
    const grouped = useMemo(() => groupByRound(bracketOrder()), []);

    // Build feeder lookup: matchId → [feederId, feederId]
    const feederIds = useMemo(() => {
        const map = new Map<number, number[]>();
        for (const f of KNOCKOUT_FIXTURES) {
            const a = parseFeedRef(f.home);
            const b = parseFeedRef(f.away);
            if (a != null && b != null) map.set(f.id, [a, b]);
        }
        return map;
    }, []);

    const highlightedFeeders = hovered != null ? (feederIds.get(hovered) ?? []) : [];

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
                                {fixtures.map(f => {
                                    const isHovered = hovered === f.id;
                                    const isFeeder = highlightedFeeders.includes(f.id);
                                    return (
                                        <div
                                            key={f.id}
                                            className={`bracket-match${isHovered ? " bracket-hovered" : ""}${isFeeder ? " bracket-feeder" : ""}`}
                                            onMouseEnter={() => setHovered(f.id)}
                                            onMouseLeave={() => setHovered(null)}
                                        >
                                            <div className="bracket-teams">
                                                <span className="bracket-team">{shortTeam(f.home)}</span>
                                                <span className="bracket-vs">vs</span>
                                                <span className="bracket-team">{shortTeam(f.away)}</span>
                                            </div>
                                            <div className="bracket-info">
                                                <span className="bracket-date">#{f.id} · {f.date} · {f.time} ET</span>
                                                <span className="bracket-venue">{f.venue}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
