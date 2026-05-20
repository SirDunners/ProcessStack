// PersonaBasicsPanel.tsx
import React, { useState } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function PersonaBasicsPanel({ persona }: any) {
  const { setData, Panel, Input, Textarea } = useProcessStackState();

  const [draft, setDraft] = useState({
    display_name: persona.display_name ?? "",
    description: persona.description ?? "",
  });

  const save = () => {
    setData((d: any) => ({
      ...d,
      personas: (d.personas ?? []).map((p: any) =>
        p.persona_id === persona.persona_id
          ? {
              ...p,
              display_name: draft.display_name.trim(),
              description: draft.description.trim(),
            }
          : p
      ),
    }));
  };

  return (
    <Panel title="Basics">
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Name</div>
          <Input
            value={draft.display_name}
            onChange={(v) => setDraft((d) => ({ ...d, display_name: v }))}
          />
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Description</div>
          <Textarea
            value={draft.description}
            onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
          />
        </div>

        <button onClick={save} style={{ padding: "8px 16px" }}>
          Save Changes
        </button>
      </div>
    </Panel>
  );
}