import { useState, useMemo, useCallback } from "react";
import { KNOCKOUT_FIXTURES, type KnockoutFixture } from "../data/knockoutFixtures";
import { resolveFixture } from "../data/knockoutResolver";
import { flagUrl } from "../data/countryCodes";
import type { KnockoutPick, KnockoutStore } from "../data/useKnockoutPicks";
import { useMatchPicks } from "../data/useMatchPicks";
import { formatLocal } from "../data/matchTime";
import { encodePicks } from "../data/pickEncoding";

interface KnockoutPickModalProps {
    onClose: () => void;
    getPick: (matchId: number) => KnockoutPick;
    togglePick: (matchId: number, selection: KnockoutPick) => void;
    picks: KnockoutStore;
    clearAll: () => void;
}

function isPlaceholder(name: string): boolean {
    return /^(Winner|Runner-up|Best 3rd|Loser)\b/.test(name);
}

function parseFeedRef(name: string): number | null {
    const m = name.match(/[WL](?:inner|oser)\s+M(\d+)/i);
    return m ? parseInt(m[1]) : null;
}

function shortTeam(name: string): string {
    return name.replace("Winner ", "1").replace("Runner-up ", "2").replace("Best 3rd (", "3rd ").replace("Loser ", "L").replace(")", "");
}

const ROUND_DEFS: { label: string; ids: number[] }[] = [
    { label: "Round of 32", ids: [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88] },
    { label: "Round of 16", ids: [89, 90, 91, 92, 93, 94, 95, 96] },
    { label: "Quarterfinal", ids: [97, 98, 99, 100] },
    { label: "Semifinal", ids: [101, 102] },
    { label: "Third Place", ids: [103] },
    { label: "Final", ids: [104] },
];

interface MatchDisplay {
    fixture: KnockoutFixture;
    home: string;
    away: string;
    homeResolved: boolean;
    awayResolved: boolean;
}

export function KnockoutPickModal({ onClose, getPick, togglePick, picks, clearAll }: KnockoutPickModalProps) {
    const { picks: gsPicks } = useMatchPicks();
    const [shareName, setShareName] = useState("");
    const [shareUrl, setShareUrl] = useState("");
    const [copied, setCopied] = useState(false);

    // Per-round ordering: start with fixture-ID order, skip moves to end of round
    const [roundOrders, setRoundOrders] = useState<number[][]>(() =>
        ROUND_DEFS.map(r => [...r.ids]),
    );

    // Resolve all slots using actual results + user picks (same logic as KnockoutBracket)
    const resolved = useMemo(() => {
        const map = new Map<number, { home: string; away: string }>();
        for (const f of KNOCKOUT_FIXTURES) {
            map.set(f.id, resolveFixture(f.home, f.away, f.id));
        }

        const readPick = (id: number): KnockoutPick =>
            (picks[String(id)]?.selection as KnockoutPick) ?? null;

        const resolveSlot = (name: string, visited: Set<number>): string => {
            const id = parseFeedRef(name);
            if (id == null || visited.has(id)) return name;
            visited.add(id);
            const feeder = map.get(id);
            if (!feeder) return name;
            const pick = readPick(id);
            const isLoser = /^Loser\b/i.test(name);
            if (pick === "home") return resolveSlot(isLoser ? feeder.away : feeder.home, visited);
            if (pick === "away") return resolveSlot(isLoser ? feeder.home : feeder.away, visited);
            return name;
        };

        for (const f of KNOCKOUT_FIXTURES) {
            const r = map.get(f.id);
            if (!r) continue;
            map.set(f.id, {
                home: resolveSlot(r.home, new Set()),
                away: resolveSlot(r.away, new Set()),
            });
        }
        return map;
    }, [picks]);

    // Build display data for all matches
    const displayMap = useMemo(() => {
        const map = new Map<number, MatchDisplay>();
        for (const f of KNOCKOUT_FIXTURES) {
            const r = resolved.get(f.id);
            const home = r?.home ?? f.home;
            const away = r?.away ?? f.away;
            map.set(f.id, {
                fixture: f,
                home,
                away,
                homeResolved: !isPlaceholder(home),
                awayResolved: !isPlaceholder(away),
            });
        }
        return map;
    }, [resolved]);

    // Find current round: first round that still has unpicked matches
    const currentRoundIdx = useMemo(() => {
        for (let ri = 0; ri < ROUND_DEFS.length; ri++) {
            const order = roundOrders[ri];
            if (order.some(id => getPick(id) == null)) return ri;
        }
        return ROUND_DEFS.length; // all done
    }, [roundOrders, getPick]);

    // Current match: first unpicked in the current round's order
    const currentMatchId = useMemo(() => {
        if (currentRoundIdx >= ROUND_DEFS.length) return null;
        const order = roundOrders[currentRoundIdx];
        return order.find(id => getPick(id) == null) ?? null;
    }, [currentRoundIdx, roundOrders, getPick]);

    const total = KNOCKOUT_FIXTURES.length;
    const totalPicked = useMemo(() => {
        let count = 0;
        for (const f of KNOCKOUT_FIXTURES) {
            if (getPick(f.id) != null) count++;
        }
        return count;
    }, [getPick]);

    const currentRoundRemaining = useMemo(() => {
        if (currentRoundIdx >= ROUND_DEFS.length) return 0;
        return roundOrders[currentRoundIdx].filter(id => getPick(id) == null).length;
    }, [currentRoundIdx, roundOrders, getPick]);

    const handlePick = useCallback(
        (matchId: number, sel: "home" | "away") => {
            togglePick(matchId, sel);
        },
        [togglePick],
    );

    const handleSkip = useCallback(() => {
        if (currentMatchId == null || currentRoundIdx >= ROUND_DEFS.length) return;
        setRoundOrders(prev => {
            const next = prev.map(r => [...r]);
            const order = next[currentRoundIdx];
            const idx = order.indexOf(currentMatchId);
            if (idx >= 0) {
                order.splice(idx, 1);
                order.push(currentMatchId);
            }
            return next;
        });
    }, [currentMatchId, currentRoundIdx]);

    // All-done state: every match in every round has been picked
    if (currentRoundIdx >= ROUND_DEFS.length) {
        const final = resolved.get(104);
        const third = resolved.get(103);
        const finalPick = getPick(104);
        const thirdPick = getPick(103);

        const first = finalPick === "home" ? final?.home : finalPick === "away" ? final?.away : null;
        const second = finalPick === "home" ? final?.away : finalPick === "away" ? final?.home : null;
        const thirdPlace = thirdPick === "home" ? third?.home : thirdPick === "away" ? third?.away : null;
        const fourth = thirdPick === "home" ? third?.away : thirdPick === "away" ? third?.home : null;

        const positions = [
            { pos: "🥇 1st", team: first, flag: first && !isPlaceholder(first) ? flagUrl(first) : null },
            { pos: "🥈 2nd", team: second, flag: second && !isPlaceholder(second) ? flagUrl(second) : null },
            { pos: "🥉 3rd", team: thirdPlace, flag: thirdPlace && !isPlaceholder(thirdPlace) ? flagUrl(thirdPlace) : null },
            { pos: "4th", team: fourth, flag: fourth && !isPlaceholder(fourth) ? flagUrl(fourth) : null },
        ];

        const generateShareUrl = () => {
            const name = shareName.trim();
            if (!name) return;
            const encoded = encodePicks(name, gsPicks, picks);
            const base = import.meta.env.PROD
                ? "https://worldcup2026.therestinmotion.com/?add="
                : window.location.origin + "/?add=";
            const url = base + encoded;
            setShareUrl(url);
            navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            }).catch(() => { });
        };

        return (
            <div className="import-overlay" onClick={onClose}>
                <div className="import-modal ko-pick-modal" onClick={e => e.stopPropagation()}>
                    <h3>Your Knockout Picks</h3>
                    <p className="ko-pick-progress">
                        ✓ All {total} matches picked
                    </p>

                    <table className="ko-summary-table">
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>Team</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positions.map(p => (
                                <tr key={p.pos}>
                                    <td className="ko-summary-pos">{p.pos}</td>
                                    <td className="ko-summary-team">
                                        {p.flag && <img className="flag" src={p.flag} alt="" width="18" height="12" />}
                                        {p.team ? (isPlaceholder(p.team) ? shortTeam(p.team) : p.team) : <span className="ko-summary-unresolved">—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!shareUrl ? (
                        <div className="ko-share-section">
                            <input
                                className="import-input"
                                type="text"
                                placeholder="Enter your name to share"
                                value={shareName}
                                onChange={e => setShareName(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") generateShareUrl(); }}
                                autoFocus
                            />
                            <div className="import-actions">
                                <button className="import-btn import-btn-primary" onClick={generateShareUrl} disabled={!shareName.trim()}>
                                    Share
                                </button>
                                <button className="import-btn import-btn-cancel" onClick={() => { clearAll(); onClose(); }}>
                                    Start Over
                                </button>
                                <button className="import-btn import-btn-cancel" onClick={onClose}>Close</button>
                            </div>
                        </div>
                    ) : (
                        <div className="ko-share-section">
                            <img
                                className="ko-qr-code"
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`}
                                alt="QR code for sharing"
                                width="160"
                                height="160"
                            />
                            <input className="import-input" readOnly value={shareUrl} onClick={e => (e.target as HTMLInputElement).select()} />
                            <p className="ko-share-hint">Share this URL or QR code so others can see your picks.</p>
                            <div className="import-actions">
                                <button className="import-btn import-btn-primary" onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                                    {copied ? "✓ Copied!" : "Copy"}
                                </button>
                                <button className="import-btn import-btn-cancel" onClick={() => { clearAll(); onClose(); }}>
                                    Start Over
                                </button>
                                <button className="import-btn import-btn-cancel" onClick={onClose}>Close</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const match = displayMap.get(currentMatchId!)!;
    const currentRound = ROUND_DEFS[currentRoundIdx];
    const pick = getPick(match.fixture.id);
    const homeFlag = match.homeResolved ? flagUrl(match.home) : null;
    const awayFlag = match.awayResolved ? flagUrl(match.away) : null;
    const homeDisplay = match.homeResolved ? match.home : shortTeam(match.home);
    const awayDisplay = match.awayResolved ? match.away : shortTeam(match.away);

    return (
        <div className="import-overlay" onClick={onClose}>
            <div className="import-modal ko-pick-modal" onClick={e => e.stopPropagation()}>
                <h3>Knockout Picks</h3>
                <p className="ko-pick-progress">
                    {totalPicked} / {total} picks made · <strong>{currentRound.label}</strong>
                    {currentRoundRemaining > 1 && <> · {currentRoundRemaining} left in round</>}
                </p>

                <div className="ko-pick-match">
                    <div className="ko-pick-round">
                        {match.fixture.round} · #{match.fixture.id}
                    </div>
                    <div className="ko-pick-teams">
                        <button
                            className={`ko-pick-team${pick === "home" ? " ko-pick-selected" : ""}${!match.homeResolved ? " ko-pick-placeholder" : ""}`}
                            onClick={() => handlePick(match.fixture.id, "home")}
                            title={match.home}
                        >
                            {homeFlag && <img className="flag" src={homeFlag} alt="" width="28" height="19" />}
                            <span>{homeDisplay}</span>
                            {pick === "home" && <span className="ko-pick-check">✓</span>}
                        </button>
                        <span className="ko-pick-vs">vs</span>
                        <button
                            className={`ko-pick-team${pick === "away" ? " ko-pick-selected" : ""}${!match.awayResolved ? " ko-pick-placeholder" : ""}`}
                            onClick={() => handlePick(match.fixture.id, "away")}
                            title={match.away}
                        >
                            {awayFlag && <img className="flag" src={awayFlag} alt="" width="28" height="19" />}
                            <span>{awayDisplay}</span>
                            {pick === "away" && <span className="ko-pick-check">✓</span>}
                        </button>
                    </div>
                    <div className="ko-pick-venue">
                        {formatLocal(match.fixture.kickoff)}
                        {" · "}
                        <a
                            className="bracket-venue"
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.fixture.venue)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {match.fixture.venue}
                        </a>
                    </div>
                </div>

                <div className="import-actions">
                    <button className="import-btn import-btn-cancel" onClick={handleSkip}>
                        Skip
                    </button>
                    <button className="import-btn import-btn-cancel" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
