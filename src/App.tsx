import { useState, useMemo } from "react";
import { getGroups } from "./data/teams";
import { GroupSidebar } from "./components/GroupSidebar";
import { GroupDetail } from "./components/GroupDetail";
import { FixtureCard } from "./components/FixtureCard";
import { useMatchPicks } from "./data/useMatchPicks";
import { getNextFixtures } from "./data/fixtures";
import "./App.css";

function NextMatches({
  getPick,
  onPick,
}: {
  getPick: (id: number) => import("./data/useMatchPicks").PickSelection;
  onPick: (id: number, sel: import("./data/useMatchPicks").PickSelection) => void;
}) {
  const fixtures = useMemo(() => getNextFixtures(), []);
  if (fixtures.length === 0) return null;

  return (
    <div className="next-matches">
      <p className="next-match-label">
        {fixtures.length === 1 ? "Next match" : "Next matches"}
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
  const { getPick, togglePick } = useMatchPicks();

  const activeGroup = groups.find((g) => g.name === selectedGroup) ?? null;

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={() => setSelectedGroup(null)}>World Cup 2026 — Group Stage</h1>
        <p className="subtitle">
          48 teams &middot; 12 groups &middot; Pick your winners
        </p>
      </header>

      <div className="app-body">

        <GroupSidebar
          groups={groups}
          selected={selectedGroup}
          onSelect={setSelectedGroup}
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
              <NextMatches getPick={getPick} onPick={togglePick} />
              <p>Select a group from the left to view matchups</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App
