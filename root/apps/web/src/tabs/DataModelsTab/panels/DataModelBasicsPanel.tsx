import React, { useState } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function DataModelBasicsPanel({ model }: any) {
  const { setData, Panel, Input, Textarea, Select, data } =
    useProcessStackState();

  const [draft, setDraft] = useState({
    name: model.name ?? "",
    description: model.description ?? "",
    system: model.system ?? "",
  });

  const systemOptions =
    (data.systems ?? []).map((s: any) => ({
      value: s.id,
      label: s.name,
    })) ?? [];

  const save = () => {
    setData((d: any) => ({
      ...d,
      data_models: (d.data_models ?? []).map((m: any) =>
        m.id === model.id
          ? {
              ...m,
              name: draft.name.trim(),
              description: draft.description.trim(),
              system: draft.system,
            }
          : m
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
          <div style={{ fontSize: 12, color: "#6b7280" }}>Description</div>
          <Textarea
            value={draft.description}
            onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
          />
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Owning System</div>
          <Select
            value={draft.system}
            onChange={(v) => setDraft((d) => ({ ...d, system: v }))}
            options={[{ value: "", label: "None" }, ...systemOptions]}
          />
        </div>

        <button onClick={save}>Save</button>
      </div>
    </Panel>
  );
}
