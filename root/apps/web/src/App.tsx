import { useProcessStackState } from "./state/useProcessStackState";

import PersonasTab from "./tabs/PersonasTab";
import ProcessesTab from "./tabs/ProcessesTab";
import DataModelsTab from "./tabs/DataModelsTab";
import SystemsTab from "./tabs/SystemsTab";
import IntegrationsTab from "./tabs/IntegrationsTab";
import ArchitectureTab from "./tabs/ArchitectureTab";
import TransactionsTab from "./tabs/TransactionsTab";

export default function App() {
  const { tab, setTab } = useProcessStackState();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top navigation */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "10px 12px",
          borderBottom: "1px solid #e5e7eb",
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >
        <div style={{ fontWeight: 800, marginRight: 12 }}>PROCESSSTACK</div>

        <NavButton active={tab === "home"} onClick={() => setTab("home")}>
          Home
        </NavButton>

        <NavButton active={tab === "architecture"} onClick={() => setTab("architecture")}>
          Architecture
        </NavButton>

        <NavButton active={tab === "processes"} onClick={() => setTab("processes")}>
          Processes
        </NavButton>

        <NavButton active={tab === "transactions"} onClick={() => setTab("transactions")}>
          Transactions
        </NavButton>

        <NavButton active={tab === "personas"} onClick={() => setTab("personas")}>
          Personas
        </NavButton>

        <NavButton active={tab === "dataModels"} onClick={() => setTab("dataModels")}>
          Data Models
        </NavButton>

        <NavButton active={tab === "systems"} onClick={() => setTab("systems")}>
          Systems
        </NavButton>

        <NavButton active={tab === "integrations"} onClick={() => setTab("integrations")}>
          Integrations
        </NavButton>

        <NavButton active={tab === "run"} onClick={() => setTab("run")}>
          Run
        </NavButton>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {tab === "architecture" && <ArchitectureTab />}
        {tab === "processes" && <ProcessesTab />}
        {tab === "transactions" && <TransactionsTab />}
        {tab === "personas" && <PersonasTab />}
        {tab === "dataModels" && <DataModelsTab />}
        {tab === "systems" && <SystemsTab />}
        {tab === "integrations" && <IntegrationsTab />}

        {tab === "run" && (
          <div style={{ padding: 16 }}>
            <h2 style={{ margin: 0, marginBottom: 8 }}>Run</h2>
            <div style={{ color: "#6b7280" }}>
              Run tab content isn’t built yet — placeholder so navigation works.
            </div>
          </div>
        )}

        {tab === "home" && (
          <div style={{ padding: 16 }}>
            <h2 style={{ margin: 0, marginBottom: 8 }}>Welcome to ProcessStack</h2>
            <div style={{ color: "#6b7280" }}>
              Use the navigation above to open tabs.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid " + (active ? "#111827" : "#e5e7eb"),
        background: active ? "#111827" : "white",
        color: active ? "white" : "#111827",
        cursor: "pointer",
        fontSize: 13
      }}
    >
      {children}
    </button>
  );
}
