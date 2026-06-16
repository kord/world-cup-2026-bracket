import { useState, useMemo } from "react";
import { getGroups } from "./data/teams";
import { GroupSidebar } from "./components/GroupSidebar";
import { GroupDetail } from "./components/GroupDetail";
import { FixtureCard } from "./components/FixtureCard";
import { SharePicks } from "./components/SharePicks";
import { ManageFriends } from "./components/ManageFriends";
import { useMatchPicks } from "./data/useMatchPicks";
import { useImportedPicks } from "./data/useImportedPicks";
import { getLiveFixtures, getUpcomingFixtures, getGroupFixtureIds, getFutureFixtureIds } from "./data/fixtures";
import { encodePicks } from "./data/pickEncoding";
import "./App.css";

function NextMatches({
  getPick,
  onPick,
  onSelectGroup,
  imported,
  getImportedPick,
}: {
  getPick: (id: number) => import("./data/useMatchPicks").PickSelection;
  onPick: (id: number, sel: import("./data/useMatchPicks").PickSelection) => void;
  onSelectGroup: (name: string) => void;
  imported: Record<string, import("./data/useImportedPicks").ImportedPickSet>;
  getImportedPick: (id: string, matchId: number) => import("./data/useMatchPicks").PickSelection;
}) {
  const liveFixtures = useMemo(() => getLiveFixtures(), []);
  const upcomingFixtures = useMemo(() => getUpcomingFixtures(), []);

  // Dedupe: upcoming should exclude any fixture already shown in live
  const liveIds = useMemo(() => new Set(liveFixtures.map((f) => f.id)), [liveFixtures]);
  const upcomingFiltered = useMemo(
    () => upcomingFixtures.filter((f) => !liveIds.has(f.id)),
    [upcomingFixtures, liveIds],
  );

  if (liveFixtures.length === 0 && upcomingFiltered.length === 0) return null;

  return (
    <div className="next-matches">
      {liveFixtures.length > 0 && (
        <>
          <p className="next-match-label">
            {liveFixtures.length === 1 ? "Live now" : "Live now"} —{" "}
            <button className="next-match-group-link" onClick={() => onSelectGroup(liveFixtures[0].group)}>
              Group {liveFixtures[0].group}
            </button>
          </p>
          <div className="next-matches-grid">
            {liveFixtures.map((f) => (
              <FixtureCard key={f.id} fixture={f} getPick={getPick} onPick={onPick} imported={imported} getImportedPick={getImportedPick} />
            ))}
          </div>
        </>
      )}

      {upcomingFiltered.length > 0 && (
        <>
          <p className="next-match-label">
            {upcomingFiltered.length === 1 ? "Next match" : "Next matches"} —{" "}
            <button className="next-match-group-link" onClick={() => onSelectGroup(upcomingFiltered[0].group)}>
              Group {upcomingFiltered[0].group}
            </button>
          </p>
          <div className="next-matches-grid">
            {upcomingFiltered.map((f) => (
              <FixtureCard key={f.id} fixture={f} getPick={getPick} onPick={onPick} imported={imported} getImportedPick={getImportedPick} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  const groups = getGroups();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showManage, setShowManage] = useState(false);
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
        <h1 onClick={() => setSelectedGroup(null)}>World Cup 2026 — Group Stage</h1>
        <p className="subtitle">
          48 teams &middot; 12 groups &middot; Pick your winners
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

        <GroupSidebar
          groups={groups}
          selected={selectedGroup}
          onSelect={setSelectedGroup}
          pickCounts={groupPickCounts}
        />
        <main className="main-content">
          {activeGroup ? (
            <GroupDetail
              group={activeGroup}
              getPick={getPick}
              onPick={togglePick}
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
