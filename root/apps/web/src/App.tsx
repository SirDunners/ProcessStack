import { useProcessStackState } from "./state/useProcessStackState";
import PersonasTab from "./tabs/PersonasTab";
import ProcessesTab from "./tabs/ProcessesTab";
import DataModelsTab from "./tabs/DataModelsTab";
import SystemsTab from "./tabs/SystemsTab";
import IntegrationsTab from "./tabs/IntegrationsTab";
import ArchitectureTab from "./tabs/ArchitectureTab";

export default function App() {
  const { tab } = useProcessStackState();

  if (tab === "personas") return <PersonasTab />;
  if (tab === "processes") return <ProcessesTab />;
  if (tab === "dataModels") return <DataModelsTab />;
  if (tab === "systems") return <SystemsTab />;
  if (tab === "integrations") return <IntegrationsTab />;
  if (tab === "architecture") return <ArchitectureTab />;

  return <div>Welcome to ProcessStack</div>;
}
