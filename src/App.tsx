import { useState, useMemo } from "react";
import { getGroups } from "./data/teams";
import { GroupSidebar } from "./components/GroupSidebar";
import { GroupDetail } from "./components/GroupDetail";
import { NextMatches } from "./components/NextMatches";
import { SharePicks } from "./components/SharePicks";
import { ManageFriends } from "./components/ManageFriends";
import { useMatchPicks } from "./data/useMatchPicks";
import { useImportedPicks } from "./data/useImportedPicks";
import { getGroupFixtureIds, getFutureFixtureIds } from "./data/fixtures";
import { encodePicks } from "./data/pickEncoding";

function App() {
  const groups = getGroups();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [phase, setPhase] = useState<"group" | "knockout">("group");
  const { picks, getPick, togglePick, fillAllHome, fillHome } = useMatchPicks();
  const { imported, addImported, removeImported, getImportedPick } = useImportedPicks();

  // Compute pick completion per group (only future matches count)
  const groupFixtureIds = useMemo(() => getGroupFixtureIds(), []);
  const futureIds = useMemo(() => getFutureFixtureIds(), []);
  const futureIdSet = useMemo(() => new Set(futureIds), [futureIds]);
  const groupPickCounts = useMemo(() => {
    const counts: Record<string, { picked: number; total: number }> = {};
    for (const [group, ids] of Object.entries(groupFixtureIds)) {
      const futureGroupIds = ids.filter((id) => futureIdSet.has(id));
      const picked = futureGroupIds.filter((id) => picks[String(id)] != null).length;
      counts[group] = { picked, total: futureGroupIds.length };
    }
    return counts;
  }, [picks, groupFixtureIds, futureIdSet]);

  const activeGroup = groups.find((g) => g.name === selectedGroup) ?? null;

  const allFuturePicked = useMemo(() => {
    return futureIds.length > 0 && futureIds.every((id) => picks[String(id)] != null);
  }, [futureIds, picks]);

  const handleShare = (name: string): string => {
    return encodePicks(name, picks);
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    localStorage.removeItem("wc2026-picks");
    window.location.reload();
  };

  return (
    <div className="app">
      <header className="app-header">
        {import.meta.env.DEV && (
          <div className="phase-toggle">
            <button
              className={`phase-btn${phase === "group" ? " active" : ""}`}
              onClick={() => setPhase("group")}
            >
              Group Stage
            </button>
            <button
              className={`phase-btn${phase === "knockout" ? " active" : ""}`}
              onClick={() => setPhase("knockout")}
            >
              Knockout
            </button>
          </div>
        )}
        <h1 onClick={() => setSelectedGroup(null)}>
          World Cup 2026 — {phase === "group" ? "Group Stage" : "Knockout Phase"}
        </h1>
        <p className="subtitle">
          {phase === "group"
            ? "48 teams · 12 groups · Pick your winners"
            : "Round of 32 → Final · Coming soon"}
        </p>
        <button
          className={`clear-picks-btn${confirmClear ? " confirm" : ""}`}
          onClick={handleClear}
          onBlur={() => setConfirmClear(false)}
        >
          {confirmClear ? "Click again to confirm" : "Clear all picks"}
        </button>
        {allFuturePicked && (
          <button className="share-btn" onClick={() => setShowShare(true)}>
            Share picks
          </button>
        )}
        <button className="import-picks-btn" onClick={() => setShowManage(true)}>
          Manage friends
        </button>
        {import.meta.env.DEV && (
          <>
            <button className="clear-picks-btn dev-btn" onClick={fillAllHome}>
              Fill all home wins
            </button>
            <button className="clear-picks-btn dev-btn" onClick={() => fillHome(futureIds)}>
              Fill future home wins
            </button>
          </>
        )}
      </header>

      <div className="app-body">
        {phase === "group" && (
          <GroupSidebar
            groups={groups}
            selected={selectedGroup}
            onSelect={setSelectedGroup}
            pickCounts={groupPickCounts}
          />
        )}

        <main className="main-content">
          {phase === "knockout" ? (
            <div className="placeholder">
              <p>Knockout phase bracket coming soon.</p>
            </div>
          ) : activeGroup ? (
            <GroupDetail
              group={activeGroup}
              getPick={getPick} onPick={togglePick}
              imported={imported}
              getImportedPick={getImportedPick}
            />
          ) : (
            <div className="placeholder">
              <NextMatches getPick={getPick} onPick={togglePick} onSelectGroup={setSelectedGroup} imported={imported} getImportedPick={getImportedPick} />
              <p>Select a group from the left to view matchups</p>
            </div>
          )}
        </main>
      </div>

      {showShare && (
        <SharePicks
          onShare={handleShare}
          onClose={() => setShowShare(false)}
        />
      )}
      {showManage && (
        <ManageFriends
          imported={imported}
          myPicks={picks}
          onImport={addImported}
          onRemove={removeImported}
          onClose={() => setShowManage(false)}
        />
      )}
    </div>
  );
}

export default App
