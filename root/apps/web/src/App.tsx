// App.tsx
import React from "react";
import { useProcessStackState } from "./state/useProcessStackState";

import ResponsiveSidebar from "./ResponsiveSidebar";
import ProcessesTab from "./tabs/processes/index";   // ← explicit /index (this fixes the error)

export default function App() {
  const { tab, setTab, data, setData, selectedProcessNodeId, setSelectedProcessNodeId, Panel, Button, Input, Select } = useProcessStackState();

  const handleNewRun = () => {
    console.log("🚀 New Run clicked");
    setTab("run");
  };

  const handleResetData = () => {
    if (confirm("Reset ALL data back to seed? This cannot be undone.")) {
      console.log("🔄 Reset data triggered");
      // resetAllData will be connected in the next step
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Your beautiful responsive sidebar */}
      <ResponsiveSidebar
        tab={tab}
        setTab={setTab}
        onNewRun={handleNewRun}
        onResetData={handleResetData}
        logoSrc="./assets/ProcessStack.png"
      />

      {/* Main content area */}
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