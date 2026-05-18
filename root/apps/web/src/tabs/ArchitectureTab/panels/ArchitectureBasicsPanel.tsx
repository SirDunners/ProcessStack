import React, { useState } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function ArchitectureBasicsPanel({ item }: any) {
  const { setData, Panel, Input, Textarea, Select } = useProcessStackState();

  const [draft, setDraft] = useState({
    name: item.name ?? "",
    type: item.type ?? "system",
    description: item.description ?? "",
  });

  const save = () => {
    setData((d: any) => ({
      ...d,
      architecture: (d.architecture ?? []).map((a: any) =>
        a.id === item.id
          ? {
              ...a,
              name: draft.name.trim(),
              type: draft.type,
              description: draft.description.trim(),
            }
          : a
      ),
    }));
  };

  return (
    <Panel title="Basics">
      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Name</div>
          <Input
            value={draft.name}
            onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
          />
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Type</div>
          <Select
            value={draft.type}
            onChange={(v) => setDraft((d) => ({ ...d, type: v }))}
            options={[
              { value: "system", label: "System Architecture" },
              { value: "integration", label: "Integration Architecture" },
              { value: "process", label: "Process Architecture" },
              { value: "data", label: "Data Architecture" },
              { value: "application", label: "Application Architecture" },
            ]}
          />
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Description</div>
          <Textarea
            value={draft.description}
            onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
          />
        </div>

        <button onClick={save}>Save</button>
      </div>
    </Panel>
  );
}
