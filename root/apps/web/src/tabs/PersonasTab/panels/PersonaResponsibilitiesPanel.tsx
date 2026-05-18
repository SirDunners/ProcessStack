import React, { useState } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function PersonaResponsibilitiesPanel({ persona }: any) {
  const { setData, Panel, Textarea } = useProcessStackState();

  const [text, setText] = useState(persona.responsibilities ?? "");

  const save = () => {
    setData((d: any) => ({
      ...d,
      personas: (d.personas ?? []).map((p: any) =>
        p.persona_id === persona.persona_id
          ? { ...p, responsibilities: text }
          : p
      ),
    }));
  };

  return (
    <Panel title="Responsibilities">
      <Textarea
        value={text}
        onChange={setText}
        placeholder="Describe this persona's responsibilities..."
      />
      <button onClick={save}>Save</button>
    </Panel>
  );
}
