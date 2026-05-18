import React, { useState } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function SystemBasicsPanel({ system }: any) {
  const { setData, Panel, Input, Textarea } = useProcessStackState();

  const [draft, setDraft] = useState({
    name: system.name ?? "",
    category: system.category ?? "",
    description: system.description ?? "",
  });

  const save = () => {
    setData((d: any) => ({
      ...d,
      systems: (d.systems ?? []).map((s: any) =>
        s.id === system.id
          ? {
              ...s,
              name: draft.name.trim(),
              category: draft.category.trim(),
              description: draft.description.trim(),
            }
          : s
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
          <div style={{ fontSize: 12, color: "#6b7280" }}>Category</div>
          <Input
            value={draft.category}
            onChange={(v) => setDraft((d) => ({ ...d, category: v }))}
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
