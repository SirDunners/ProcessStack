import React, { useMemo } from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import ArchitectureBasicsPanel from "./panels/ArchitectureBasicsPanel";
import ArchitectureSystemsPanel from "./panels/ArchitectureSystemsPanel";
import ArchitectureIntegrationsPanel from "./panels/ArchitectureIntegrationsPanel";
import ArchitectureRollupsPanel from "./panels/ArchitectureRollupsPanel";

export default function ArchitectureDetail() {
  const {
    data,
    selectedArchitectureId,
    setSelectedArchitectureId,
    Panel,
    Button,
  } = useProcessStackState();

  const item = useMemo(
    () => (data.architecture ?? []).find((a: any) => a.id === selectedArchitectureId),
    [data.architecture, selectedArchitectureId]
  );

  if (!item) {
    return (
      <Panel title="Architecture">
        <div style={{ color: "#6b7280" }}>Architecture component not found.</div>
        <Button variant="secondary" onClick={() => setSelectedArchitectureId("")}>
          ← Back to Architecture
        </Button>
      </Panel>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ArchitectureBasicsPanel item={item} />
      <ArchitectureSystemsPanel item={item} />
      <ArchitectureIntegrationsPanel item={item} />
      <ArchitectureRollupsPanel item={item} />

      <Button variant="secondary" onClick={() => setSelectedArchitectureId("")}>
        ← Back to Architecture
      </Button>
    </div>
  );
}
