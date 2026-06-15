import { useState } from "react";
import { getGroups } from "./data/teams";
import { GroupSidebar } from "./components/GroupSidebar";
import { GroupDetail } from "./components/GroupDetail";
import "./App.css";

function App() {
  const groups = getGroups();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const activeGroup = groups.find((g) => g.name === selectedGroup) ?? null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>World Cup 2026 — Group Stage</h1>
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
            <GroupDetail group={activeGroup} />
          ) : (
            <div className="placeholder">
              <p>Select a group from the left to view matchups</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App
