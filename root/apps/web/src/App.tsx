// App.tsx
import React from "react";
import { useProcessStackState } from "./state/useProcessStackState";

import ResponsiveSidebar from "./ResponsiveSidebar";

// New modular Processes tab (uses your index.tsx + panels/)
import ProcessesTab from "./tabs/processes";

export default function App() {
  const { tab, setTab } = useProcessStackState();

  const handleNewRun = () => {
    console.log("New Run clicked");
    setTab("run");
  };

  const handleResetData = () => {
    if (confirm("Reset all data to seed? This cannot be undone.")) {
      console.log("Reset data triggered");
      // TODO: connect to your real resetAllData() later
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Beautiful responsive sidebar */}
      <ResponsiveSidebar
        tab={tab}
        setTab={setTab}
        onNewRun={handleNewRun}
        onResetData={handleResetData}
        logoSrc="./assets/ProcessStack.png"   // adjust if your logo path is different
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {tab === "home" && (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome to Process Stack</h1>
              <p className="text-gray-600">Your process intelligence platform.</p>
            </div>
          )}

          {tab === "processes" && <ProcessesTab />}

          {tab === "transactions" && <div className="text-xl font-medium">Transactions Tab — coming next</div>}
          {tab === "personas" && <div className="text-xl font-medium">Personas Tab — coming next</div>}
          {tab === "architecture" && <div className="text-xl font-medium">Architecture Tab — coming next</div>}
          {tab === "dataModels" && <div className="text-xl font-medium">Data Models Tab — coming next</div>}
          {tab === "run" && <div className="text-xl font-medium">Run / Evidence Tab — coming next</div>}
        </div>
      </div>
    </div>
  );
}