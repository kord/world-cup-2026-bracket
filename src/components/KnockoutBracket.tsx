import { useState, useMemo } from "react";
import { KNOCKOUT_FIXTURES, type KnockoutFixture } from "../data/knockoutFixtures";
import { formatLocal, getStatusFromKickoff } from "../data/matchTime";
import { resolveFixture } from "../data/knockoutResolver";
import { flagUrl } from "../data/countryCodes";

function shortTeam(name: string): string {
    return name.replace("Winner ", "1").replace("Runner-up ", "2").replace("Best 3rd (", "3rd ").replace("Loser ", "L").replace(")", "");
}

function isPlaceholder(name: string): boolean {
    return /^(Winner|Runner-up|Best 3rd|Loser)\b/.test(name);
}

// ── Bracket paths (outside-in: edges feed toward center) ──────────────────

const LEFT_R32 = [73, 75, 74, 77, 76, 78, 79, 80];
const LEFT_R16 = [90, 89, 91, 92];
const LEFT_QF = [97, 99];
const RIGHT_R32 = [81, 82, 83, 84, 88, 86, 85, 87];
const RIGHT_R16 = [94, 93, 95, 96];
const RIGHT_QF = [98, 100];
const CENTER_IDS = [101, 103, 104, 102]; // SF1, 3rd, Final, SF2

interface BracketColumn { label: string; matchIds: number[]; }

function buildColumns(): BracketColumn[] {
    return [
        { label: "Round of 32", matchIds: LEFT_R32 },
        { label: "Round of 16", matchIds: LEFT_R16 },
        { label: "Quarterfinal", matchIds: LEFT_QF },
        { label: "Semis & Final", matchIds: CENTER_IDS },
        { label: "Quarterfinal", matchIds: RIGHT_QF },
        { label: "Round of 16", matchIds: RIGHT_R16 },
        { label: "Round of 32", matchIds: RIGHT_R32 },
    ];
}

const byId = new Map(KNOCKOUT_FIXTURES.map(f => [f.id, f]));
function resolveIds(ids: number[]): KnockoutFixture[] {
    return ids.map(id => byId.get(id)!).filter(Boolean);
}
function parseFeedRef(name: string): number | null {
    const m = name.match(/[WL](?:inner|oser)\s+M(\d+)/i);
    return m ? parseInt(m[1]) : null;
}

export function KnockoutBracket() {
    const [hovered, setHovered] = useState<number | null>(null);
    const columns = useMemo(() => buildColumns(), []);

    const resolved = useMemo(() => {
        const map = new Map<number, { home: string; away: string }>();
        for (const f of KNOCKOUT_FIXTURES) map.set(f.id, resolveFixture(f.home, f.away));
        return map;
    }, []);

    const nextMatchId = useMemo(() => {
        let earliest: KnockoutFixture | null = null;
        for (const f of KNOCKOUT_FIXTURES) {
            if (getStatusFromKickoff(f.kickoff) === "future" && (!earliest || f.kickoff < earliest.kickoff))
                earliest = f;
        }
        return earliest?.id ?? null;
    }, []);

    const feederIds = useMemo(() => {
        const map = new Map<number, number[]>();
        for (const f of KNOCKOUT_FIXTURES) {
            const a = parseFeedRef(f.home), b = parseFeedRef(f.away);
            if (a != null && b != null) map.set(f.id, [a, b]);
        }
        return map;
    }, []);

    const highlightedFeeders = hovered != null ? (feederIds.get(hovered) ?? []) : [];

    return (
        <div className="bracket">
            <div className="bracket-scroll">
                {columns.map((col, ci) => {
                    const isCenter = ci === 3;
                    const matches = resolveIds(col.matchIds);
                    return (
                        <div key={ci} className={`bracket-round${isCenter ? " bracket-center" : ""}`}>
                            <h3 className="bracket-round-title">{col.label}</h3>
                            <div className="bracket-matches">
                                {matches.map(f => {
                                    const r = resolved.get(f.id)!;
                                    const homeResolved = !isPlaceholder(r.home);
                                    const awayResolved = !isPlaceholder(r.away);
                                    const homeFlag = homeResolved ? flagUrl(r.home) : null;
                                    const awayFlag = awayResolved ? flagUrl(r.away) : null;
                                    const roundLabel = f.round === "Final" ? "F" : f.round === "Third Place" ? "3rd" : null;
                                    const isFeeder = highlightedFeeders.includes(f.id);
                                    const isHovered = hovered === f.id;
                                    const isNext = f.id === nextMatchId;
                                    return (
                                        <div key={f.id}
                                            className={`bracket-match${isHovered ? " bracket-hovered" : ""}${isFeeder ? " bracket-feeder" : ""}${isNext ? " bracket-next" : ""}`}
                                            onMouseEnter={() => setHovered(f.id)}
                                            onMouseLeave={() => setHovered(null)}>
                                            {roundLabel && <span className="bracket-round-label">{roundLabel}</span>}
                                            <div className="bracket-teams">
                                                <span className={`bracket-team${homeResolved ? " bracket-resolved" : ""}`} title={homeResolved ? r.home : f.home}>
                                                    {homeFlag && <img className="flag" src={homeFlag} alt="" width="18" height="12" />}
                                                    {homeResolved ? r.home : shortTeam(f.home)}
                                                </span>
                                                <span className={`bracket-team${awayResolved ? " bracket-resolved" : ""}`} title={awayResolved ? r.away : f.away}>
                                                    {awayFlag && <img className="flag" src={awayFlag} alt="" width="18" height="12" />}
                                                    {awayResolved ? r.away : shortTeam(f.away)}
                                                </span>
                                            </div>
                                            <div className="bracket-info">
                                                <span className="bracket-date">
                                                    {getStatusFromKickoff(f.kickoff) !== "future" && (
                                                        <span className={`status-badge status-${getStatusFromKickoff(f.kickoff)}`}>
                                                            {getStatusFromKickoff(f.kickoff) === "past" ? "Played" : "LIVE"}
                                                        </span>
                                                    )}
                                                    {(getStatusFromKickoff(f.kickoff) !== "future") && " "}#{f.id} · {formatLocal(f.kickoff)}
                                                    {getStatusFromKickoff(f.kickoff) === "future" && <>#{f.id} · {formatLocal(f.kickoff)}</>}
                                                </span>
                                                <a className="bracket-venue"
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.venue)}`}
                                                    target="_blank" rel="noopener noreferrer">{f.venue}</a>
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
