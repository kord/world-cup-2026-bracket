import { useState, useMemo } from "react";
import { getGroups } from "./data/teams";
import { GroupSidebar } from "./components/GroupSidebar";
import { GroupDetail } from "./components/GroupDetail";
import { FixtureCard } from "./components/FixtureCard";
import { useMatchPicks } from "./data/useMatchPicks";
import { getNextFixtures, getGroupFixtureIds, getFutureFixtureIds } from "./data/fixtures";
import "./App.css";

function NextMatches({
  getPick,
  onPick,
  onSelectGroup,
}: {
  getPick: (id: number) => import("./data/useMatchPicks").PickSelection;
  onPick: (id: number, sel: import("./data/useMatchPicks").PickSelection) => void;
  onSelectGroup: (name: string) => void;
}) {
  const fixtures = useMemo(() => getNextFixtures(), []);
  if (fixtures.length === 0) return null;

  const group = fixtures[0].group;

  return (
    <div className="next-matches">
      <p className="next-match-label">
        {fixtures.length === 1 ? "Next match" : "Next matches"} —{" "}
        <button className="next-match-group-link" onClick={() => onSelectGroup(group)}>
          Group {group}
        </button>
      </p>
      <div className="next-matches-grid">
        {fixtures.map((f) => (
          <FixtureCard key={f.id} fixture={f} getPick={getPick} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}

function App() {
  const groups = getGroups();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const { picks, getPick, togglePick, fillAllHome, fillHome } = useMatchPicks();

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
            />
          ) : (
            <div className="placeholder">
              <NextMatches getPick={getPick} onPick={togglePick} onSelectGroup={setSelectedGroup} />
              <p>Select a group from the left to view matchups</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App
