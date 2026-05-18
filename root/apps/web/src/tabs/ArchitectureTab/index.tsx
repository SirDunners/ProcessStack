import React from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import ArchitectureList from "./ArchitectureList";
import ArchitectureDetail from "./ArchitectureDetail";

export default function ArchitectureTab() {
  const { selectedArchitectureId } = useProcessStackState();

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!selectedArchitectureId ? <ArchitectureList /> : <ArchitectureDetail />}
    </div>
  );
}
