import React from "react";
import { useProcessStackState } from "../state/useProcessStackState";

import { Panel, Button, Input, Textarea, Select } from "../components/ui-primitives";
import { ResponsiveSidebar } from "../components/ResponsiveSidebar";

import ProcessesTab from "../tabs/ProcessesTab";
import DataModelsTab from "../tabs/DataModelsTab";
import ArchitectureTab from "../tabs/ArchitectureTab";

import psLogo from "../assets/psLogo.png";

export default function ProcessStackPage() {
  const state = useProcessStackState();

  const {
    tab,
    setTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    resetRun,
    resetAllData,
    setSelectedTransactionId,
    data,
    setData,
    processesDeepLinkL4Id,
    setProcessesDeepLinkL4Id,
    setTransactionsInitialView,
  } = state;

  return (
    <div style={{ padding: 16, background: "#f7f7f7", minHeight: "100vh", fontFamily: "system-ui, Arial" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: sidebarCollapsed ? "88px 1fr" : "280px 1fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        <ResponsiveSidebar
          tab={tab}
          setTab={setTab}
          logoSrc={psLogo}
          onCollapseChange={setSidebarCollapsed}
          onNewRun={() => {
            setTab("run");
            resetRun();
          }}
          onResetData={() => {
            const ok = window.confirm("Reset everything back to the default seed data?");
            if (ok) resetAllData();
          }}
          clearSelectedTransaction={() => setSelectedTransactionId("")}
        />

        <div style={{ display: "grid", gap: 14 }}>
          {/* HOME TAB */}
          {tab === "home" && (
            <Panel title="Welcome">
              {/* ... your home JSX ... */}
            </Panel>
          )}

          {/* PROCESSES TAB */}
          {tab === "processes" && (
            <ProcessesTab
              data={data}
              setData={setData}
              setTab={setTab}
              setSelectedTransactionId={setSelectedTransactionId}
              setTransactionsInitialView={setTransactionsInitialView}
              Panel={Panel}
              Button={Button}
              Select={Select}
              Input={Input}
              Textarea={Textarea}
              deepLinkL4Id={processesDeepLinkL4Id}
              clearDeepLinkL4Id={() => setProcessesDeepLinkL4Id("")}
            />
          )}

          {/* DATA MODELS TAB */}
          {tab === "dataModels" && (
            <DataModelsTab
              data={data}
              setData={setData}
              Panel={Panel}
              Button={Button}
              Input={Input}
              Textarea={Textarea}
              Select={Select}
            />
          )}

          {/* ARCHITECTURE TAB */}
          {tab === "architecture" && (
            <ArchitectureTab
              data={data}
              setData={setData}
              Panel={Panel}
              Button={Button}
              Input={Input}
              Textarea={Textarea}
              Select={Select}
            />
          )}
        </div>
      </div>
    </div>
  );
}
