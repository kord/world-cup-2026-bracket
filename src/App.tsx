import { useState, useMemo, useEffect, useRef, type SetStateAction } from "react";
import { getGroups } from "./data/teams";
import { GroupSidebar } from "./components/GroupSidebar";
import { GroupDetail } from "./components/GroupDetail";
import { NextMatches } from "./components/NextMatches";
import { KnockoutBracket } from "./components/KnockoutBracket";
import { ManageFriends } from "./components/ManageFriends";
import { Leaderboard } from "./components/Leaderboard";
import { Toolbar } from "./components/Toolbar";
import { useMatchPicks } from "./data/useMatchPicks";
import { useImportedPicks } from "./data/useImportedPicks";
import { getGroupFixtureIds, getFutureFixtureIds } from "./data/fixtures";
import { decodePicks } from "./data/pickEncoding";
import { AllTeamsModal } from "./components/AllTeamsModal";
import { useKnockoutPicks } from "./data/useKnockoutPicks";

function App() {
  const groups = getGroups();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(() => {
    // Read initial group from URL (only valid for group view)
    const p = new URLSearchParams(window.location.search);
    const g = p.get("group");
    if (g && /^[A-L]$/i.test(g)) return g.toUpperCase();
    return null;
  });
  const [confirmClear, setConfirmClear] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [knockoutMode, setKnockoutMode] = useState<"actual" | "picks">("actual");
  const [addedFriendName, setAddedFriendName] = useState<string | null>(null);
  const urlProcessed = useRef(false);
  const [view, setView] = useState<"group" | "knockout" | "leaderboard">(() => {
    // Read initial view from URL — default is knockout
    const p = new URLSearchParams(window.location.search).get("view");
    if (p === "leaderboard") return p;
    if (p === "group" || p === "schedule") return "group";
    return "knockout";
  });
  const { picks, getPick, togglePick, fillAllHome, fillHome, fillAllAway } = useMatchPicks();
  const { imported, addImported, removeImported, getImportedPick } = useImportedPicks();
  const { picks: koPicks } = useKnockoutPicks();
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

  // Handle ?add=xyz URL parameter on first load
  useEffect(() => {
    if (urlProcessed.current) return;
    urlProcessed.current = true;
    const params = new URLSearchParams(window.location.search);
    const addCode = params.get("add");
    if (!addCode) return;
    urlProcessed.current = true;

    // Decode first to get the name
    const decoded = decodePicks(addCode);
    if (!decoded) return;

    // Check if a friend with this name is already imported
    const stored = localStorage.getItem("wc2026-imported-picks");
    const existing: Record<string, { name: string }> = stored ? JSON.parse(stored) : {};
    const alreadyExists = Object.values(existing).some((f) => f.name === decoded.name);
    if (alreadyExists) {
      // Still clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("add");
      window.history.replaceState({}, "", url);
      return;
    }

    const result = addImported(addCode);
    if (result) {
      setAddedFriendName(result.name);
    }

    // Clean the URL
    const url = new URL(window.location.href);
    url.searchParams.delete("add");
    window.history.replaceState({}, "", url);
  }, [addImported]);

  // Sync view + selected group to URL so links are shareable
  useEffect(() => {
    const url = new URL(window.location.href);
    if (view === "knockout") {
      // knockout is the default — clean URL
      url.searchParams.delete("view");
      url.searchParams.delete("group");
    } else if (view === "group") {
      url.searchParams.set("view", "schedule");
      if (selectedGroup) {
        url.searchParams.set("group", selectedGroup);
      } else {
        url.searchParams.delete("group");
      }
    } else {
      url.searchParams.set("view", view);
      url.searchParams.delete("group");
    }
    window.history.replaceState(null, "", url);
  }, [view, selectedGroup]);

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
        <div className="header-title" onClick={() => { setSelectedGroup(null); setView("knockout"); }}>
          <img className="header-icon" src="/football.svg" alt="" />
          <div>
            <h1>World Cup 2026</h1>
            <p className="subtitle">
              {view === "group"
                ? "Group Stage — 48 teams · 12 groups · Pick your winners"
                : view === "knockout"
                  ? "Knockout Phase — Round of 32 → Final"
                  : "Leaderboard — Track your picks against friends"}
            </p>
          </div>
        </div>
        <Toolbar
          confirmClear={confirmClear}
          onClear={handleClear}
          onClearBlur={() => setConfirmClear(false)}
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
          <button className="clear-picks-btn dev-btn" onClick={() => setShowAllTeams(true)}>
            All teams
          </button>
          <button className="clear-picks-btn dev-btn" onClick={() => setKnockoutMode(m => m === "actual" ? "picks" : "actual")}>
            KO: {knockoutMode === "actual" ? "Actual" : "My Picks"}
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
            <KnockoutBracket mode={knockoutMode} />
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

      {showManage && (
        <ManageFriends
          imported={imported}
          myPicks={picks}
          onImport={addImported}
          onRemove={removeImported}
          onClose={() => setShowManage(false)}
          myKnockoutPicks={koPicks}
        />
      )}

      {showAllTeams && (
        <AllTeamsModal onClose={() => setShowAllTeams(false)} />
      )}

      {addedFriendName && (
        <div className="import-overlay" onClick={() => setAddedFriendName(null)}>
          <div className="import-modal" onClick={e => e.stopPropagation()}>
            <h3>Friend added</h3>
            <p className="import-success">{addedFriendName} has been added to your friends.</p>
            <div className="import-actions">
              <button className="import-btn import-btn-primary" onClick={() => setAddedFriendName(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
