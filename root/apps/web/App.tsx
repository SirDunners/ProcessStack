import { useProcessStackState } from "./src/state/useProcessStackState";
import PersonasTab from "./src/tabs/PersonasTab";
import ProcessesTab from "./src/tabs/ProcessesTab";
import DataModelsTab from "./src/tabs/DataModelsTab";
import SystemsTab from "./src/tabs/SystemsTab";
import IntegrationsTab from "./src/tabs/IntegrationsTab";
import ArchitectureTab from "./src/tabs/ArchitectureTab";

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
