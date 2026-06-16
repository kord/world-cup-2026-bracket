import { useState, useMemo } from "react";
import { KNOCKOUT_FIXTURES, type KnockoutFixture } from "../data/knockoutFixtures";
import { formatLocal, getStatusFromKickoff } from "../data/matchTime";

function shortTeam(name: string): string {
    return name.replace("Winner ", "1").replace("Runner-up ", "2").replace("Best 3rd (", "3rd ").replace("Loser ", "L").replace(")", "");
}

const ROUND_ORDER = ["Round of 32", "Round of 16", "Quarterfinal", "Semifinal", "Finals"];

function chronoKey(f: KnockoutFixture): number { return f.kickoff; }

function parseFeedRef(name: string): number | null {
    const m = name.match(/[WL](?:inner|oser)\s+M(\d+)/i);
    return m ? parseInt(m[1]) : null;
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

    // Find the single next upcoming match
    const nextMatchId = useMemo(() => {
        let earliest: KnockoutFixture | null = null;
        for (const f of KNOCKOUT_FIXTURES) {
            if (getStatusFromKickoff(f.kickoff) === "future" && (!earliest || f.kickoff < earliest.kickoff)) {
                earliest = f;
            }
        }
        return earliest?.id ?? null;
    }, []);

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
                                                <span className="bracket-date">
                                                    {(getStatusFromKickoff(f.kickoff) !== "future" || f.id === nextMatchId) && (
                                                        <span className={`status-badge status-${getStatusFromKickoff(f.kickoff)}`}>
                                                            {getStatusFromKickoff(f.kickoff) === "past" ? "Played" : getStatusFromKickoff(f.kickoff) === "live" ? "LIVE" : "Upcoming"}
                                                        </span>
                                                    )}
                                                    {(getStatusFromKickoff(f.kickoff) !== "future" || f.id === nextMatchId) && " "}#{f.id} · {formatLocal(f.kickoff)}
                                                </span>
                                                <a
                                                    className="bracket-venue"
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.venue)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {f.venue}
                                                </a>
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
