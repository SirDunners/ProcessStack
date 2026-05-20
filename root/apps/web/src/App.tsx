// App.tsx
import React from "react";
import { useProcessStackState } from "./state/useProcessStackState";
import ResponsiveSidebar from "./ResponsiveSidebar";

export default function App() {
  const { tab, setTab } = useProcessStackState();

  const handleNewRun = () => {
    console.log("🚀 New Run clicked");
    setTab("run");
  };

  const handleResetData = () => {
    if (confirm("Reset all data to seed?")) {
      console.log("🔄 Reset data clicked");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — this is what you wanted working first */}
      <ResponsiveSidebar
        tab={tab}
        setTab={setTab}
        onNewRun={handleNewRun}
        onResetData={handleResetData}
        logoSrc="./assets/ProcessStack.png"
      />

      {/* Main content frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-8">
          {tab === "home" && (
            <div className="max-w-2xl mx-auto">
              <h1 className="text-5xl font-bold tracking-tight mb-4">Welcome to Process Stack</h1>
              <p className="text-xl text-gray-600">
                ✅ Sidebar is now working cleanly.<br />
                Click any menu item on the left to test navigation.
              </p>
            </div>
          )}

          {tab !== "home" && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-semibold">Current tab: {tab}</h2>
              <p className="mt-6 text-gray-500">We'll build the other tabs one by one (starting with Processes next).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}