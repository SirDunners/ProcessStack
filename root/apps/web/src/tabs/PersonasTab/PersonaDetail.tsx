import React, { useMemo } from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import PersonaBasicsPanel from "./panels/PersonaBasicsPanel";
import PersonaResponsibilitiesPanel from "./panels/PersonaResponsibilitiesPanel";
import PersonaSystemsPanel from "./panels/PersonaSystemsPanel";
import PersonaProcessesPanel from "./panels/PersonaProcessesPanel";
import PersonaTransactionsPanel from "./panels/PersonaTransactionsPanel";
import PersonaRollupsPanel from "./panels/PersonaRollupsPanel";

export default function PersonaDetail() {
  const {
    data,
    selectedPersonaId,
    setSelectedPersonaId,
    Panel,
    Button,
  } = useProcessStackState();

  const persona = useMemo(
    () =>
      (data.personas ?? []).find(
        (p: any) => p.persona_id === selectedPersonaId
      ),
    [data.personas, selectedPersonaId]
  );

  if (!persona) {
    return (
      <Panel title="Persona">
        <div style={{ color: "#6b7280" }}>Persona not found.</div>
        <Button variant="secondary" onClick={() => setSelectedPersonaId("")}>
          ← Back to Personas
        </Button>
      </Panel>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <PersonaBasicsPanel persona={persona} />
      <PersonaResponsibilitiesPanel persona={persona} />
      <PersonaSystemsPanel persona={persona} />
      <PersonaProcessesPanel persona={persona} />
      <PersonaTransactionsPanel persona={persona} />
      <PersonaRollupsPanel persona={persona} />

      <Button variant="secondary" onClick={() => setSelectedPersonaId("")}>
        ← Back to Personas
      </Button>
    </div>
  );
}
