import React from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import SystemList from "./SystemList";
import SystemDetail from "./SystemDetail";

export default function SystemsTab() {
  const { selectedSystemId } = useProcessStackState();

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!selectedSystemId ? <SystemList /> : <SystemDetail />}
    </div>
  );
}
