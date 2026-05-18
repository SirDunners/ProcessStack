import React from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import ProcessList from "./ProcessList";
import ProcessDetail from "./ProcessDetail";

export default function ProcessesTab() {
  const { selectedProcessNodeId } = useProcessStackState();

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!selectedProcessNodeId ? <ProcessList /> : <ProcessDetail />}
    </div>
  );
}
