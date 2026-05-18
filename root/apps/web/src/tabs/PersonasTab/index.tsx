import React from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import PersonaList from "./PersonaList";
import PersonaDetail from "./PersonaDetail";

export default function PersonasTab() {
  const { selectedPersonaId } = useProcessStackState();

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!selectedPersonaId ? <PersonaList /> : <PersonaDetail />}
    </div>
  );
}
