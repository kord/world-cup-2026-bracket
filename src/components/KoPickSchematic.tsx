import { useMemo } from "react";
import { flagUrl } from "../data/countryCodes";
import type { KnockoutStore } from "../data/useKnockoutPicks";
import { getKoPickList } from "../data/koPickDisplay";

const LEFT_R32 = [73, 75, 74, 77, 76, 78, 79, 80];
const LEFT_R16 = [90, 89, 91, 92];
const LEFT_QF = [97, 99];
const RIGHT_R32 = [82, 81, 84, 83, 85, 87, 88, 86];
const RIGHT_R16 = [94, 93, 96, 95];
const RIGHT_QF = [98, 100];
const CENTER_IDS = [101, 103, 104, 102];

const COLUMNS = [
    { label: "R32", ids: LEFT_R32 },
    { label: "R16", ids: LEFT_R16 },
    { label: "QF", ids: LEFT_QF },
    { label: "SF/F", ids: CENTER_IDS },
    { label: "QF", ids: RIGHT_QF },
    { label: "R16", ids: RIGHT_R16 },
    { label: "R32", ids: RIGHT_R32 },
];

interface KoPickSchematicProps {
    picks: KnockoutStore;
    name: string;
    onClose: () => void;
}

export function KoPickSchematic({ picks, name, onClose }: KoPickSchematicProps) {
    const pickList = useMemo(() => getKoPickList(picks), [picks]);
    const pickMap = new Map<number, string>();
    const resolvedMap = new Map<number, boolean>();
    for (const p of pickList) {
        pickMap.set(p.matchId, p.winner);
        resolvedMap.set(p.matchId, p.winnerResolved);
    }

    return (
        <div className="import-overlay" onClick={onClose}>
            <div className="import-modal ko-schematic-modal" onClick={e => e.stopPropagation()}>
                <h3>{name}'s Knockout Picks</h3>
                <div className="ko-schematic">
                    {COLUMNS.map((col, ci) => {
                        const isCenter = ci === 3;
                        return (
                            <div key={ci} className={`ko-sch-col${isCenter ? " ko-sch-center" : ""}`}>
                                <div className="ko-sch-title">{col.label}</div>
                                <div className="ko-sch-cells">
                                    {col.ids.map(id => {
                                        const winner = pickMap.get(id);
                                        if (!winner) {
                                            return (
                                                <div key={id} className="ko-sch-cell" title={`#${id}`}>
                                                    <span className="ko-sch-empty">—</span>
                                                </div>
                                            );
                                        }
                                        const isResolved = resolvedMap.get(id) ?? false;
                                        const flag = isResolved ? flagUrl(winner) : null;
                                        const isFinal = id === 104;
                                        return (
                                            <div key={id} className={`ko-sch-cell ko-sch-picked${isFinal ? " ko-sch-final" : ""}`} title={`${winner} · #${id}`}>
                                                {flag
                                                    ? <img className="flag" src={flag} alt={winner} width={16} height={11} />
                                                    : <span className="ko-sch-empty">{winner}</span>
                                                }
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="import-actions">
                    <button className="import-btn import-btn-cancel" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}