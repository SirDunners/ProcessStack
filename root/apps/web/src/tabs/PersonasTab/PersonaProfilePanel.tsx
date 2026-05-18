import React from "react";
import { Panel, Textarea, Button } from "../../components/ui-primitives";
import { useProcessStackState } from "../../state/useProcessStackState";

export default function PersonaProfilePanel({ persona }) {
  const { setData } = useProcessStackState();

  return (
    <Panel title="Profile">
      <div style={{ fontWeight: 800, fontSize: 18 }}>{persona.display_name}</div>

      <div style={{ fontSize: 12, color: "#6b7280" }}>
        {persona.persona_id} • {persona.persona_type} • v{persona.version} • {persona.status}
      </div>

      <div style={{ height: 8 }} />

      <Textarea
        value={persona.description}
        onChange={(v) =>
          setData((d) => ({
            ...d,
            personas: d.personas.map((p) =>
              p.persona_id === persona.persona_id ? { ...p, description: v } : p
            ),
          }))
        }
      />

      <div style={{ height: 8 }} />

      <Button
        variant="secondary"
        onClick={() =>
          navigator.clipboard.writeText(JSON.stringify(persona, null, 2))
        }
      >
        Copy Persona JSON
      </Button>
    </Panel>
  );
}
