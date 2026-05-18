import React, { useMemo } from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import SystemBasicsPanel from "./panels/SystemBasicsPanel";
import SystemModulesPanel from "./panels/SystemModulesPanel";
import SystemRollupsPanel from "./panels/SystemRollupsPanel";

export default function SystemDetail() {
  const {
    data,
    selectedSystemId,
    setSelectedSystemId,
    Panel,
    Button,
  } = useProcessStackState();

  const system = useMemo(
    () => (data.systems ?? []).find((s: any) => s.id === selectedSystemId),
    [data.systems, selectedSystemId]
  );

  if (!system) {
    return (
      <Panel title="System">
        <div style={{ color: "#6b7280" }}>System not found.</div>
        <Button variant="secondary" onClick={() => setSelectedSystemId("")}>
          ← Back to Systems
        </Button>
      </Panel>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <SystemBasicsPanel system={system} />
      <SystemModulesPanel system={system} />
      <SystemRollupsPanel system={system} />

      <Button variant="secondary" onClick={() => setSelectedSystemId("")}>
        ← Back to Systems
      </Button>
    </div>
  );
}
