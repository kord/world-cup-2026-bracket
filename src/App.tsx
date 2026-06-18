import { useState, useMemo, type SetStateAction } from "react";
import { getGroups } from "./data/teams";
import { GroupSidebar } from "./components/GroupSidebar";
import { GroupDetail } from "./components/GroupDetail";
import { NextMatches } from "./components/NextMatches";
import { KnockoutBracket } from "./components/KnockoutBracket";
import { SharePicks } from "./components/SharePicks";
import { ManageFriends } from "./components/ManageFriends";
import { Leaderboard } from "./components/Leaderboard";
import { Toolbar } from "./components/Toolbar";
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
  const [view, setView] = useState<"group" | "knockout" | "leaderboard">("group");
  const { picks, getPick, togglePick, fillAllHome, fillHome, fillAllAway } = useMatchPicks();
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

        <h1 onClick={() => setSelectedGroup(null)}>
          World Cup 2026 — {view === "group" ? "Group Stage" : view === "knockout" ? "Knockout Phase" : "Leaderboard"}
        </h1>
        <p className="subtitle">
          {view === "group"
            ? "48 teams · 12 groups · Pick your winners"
            : view === "knockout"
              ? "Round of 32 → Final · Coming soon"
              : "Track your picks against friends"}
        </p>
        <Toolbar
          allFuturePicked={allFuturePicked}
          confirmClear={confirmClear}
          onClear={handleClear}
          onClearBlur={() => setConfirmClear(false)}
          onShare={() => setShowShare(true)}
          onManageFriends={() => setShowManage(true)}
          view={view}
          onViewChange={setView}
        />
      </header>

      {import.meta.env.DEV && (
        <div className="dev-toolbar">
          <button className="clear-picks-btn dev-btn" onClick={() => fillHome(futureIds)}>
            Fill future home
          </button>
          <button className="clear-picks-btn dev-btn" onClick={() => fillAllHome()}>
            Fill all home
          </button>
          <button className="clear-picks-btn dev-btn" onClick={() => fillAllAway()}>
            Fill all away
          </button>
        </div>
      )}

      <div className="app-body">
        {view === "group" && (
          <GroupSidebar
            groups={groups}
            selected={selectedGroup}
            onSelect={setSelectedGroup}
            pickCounts={groupPickCounts}
          />
        )}

        <main className="main-content">
          {view === "leaderboard" ? (
            <Leaderboard
              groups={groups}
              groupFixtureIds={groupFixtureIds}
              myPicks={picks}
              imported={imported}
              onSelectGroup={(group: SetStateAction<string | null>) => { setSelectedGroup(group); setView("group"); }}
            />
          ) : view === "knockout" ? (
            <KnockoutBracket />
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
