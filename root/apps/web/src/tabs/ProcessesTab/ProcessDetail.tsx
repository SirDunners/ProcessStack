import React, { useMemo } from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import L2Panel from "./panels/L2Panel";
import L3Panel from "./panels/L3Panel";
import L4Panel from "./panels/L4Panel";

export default function ProcessDetail() {
  const {
    data,
    selectedProcessNodeId,
    setSelectedProcessNodeId,
    Panel,
    Button,
  } = useProcessStackState();

  const { l2, l3, l4 } = useMemo(() => {
    const l2 = (data.l2_process_areas ?? []).find((x: any) => x.id === selectedProcessNodeId);
    const l3 = (data.l3_process_nodes ?? []).find((x: any) => x.id === selectedProcessNodeId);
    const l4 = (data.l4_process_nodes ?? []).find((x: any) => x.id === selectedProcessNodeId);
    return { l2, l3, l4 };
  }, [data, selectedProcessNodeId]);

  const level = l4 ? "l4" : l3 ? "l3" : l2 ? "l2" : "unknown";

  if (level === "unknown") {
    return (
      <Panel title="Process detail">
        <div style={{ color: "#6b7280" }}>No process node found.</div>
        <div style={{ height: 8 }} />
        <Button variant="secondary" onClick={() => setSelectedProcessNodeId("")}>
          ← Back to Processes
        </Button>
      </Panel>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {level === "l2" && <L2Panel node={l2} />}
      {level === "l3" && <L3Panel node={l3} />}
      {level === "l4" && <L4Panel node={l4} />}

      <Button variant="secondary" onClick={() => setSelectedProcessNodeId("")}>
        ← Back to Processes
      </Button>
    </div>
  );
}
